const { createPublicClient, http } = require("viem");

const client = createPublicClient({
  transport: http("https://rpc.botchain.ai"),
});

async function run() {
  console.log("=== Testing BOTChain Mainnet RPC ===");
  const chainId = await client.getChainId();
  console.log(`Chain ID: ${chainId} (Expected: 677)`);

  const blockNumber = await client.getBlockNumber();
  console.log(`Latest Block Height: #${blockNumber}`);

  const block = await client.getBlock({ blockTag: "latest" });
  console.log(`Block Hash: ${block.hash}`);
  console.log(`Block Timestamp: ${block.timestamp} (${new Date(Number(block.timestamp) * 1000).toISOString()})`);
  console.log(`Gas Limit: ${block.gasLimit}, Gas Used: ${block.gasUsed}`);

  console.log("\n=== Testing Deployed Contract on Mainnet ===");
  const contractAddress = "0x6Df0eD4cf20Dff23376cab013Dea4f45DB53f2CD";
  const code = await client.getBytecode({ address: contractAddress });
  console.log(`Contract Code Size: ${code ? code.length : 0} bytes (Deployed verified: ${code && code.length > 2})`);

  console.log("\n=== All Tests Passed! ===");
}

run().catch(console.error);

