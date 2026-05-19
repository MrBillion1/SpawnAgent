import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=========================================");
  console.log("Wallet Public Address:", deployer.address);
  
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log("Connected Network Name:", network.name);
  console.log("Connected Chain ID:", network.chainId.toString());

  const balance = await provider.getBalance(deployer.address);
  console.log("Wallet Balance:", ethers.formatEther(balance), "MNT");
  console.log("=========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
