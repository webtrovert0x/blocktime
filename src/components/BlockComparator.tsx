import React, { useState } from 'react';
import { publicClient } from '../utils/rpc';
import type { Block } from 'viem';
import {
  formatTimestamp,
  formatUtc,
  formatDurationSeconds,
  formatNumberWithCommas,
} from '../utils/formatters';
import { ArrowLeftRight, Clock, Zap, Layers, AlertCircle, ArrowRight } from 'lucide-react';

interface BlockComparatorProps {
  initialBlockA?: string;
  initialBlockB?: string;
  onSendToInvestigation: (blockNum: string, notes?: string) => void;
}

export const BlockComparator: React.FC<BlockComparatorProps> = ({
  initialBlockA = '',
  initialBlockB = '',
  onSendToInvestigation,
}) => {
  const [blockAInput, setBlockAInput] = useState(initialBlockA);
  const [blockBInput, setBlockBInput] = useState(initialBlockB);
  const [blockA, setBlockA] = useState<Block | null>(null);
  const [blockB, setBlockB] = useState<Block | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = async () => {
    if (!blockAInput || !blockBInput) {
      setError('Please provide both Block A and Block B numbers or hashes.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pA = blockAInput.startsWith('0x')
        ? publicClient.getBlock({ blockHash: blockAInput as `0x${string}` })
        : publicClient.getBlock({ blockNumber: BigInt(blockAInput) });

      const pB = blockBInput.startsWith('0x')
        ? publicClient.getBlock({ blockHash: blockBInput as `0x${string}` })
        : publicClient.getBlock({ blockNumber: BigInt(blockBInput) });

      const [resA, resB] = await Promise.all([pA, pB]);
      setBlockA(resA);
      setBlockB(resB);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch one or both blocks. Please check the values.');
    } finally {
      setIsLoading(false);
    }
  };

  const setRelativeQuickPreset = (offset: number) => {
    if (!blockAInput) return;
    try {
      const numA = BigInt(blockAInput);
      const numB = numA > BigInt(offset) ? numA - BigInt(offset) : 0n;
      setBlockBInput(numB.toString());
    } catch (e) {
      // ignore
    }
  };

  // Calculations if both blocks exist
  const numA = blockA?.number ?? 0n;
  const numB = blockB?.number ?? 0n;
  const blockNumberDiff = blockA && blockB ? Number(numA - numB) : 0;
  const timeDiff = blockA && blockB ? Number(blockA.timestamp - blockB.timestamp) : 0;
  const absTimeDiff = Math.abs(timeDiff);
  const absBlockDiff = Math.abs(blockNumberDiff);

  const averageBlockTime =
    absBlockDiff > 0 ? (absTimeDiff / absBlockDiff).toFixed(3) : '0';

  const gasUtilA = blockA ? (Number(blockA.gasUsed) / Number(blockA.gasLimit || 1n)) * 100 : 0;
  const gasUtilB = blockB ? (Number(blockB.gasUsed) / Number(blockB.gasLimit || 1n)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Comparator Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <ArrowLeftRight className="w-5 h-5 text-blue-600" />
          <span>Compare Block Timestamps & Progression</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Select any two blocks on BOTChain Testnet to analyze elapsed time, progression speed, average block
          duration, and gas utilization shifts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Block A (Target / Later)</label>
            <input
              type="text"
              placeholder="e.g. 100050"
              value={blockAInput}
              onChange={(e) => setBlockAInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Block B (Baseline / Earlier)</label>
            <input
              type="text"
              placeholder="e.g. 100000"
              value={blockBInput}
              onChange={(e) => setBlockBInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {/* Quick offset buttons */}
            <div className="flex gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              <button
                type="button"
                onClick={() => setRelativeQuickPreset(1)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                Previous (-1)
              </button>
              <button
                type="button"
                onClick={() => setRelativeQuickPreset(10)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                -10 Blocks
              </button>
              <button
                type="button"
                onClick={() => setRelativeQuickPreset(100)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                -100 Blocks
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={fetchBlocks}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Comparing...' : 'Run Comparison'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {blockA && blockB && (
        <div className="space-y-6">
          {/* Summary Delta Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-200 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-blue-700">
                  Progression Analysis
                </span>
                <h4 className="text-xl font-bold text-blue-950 mt-0.5">
                  Block #{numA.toString()} vs #{numB.toString()}
                </h4>
              </div>
              <button
                onClick={() =>
                  onSendToInvestigation(
                    numA.toString(),
                    `Comparison with block #${numB.toString()}: delta=${absBlockDiff} blocks, time=${absTimeDiff}s, avg=${averageBlockTime}s/block`
                  )
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Record this Audit to Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/80 backdrop-blur rounded-xl p-3.5 border border-blue-100">
                <span className="text-xs text-slate-500 font-medium">Elapsed Time (&Delta;t)</span>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {formatDurationSeconds(absTimeDiff)}
                </div>
                <div className="text-xs text-blue-700 mt-1 font-mono">
                  {absTimeDiff} total seconds
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-xl p-3.5 border border-blue-100">
                <span className="text-xs text-slate-500 font-medium">Block Height Delta (&Delta;blocks)</span>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {absBlockDiff} blocks
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {blockNumberDiff >= 0 ? 'A is ahead of B' : 'B is ahead of A'}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-xl p-3.5 border border-blue-100">
                <span className="text-xs text-slate-500 font-medium">Average Block Duration</span>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {averageBlockTime}s
                </div>
                <div className="text-xs text-green-700 mt-1 font-medium">
                  {absBlockDiff > 0 ? 'Production Rate Verified' : 'Same block selected'}
                </div>
              </div>
            </div>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Block A Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-slate-100 border-b">
                <h4 className="font-bold text-slate-900">Block A (Target)</h4>
                <span className="font-mono text-sm font-semibold text-blue-600">
                  #{numA.toString()}
                </span>
              </div>
              <div className="space-y-3 mt-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Timestamp:</span>
                  <span className="font-mono font-bold text-slate-800">{blockA.timestamp.toString()}</span>
                  <span className="text-slate-400 block text-[11px]">{formatUtc(blockA.timestamp)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gas Used / Limit:</span>
                  <span className="font-mono text-slate-800">
                    {formatNumberWithCommas(blockA.gasUsed)} / {formatNumberWithCommas(blockA.gasLimit)}
                  </span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, gasUtilA)}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500">{gasUtilA.toFixed(2)}% utilization</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transactions:</span>
                  <span className="font-bold text-slate-800">
                    {Array.isArray(blockA.transactions) ? blockA.transactions.length : 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Miner:</span>
                  <span className="font-mono text-[11px] text-slate-600 break-all">{blockA.miner}</span>
                </div>
              </div>
            </div>

            {/* Block B Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-slate-100 border-b">
                <h4 className="font-bold text-slate-900">Block B (Baseline)</h4>
                <span className="font-mono text-sm font-semibold text-blue-600">
                  #{numB.toString()}
                </span>
              </div>
              <div className="space-y-3 mt-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Timestamp:</span>
                  <span className="font-mono font-bold text-slate-800">{blockB.timestamp.toString()}</span>
                  <span className="text-slate-400 block text-[11px]">{formatUtc(blockB.timestamp)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gas Used / Limit:</span>
                  <span className="font-mono text-slate-800">
                    {formatNumberWithCommas(blockB.gasUsed)} / {formatNumberWithCommas(blockB.gasLimit)}
                  </span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, gasUtilB)}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500">{gasUtilB.toFixed(2)}% utilization</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transactions:</span>
                  <span className="font-bold text-slate-800">
                    {Array.isArray(blockB.transactions) ? blockB.transactions.length : 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Miner:</span>
                  <span className="font-mono text-[11px] text-slate-600 break-all">{blockB.miner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
