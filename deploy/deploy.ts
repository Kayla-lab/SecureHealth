import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("Deploying SecureImageManager with the account:", deployer);

  const secureImageManager = await deploy("SecureImageManager", {
    from: deployer,
    args: [], // No constructor arguments needed
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("SecureImageManager deployed to:", secureImageManager.address);

  // Update the contract address in the frontend config
  console.log("\n🎉 Deployment Complete!");
  console.log("📝 Please update the CONTRACT_ADDRESS in app/src/utils/contract.ts:");
  console.log(`export const CONTRACT_ADDRESS = "${secureImageManager.address}";`);
};
export default func;
func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];
