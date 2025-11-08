import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy FHECounter (legacy)
  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });
  console.log(`FHECounter contract: `, deployedFHECounter.address);

  // Deploy SecurePeakData
  const deployedSecurePeakData = await deploy("SecurePeakData", {
    from: deployer,
    log: true,
  });
  console.log(`SecurePeakData contract: `, deployedSecurePeakData.address);
};

export default func;
func.id = "deploy_contracts"; // id required to prevent reexecution
func.tags = ["FHECounter", "SecurePeakData"];
