require("dotenv").config();
const {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
} = require("viem");
const { privateKeyToAccount, generatePrivateKey } = require("viem/accounts");

const CONTRACT_ADDRESS = "0x6Df0eD4cf20Dff23376cab013Dea4f45DB53f2CD";

const botchain = {
  id: 677,
  name: "BOTChain Mainnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"] },
  },
};

const abi = [
  {
    inputs: [{ internalType: "uint256", name: "blockNumber", type: "uint256" }],
    name: "requestBlockInspection",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "targetBlockNumber", type: "uint256" },
      { internalType: "uint256", name: "targetDeadline", type: "uint256" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "notes", type: "string" },
    ],
    name: "recordInvestigation",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  const privateKeyRaw = process.env.PRIVATE_KEY;
  if (!privateKeyRaw) {
    throw new Error("PRIVATE_KEY is missing from .env");
  }
  const deployerKey = privateKeyRaw.startsWith("0x")
    ? privateKeyRaw
    : `0x${privateKeyRaw}`;

  const publicClient = createPublicClient({
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  const account1 = privateKeyToAccount(deployerKey);
  const wallet1 = createWalletClient({
    account: account1,
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  console.log(`Wallet 1 (Deployer): ${account1.address}`);
  const balance1 = await publicClient.getBalance({ address: account1.address });
  console.log(`Wallet 1 Balance: ${formatEther(balance1)} BOT`);

  // Generate Wallet 2 and Wallet 3
  const privKey2 = generatePrivateKey();
  const account2 = privateKeyToAccount(privKey2);
  const wallet2 = createWalletClient({
    account: account2,
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  const privKey3 = generatePrivateKey();
  const account3 = privateKeyToAccount(privKey3);
  const wallet3 = createWalletClient({
    account: account3,
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  console.log(`Wallet 2 (Unique 2): ${account2.address}`);
  console.log(`Wallet 3 (Unique 3): ${account3.address}`);

  // Fund Wallet 2 and 3
  console.log("\nFunding Wallet 2 and Wallet 3 with 0.005 BOT each for gas...");
  const fundTx1 = await wallet1.sendTransaction({
    to: account2.address,
    value: parseEther("0.005"),
  });
  await publicClient.waitForTransactionReceipt({ hash: fundTx1 });
  console.log(`Funded Wallet 2: tx ${fundTx1}`);

  const fundTx2 = await wallet1.sendTransaction({
    to: account3.address,
    value: parseEther("0.005"),
  });
  await publicClient.waitForTransactionReceipt({ hash: fundTx2 });
  console.log(`Funded Wallet 3: tx ${fundTx2}`);

  const latestBlock = await publicClient.getBlockNumber();
  console.log(`\nCurrent Block Number: ${latestBlock}`);

  const interactions = [];

  // Interaction 1: Wallet 1 calls requestBlockInspection
  console.log("\nExecuting Interaction 1: Wallet 1 -> requestBlockInspection...");
  const tx1 = await wallet1.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "requestBlockInspection",
    args: [latestBlock - 100n],
  });
  const rc1 = await publicClient.waitForTransactionReceipt({ hash: tx1 });
  interactions.push({
    index: 1,
    action: `requestBlockInspection(${latestBlock - 100n})`,
    from: account1.address,
    walletName: "Wallet 1 (Deployer)",
    hash: tx1,
    blockNumber: rc1.blockNumber,
    gasUsed: rc1.gasUsed.toString(),
  });
  console.log(`Interaction 1 Confirmed in block #${rc1.blockNumber}: ${tx1}`);

  // Interaction 2: Wallet 2 calls requestBlockInspection
  console.log("\nExecuting Interaction 2: Wallet 2 -> requestBlockInspection...");
  const tx2 = await wallet2.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "requestBlockInspection",
    args: [latestBlock - 50n],
  });
  const rc2 = await publicClient.waitForTransactionReceipt({ hash: tx2 });
  interactions.push({
    index: 2,
    action: `requestBlockInspection(${latestBlock - 50n})`,
    from: account2.address,
    walletName: "Wallet 2",
    hash: tx2,
    blockNumber: rc2.blockNumber,
    gasUsed: rc2.gasUsed.toString(),
  });
  console.log(`Interaction 2 Confirmed in block #${rc2.blockNumber}: ${tx2}`);

  // Interaction 3: Wallet 3 calls recordInvestigation
  console.log("\nExecuting Interaction 3: Wallet 3 -> recordInvestigation...");
  const tx3 = await wallet3.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "recordInvestigation",
    args: [
      latestBlock,
      1794500000n,
      "TIMELOCK_VERIFICATION",
      "Audited timelock release block delay on BOTChain Mainnet",
    ],
  });
  const rc3 = await publicClient.waitForTransactionReceipt({ hash: tx3 });
  interactions.push({
    index: 3,
    action: `recordInvestigation(targetBlock: ${latestBlock}, category: "TIMELOCK_VERIFICATION")`,
    from: account3.address,
    walletName: "Wallet 3",
    hash: tx3,
    blockNumber: rc3.blockNumber,
    gasUsed: rc3.gasUsed.toString(),
  });
  console.log(`Interaction 3 Confirmed in block #${rc3.blockNumber}: ${tx3}`);

  // Interaction 4: Wallet 2 calls recordInvestigation
  console.log("\nExecuting Interaction 4: Wallet 2 -> recordInvestigation...");
  const tx4 = await wallet2.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "recordInvestigation",
    args: [
      latestBlock + 200n,
      0n,
      "GAS_SPIKE_AUDIT",
      "Baseline gas consumption and throughput audit on BOTChain blocks",
    ],
  });
  const rc4 = await publicClient.waitForTransactionReceipt({ hash: tx4 });
  interactions.push({
    index: 4,
    action: `recordInvestigation(targetBlock: ${latestBlock + 200n}, category: "GAS_SPIKE_AUDIT")`,
    from: account2.address,
    walletName: "Wallet 2",
    hash: tx4,
    blockNumber: rc4.blockNumber,
    gasUsed: rc4.gasUsed.toString(),
  });
  console.log(`Interaction 4 Confirmed in block #${rc4.blockNumber}: ${tx4}`);

  // Interaction 5: Wallet 3 calls requestBlockInspection
  console.log("\nExecuting Interaction 5: Wallet 3 -> requestBlockInspection...");
  const tx5 = await wallet3.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "requestBlockInspection",
    args: [latestBlock + 1000n],
  });
  const rc5 = await publicClient.waitForTransactionReceipt({ hash: tx5 });
  interactions.push({
    index: 5,
    action: `requestBlockInspection(${latestBlock + 1000n})`,
    from: account3.address,
    walletName: "Wallet 3",
    hash: tx5,
    blockNumber: rc5.blockNumber,
    gasUsed: rc5.gasUsed.toString(),
  });
  console.log(`Interaction 5 Confirmed in block #${rc5.blockNumber}: ${tx5}`);

  console.log("\n=== ALL 5 INTERACTIONS SUCCESSFULLY COMPLETED ===");
  console.log(JSON.stringify(interactions, null, 2));
}

main().catch((err) => {
  console.error("Interaction script failed:", err);
  process.exit(1);
});
