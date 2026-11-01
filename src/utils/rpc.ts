import { createPublicClient, http, type Block, type Hash } from 'viem';
import { botchainTestnet } from '../config/chains';

export const publicClient = createPublicClient({
  chain: botchainTestnet,
  transport: http('https://rpc.bohr.life', {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
});

export interface ExtendedBlockInfo {
  block: Block;
  previousBlock?: Block | null;
  deltaSeconds?: number;
  gasUtilization: number; // percentage 0-100
  timeSinceCreatedSeconds: number;
}

/**
 * Fetch latest block with previous block delta
 */
export async function fetchBlockWithDelta(
  blockNumberOrHash?: bigint | Hash | 'latest'
): Promise<ExtendedBlockInfo> {
  let block: Block;

  if (!blockNumberOrHash || blockNumberOrHash === 'latest') {
    block = await publicClient.getBlock({ blockTag: 'latest' });
  } else if (typeof blockNumberOrHash === 'bigint') {
    block = await publicClient.getBlock({ blockNumber: blockNumberOrHash });
  } else {
    block = await publicClient.getBlock({ blockHash: blockNumberOrHash as Hash });
  }

  let previousBlock: Block | null = null;
  let deltaSeconds: number | undefined = undefined;

  if (block.number !== null && block.number !== undefined && block.number > 0n) {
    try {
      previousBlock = await publicClient.getBlock({
        blockNumber: block.number - 1n,
      });
      deltaSeconds = Number(block.timestamp - previousBlock.timestamp);
    } catch (e) {
      console.warn('Could not fetch previous block:', e);
    }
  }

  const gasLimit = Number(block.gasLimit || 1n);
  const gasUsed = Number(block.gasUsed || 0n);
  const gasUtilization = (gasUsed / gasLimit) * 100;
  const now = Math.floor(Date.now() / 1000);
  const timeSinceCreatedSeconds = Math.max(0, now - Number(block.timestamp));

  return {
    block,
    previousBlock,
    deltaSeconds,
    gasUtilization,
    timeSinceCreatedSeconds,
  };
}

/**
 * Fetch the last N blocks to calculate moving average block time and gas metrics
 */
export async function fetchRecentBlocks(count: number = 10): Promise<{
  blocks: Block[];
  averageBlockTime: number;
  averageGasUsed: bigint;
  averageGasLimit: bigint;
}> {
  const latest = await publicClient.getBlock({ blockTag: 'latest' });
  const blockPromises: Promise<Block>[] = [Promise.resolve(latest)];

  const latestNum = latest.number ?? 0n;
  const startBlockNumber = latestNum > BigInt(count) ? latestNum - BigInt(count - 1) : 0n;

  for (let b = latestNum - 1n; b >= startBlockNumber; b--) {
    blockPromises.push(publicClient.getBlock({ blockNumber: b }));
  }

  const blocks = await Promise.all(blockPromises);
  // Sort descending by block number
  blocks.sort((a, b) => Number((b.number ?? 0n) - (a.number ?? 0n)));

  // Compute average block time
  let totalDelta = 0;
  let deltasCount = 0;
  let totalGas = 0n;
  let totalGasLimit = 0n;

  for (let i = 0; i < blocks.length - 1; i++) {
    const diff = Number(blocks[i].timestamp - blocks[i + 1].timestamp);
    if (diff >= 0) {
      totalDelta += diff;
      deltasCount++;
    }
    totalGas += blocks[i].gasUsed;
    totalGasLimit += blocks[i].gasLimit;
  }

  const averageBlockTime = deltasCount > 0 ? totalDelta / deltasCount : 3; // Fallback 3s for typical POS/Bohr chain
  const averageGasUsed = blocks.length > 0 ? totalGas / BigInt(blocks.length) : 0n;
  const averageGasLimit = blocks.length > 0 ? totalGasLimit / BigInt(blocks.length) : 0n;

  return {
    blocks,
    averageBlockTime: Math.max(0.5, averageBlockTime),
    averageGasUsed,
    averageGasLimit,
  };
}

/**
 * Predict block number for a given target deadline (timestamp in seconds)
 */
export function projectBlockForDeadline(
  targetDeadlineTimestamp: number,
  latestBlockNumber: bigint,
  latestBlockTimestamp: number,
  averageBlockTime: number
): {
  projectedBlock: bigint;
  deltaSeconds: number;
  blocksRemaining: bigint;
  hasPassed: boolean;
} {
  const deltaSeconds = targetDeadlineTimestamp - latestBlockTimestamp;
  const effectiveBlockTime = averageBlockTime > 0 ? averageBlockTime : 3;

  if (deltaSeconds <= 0) {
    const blocksElapsed = BigInt(Math.round(Math.abs(deltaSeconds) / effectiveBlockTime));
    const projectedBlock = latestBlockNumber > blocksElapsed ? latestBlockNumber - blocksElapsed : 0n;
    return {
      projectedBlock,
      deltaSeconds,
      blocksRemaining: 0n,
      hasPassed: true,
    };
  } else {
    const blocksRemaining = BigInt(Math.round(deltaSeconds / effectiveBlockTime));
    const projectedBlock = latestBlockNumber + blocksRemaining;
    return {
      projectedBlock,
      deltaSeconds,
      blocksRemaining,
      hasPassed: false,
    };
  }
}
