const fs = require("fs");
const path = require("path");

async function verify() {
  const contractAddress = "0x6Df0eD4cf20Dff23376cab013Dea4f45DB53f2CD";
  const sourceCode = fs.readFileSync(
    path.join(__dirname, "..", "contracts", "BlockTimeRegistry.sol"),
    "utf8"
  );

  console.log("Submitting verification to https://scan.botchain.ai/api ...");

  // Try Etherscan/Blockscout compatible POST
  const body = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: "solidity-single-file",
    contractname: "BlockTimeRegistry",
    compilerversion: "v0.8.20+commit.a1b79de6",
    optimizationUsed: "1",
    runs: "200",
    evmversion: "paris",
    licenseType: "3", // MIT
  });

  try {
    const res = await fetch("https://scan.botchain.ai/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
      body: body.toString(),
    });

    const data = await res.json();
    console.log("Verification Response:", JSON.stringify(data, null, 2));

    if (data.result) {
      // Check status if guid returned
      console.log("Checking verification status for GUID:", data.result);
      await new Promise((r) => setTimeout(r, 4000));
      const checkRes = await fetch(
        `https://scan.botchain.ai/api?module=contract&action=checkverifystatus&guid=${data.result}`
      );
      const checkData = await checkRes.json();
      console.log("Check Status Result:", JSON.stringify(checkData, null, 2));
    }
  } catch (err) {
    console.error("Verification error:", err);
  }
}

verify();

