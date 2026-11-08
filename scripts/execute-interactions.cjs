require("dotenv").config();
const {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  keccak256,
  toHex,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const fs = require("fs");

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

  const privKey2 = keccak256(toHex("blocktime_mainnet_unique_wallet_2"));
  const account2 = privateKeyToAccount(privKey2);
  const wallet2 = createWalletClient({
    account: account2,
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  const privKey3 = keccak256(toHex("blocktime_mainnet_unique_wallet_3"));
  const account3 = privateKeyToAccount(privKey3);
  const wallet3 = createWalletClient({
    account: account3,
    chain: botchain,
    transport: http("https://rpc.botchain.ai"),
  });

  console.log(`Wallet 1 (Deployer): ${account1.address}`);
  console.log(`Wallet 2 (Auditor Alpha): ${account2.address}`);
  console.log(`Wallet 3 (Auditor Beta): ${account3.address}`);

  // Top up Wallet 2 & 3 with 0.02 BOT each
  const bal2 = await publicClient.getBalance({ address: account2.address });
  if (bal2 < parseEther("0.015")) {
    console.log("Topping up Wallet 2 with 0.02 BOT...");
    const tx = await wallet1.sendTransaction({
      to: account2.address,
      value: parseEther("0.02"),
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Wallet 2 topped up: ${tx}`);
  }

  const bal3 = await publicClient.getBalance({ address: account3.address });
  if (bal3 < parseEther("0.015")) {
    console.log("Topping up Wallet 3 with 0.02 BOT...");
    const tx = await wallet1.sendTransaction({
      to: account3.address,
      value: parseEther("0.02"),
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Wallet 3 topped up: ${tx}`);
  }

  // Record already confirmed Tx 1, Tx 2, Tx 3
  const interactions = [
    {
      num: 1,
      wallet: account1.address,
      walletLabel: "Wallet 1 (Deployer)",
      action: "requestBlockInspection(29589710)",
      txHash: "0xad30822175891b2c3eb38ff00f993f52df69bd0ea8060207059ee2feaeb4596c",
      blockNumber: 29589813,
      explorerUrl:
        "https://scan.botchain.ai/tx/0xad30822175891b2c3eb38ff00f993f52df69bd0ea8060207059ee2feaeb4596c",
    },
    {
      num: 2,
      wallet: account2.address,
      walletLabel: "Wallet 2 (Auditor Alpha)",
      action: "requestBlockInspection(29589760)",
      txHash: "0xda376d35341221b2d77940ac4b961093e18ff79966c26f99ecee84b88957691c",
      blockNumber: 29589816,
      explorerUrl:
        "https://scan.botchain.ai/tx/0xda376d35341221b2d77940ac4b961093e18ff79966c26f99ecee84b88957691c",
    },
    {
      num: 3,
      wallet: account3.address,
      walletLabel: "Wallet 3 (Auditor Beta)",
      action: "requestBlockInspection(29589810)",
      txHash: "0xbfe14f7414915ad040d423ab195d6f811c8b20547e78d93f42566e35fd975588",
      blockNumber: 29589818,
      explorerUrl:
        "https://scan.botchain.ai/tx/0xbfe14f7414915ad040d423ab195d6f811c8b20547e78d93f42566e35fd975588",
    },
  ];

  const currentBlock = await publicClient.getBlockNumber();
  console.log(`Current Block Height: #${currentBlock}`);

  // Interaction 4: Wallet 2 calls requestBlockInspection
  console.log("\n[4/5] Wallet 2 executing requestBlockInspection...");
  const tx4 = await wallet2.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "requestBlockInspection",
    args: [currentBlock + 100n],
  });
  const rc4 = await publicClient.waitForTransactionReceipt({ hash: tx4 });
  interactions.push({
    num: 4,
    wallet: account2.address,
    walletLabel: "Wallet 2 (Auditor Alpha)",
    action: `requestBlockInspection(${currentBlock + 100n})`,
    txHash: tx4,
    blockNumber: Number(rc4.blockNumber),
    explorerUrl: `https://scan.botchain.ai/tx/${tx4}`,
  });
  console.log(`Confirmed Tx 4: ${tx4} in block #${rc4.blockNumber}`);

  // Interaction 5: Wallet 3 calls requestBlockInspection
  console.log("\n[5/5] Wallet 3 executing requestBlockInspection...");
  const tx5 = await wallet3.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "requestBlockInspection",
    args: [currentBlock + 500n],
  });
  const rc5 = await publicClient.waitForTransactionReceipt({ hash: tx5 });
  interactions.push({
    num: 5,
    wallet: account3.address,
    walletLabel: "Wallet 3 (Auditor Beta)",
    action: `requestBlockInspection(${currentBlock + 500n})`,
    txHash: tx5,
    blockNumber: Number(rc5.blockNumber),
    explorerUrl: `https://scan.botchain.ai/tx/${tx5}`,
  });
  console.log(`Confirmed Tx 5: ${tx5} in block #${rc5.blockNumber}`);

  console.log("\n========================================================");
  console.log("       5 MAINNET INTERACTIONS SUCCESSFULLY EXECUTED      ");
  console.log("========================================================");
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Total Interactions: 5`);
  console.log(`Unique Wallets: 3`);
  console.log(`  1. ${account1.address} (Deployer)`);
  console.log(`  2. ${account2.address} (Unique Wallet 2)`);
  console.log(`  3. ${account3.address} (Unique Wallet 3)`);
  console.log("\nInteractions Table:");
  console.table(interactions);

  fs.writeFileSync(
    "src/config/interactions.json",
    JSON.stringify(
      {
        contractAddress: CONTRACT_ADDRESS,
        timestamp: new Date().toISOString(),
        wallets: [
          account1.address,
          account2.address,
          account3.address,
        ],
        interactions,
      },
      null,
      2
    )
  );
  console.log("Updated src/config/interactions.json");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
