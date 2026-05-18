import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Starting deployment to local test network...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Registries
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityReg = await IdentityRegistry.deploy();
  await identityReg.waitForDeployment();
  const identityAddress = await identityReg.getAddress();
  console.log("IdentityRegistry deployed to:", identityAddress);

  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const reputationReg = await ReputationRegistry.deploy();
  await reputationReg.waitForDeployment();
  const reputationAddress = await reputationReg.getAddress();
  console.log("ReputationRegistry deployed to:", reputationAddress);

  const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
  const validationReg = await ValidationRegistry.deploy();
  await validationReg.waitForDeployment();
  const validationAddress = await validationReg.getAddress();
  console.log("ValidationRegistry deployed to:", validationAddress);

  // 2. Deploy Factory
  const SpawnFactory = await ethers.getContractFactory("SpawnFactory");
  const spawnFactory = await SpawnFactory.deploy(identityAddress);
  await spawnFactory.waitForDeployment();
  const factoryAddress = await spawnFactory.getAddress();
  console.log("SpawnFactory deployed to:", factoryAddress);

  // 3. Deploy Mocks
  const MockmETH = await ethers.getContractFactory("MockmETH");
  const mockMeth = await MockmETH.deploy();
  await mockMeth.waitForDeployment();
  const mockMethAddress = await mockMeth.getAddress();
  console.log("Mock mETH deployed to:", mockMethAddress);

  const MockUSDY = await ethers.getContractFactory("MockUSDY");
  const mockUsdy = await MockUSDY.deploy();
  await mockUsdy.waitForDeployment();
  const mockUsdyAddress = await mockUsdy.getAddress();
  console.log("Mock USDY deployed to:", mockUsdyAddress);

  const MockAgniFinance = await ethers.getContractFactory("MockAgniFinance");
  const mockAgni = await MockAgniFinance.deploy();
  await mockAgni.waitForDeployment();
  const mockAgniAddress = await mockAgni.getAddress();
  console.log("Mock Agni Finance deployed to:", mockAgniAddress);

  const MockMerchantMoe = await ethers.getContractFactory("MockMerchantMoe");
  const mockMoe = await MockMerchantMoe.deploy(mockUsdyAddress, mockMethAddress);
  await mockMoe.waitForDeployment();
  const mockMoeAddress = await mockMoe.getAddress();
  console.log("Mock Merchant Moe deployed to:", mockMoeAddress);

  // 4. Update the addresses in the Frontend & Runtime
  const addresses = {
    IdentityRegistry: identityAddress,
    ReputationRegistry: reputationAddress,
    SpawnFactory: factoryAddress,
    MockmETH: mockMethAddress,
    MockUSDY: mockUsdyAddress,
    MockAgniFinance: mockAgniAddress,
    MockMerchantMoe: mockMoeAddress
  };

  const addressFilePath = path.join(__dirname, '../../frontend/src/app/contracts.json');
  fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 2));
  console.log(`Saved contract addresses to ${addressFilePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
