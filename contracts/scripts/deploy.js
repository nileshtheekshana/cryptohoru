const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CryptoHoru Faucet Contract...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("");

  // Deploy the contract
  console.log("⚙️  Deploying contract...");
  const CryptoHoruFaucet = await hre.ethers.getContractFactory("CryptoHoruFaucet");
  const faucet = await CryptoHoruFaucet.deploy();

  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", faucetAddress);
  console.log("");

  // Fund the faucet with initial tokens
  console.log("💸 Funding faucet with initial tokens...");
  const fundAmount = hre.ethers.parseEther("1"); // Fund with 1 ETH
  const fundTx = await deployer.sendTransaction({
    to: faucetAddress,
    value: fundAmount
  });
  await fundTx.wait();
  console.log("✅ Faucet funded with:", hre.ethers.formatEther(fundAmount), "ETH");
  console.log("");

  // Get faucet stats
  const stats = await faucet.getFaucetStats();
  console.log("📊 Faucet Statistics:");
  console.log("   Balance:", hre.ethers.formatEther(stats.balance), "ETH");
  console.log("   Amount per claim:", hre.ethers.formatEther(stats.faucetAmount), "ETH");
  console.log("   Total claims:", stats.claims.toString());
  console.log("");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Deployment Complete!");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("1. Update FAUCET_CONTRACT_ADDRESS in app/faucet/page.tsx");
  console.log("2. Verify contract on Etherscan (if on testnet):");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${faucetAddress}`);
  console.log("");
  console.log("💡 To fund more tokens:");
  console.log(`   Send ETH to: ${faucetAddress}`);
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: faucetAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    fundedAmount: hre.ethers.formatEther(fundAmount),
    faucetAmount: hre.ethers.formatEther(stats.faucetAmount)
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to: deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
