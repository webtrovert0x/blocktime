const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("--------------------------------------------------");
  console.log(`Deploying BlockTimeRegistry to BOTChain...`);
  console.log(`RPC: ${hre.network.config.url} (Chain ID: ${chainId})`);
  console.log("--------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error("Error: No deployer signer found. Please ensure PRIVATE_KEY is set in .env");
    process.exit(1);
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} BOT`);

  const BlockTimeRegistry = await hre.ethers.getContractFactory("BlockTimeRegistry");
  const contract = await BlockTimeRegistry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const explorerUrl = chainId === 677 ? "https://scan.botchain.ai" : "https://scan.bohr.life";

  console.log("==================================================");
  console.log(`>>> BlockTimeRegistry deployed successfully!`);
  console.log(`>>> Contract Address: ${contractAddress}`);
  console.log(`>>> Explorer: ${explorerUrl}/address/${contractAddress}`);
  console.log("==================================================");

  // Write deployment info to frontend config
  const outputDir = path.join(__dirname, "..", "src", "config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: chainId === 677 ? "BOTChain Mainnet" : "BOTChain Testnet",
    chainId: chainId,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(outputDir, "deployed.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment address saved to src/config/deployed.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
