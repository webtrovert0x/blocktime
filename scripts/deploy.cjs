const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying BlockTimeRegistry to BOTChain Testnet...");
  console.log("RPC: https://rpc.bohr.life (Chain ID: 968)");
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
  console.log("==================================================");
  console.log(`>>> BlockTimeRegistry deployed successfully!`);
  console.log(`>>> Contract Address: ${contractAddress}`);
  console.log(`>>> Explorer: https://scan.bohr.life/address/${contractAddress}`);
  console.log("==================================================");

  // Write deployment info to frontend config
  const outputDir = path.join(__dirname, "..", "src", "config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: "BOTChain Testnet",
    chainId: 968,
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

