import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy-secure-image-manager", "Deploy SecureImageManager contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    console.log("Deploying SecureImageManager...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const SecureImageManagerFactory = await ethers.getContractFactory("SecureImageManager");
    const secureImageManager = await SecureImageManagerFactory.deploy();
    
    await secureImageManager.waitForDeployment();
    
    console.log("SecureImageManager deployed to:", await secureImageManager.getAddress());
    
    return secureImageManager;
  });

task("get-image-info", "Get information about an image")
  .addParam("contract", "The contract address")
  .addParam("id", "The image ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      taskArgs.contract
    );
    
    try {
      const imageInfo = await secureImageManager.getImageInfo(taskArgs.id);
      console.log(`Image ${taskArgs.id} info:`);
      console.log(`  Uploader: ${imageInfo[0]}`);
      console.log(`  Hash: ${imageInfo[1]}`);
      console.log(`  Timestamp: ${imageInfo[2]}`);
    } catch (error) {
      console.error("Error getting image info:", error);
    }
  });

task("get-total-images", "Get total number of images")
  .addParam("contract", "The contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      taskArgs.contract
    );
    
    const totalImages = await secureImageManager.getTotalImages();
    console.log(`Total images: ${totalImages}`);
  });

task("get-user-images", "Get images for a specific user")
  .addParam("contract", "The contract address")
  .addParam("user", "The user address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      taskArgs.contract
    );
    
    const userImages = await secureImageManager.getUserImages(taskArgs.user);
    console.log(`Images for user ${taskArgs.user}:`, userImages.map(id => id.toString()));
  });

task("authorize-user", "Authorize a user to decrypt an image")
  .addParam("contract", "The contract address")
  .addParam("imageid", "The image ID")
  .addParam("user", "The user address to authorize")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    const [signer] = await ethers.getSigners();
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      taskArgs.contract,
      signer
    );
    
    try {
      const tx = await secureImageManager.authorizeUser(taskArgs.imageid, taskArgs.user);
      await tx.wait();
      console.log(`User ${taskArgs.user} authorized for image ${taskArgs.imageid}`);
    } catch (error) {
      console.error("Error authorizing user:", error);
    }
  });

task("check-authorization", "Check if a user is authorized for an image")
  .addParam("contract", "The contract address")
  .addParam("imageid", "The image ID")
  .addParam("user", "The user address to check")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      taskArgs.contract
    );
    
    const isAuthorized = await secureImageManager.isAuthorized(taskArgs.imageid, taskArgs.user);
    console.log(`User ${taskArgs.user} is ${isAuthorized ? 'authorized' : 'not authorized'} for image ${taskArgs.imageid}`);
  });

task("generate-aes-key", "Generate a random AES key in EVM address format")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    
    // 生成一个随机的20字节地址格式密钥
    const randomBytes = ethers.randomBytes(20);
    const aesKey = ethers.getAddress(ethers.hexlify(randomBytes));
    
    console.log("Generated AES key (EVM address format):");
    console.log(`  Address: ${aesKey}`);
    console.log(`  Hex: ${aesKey}`);
    console.log("");
    console.log("Use this key with the upload-image task:");
    console.log(`  npx hardhat upload-image --hash "your-image-hash" --aeskey "${aesKey}"`);
  });

task("upload-image", "Upload an encrypted image with AES key")
  .addOptionalParam("contract", "The contract address (auto-detected if not provided)")
  .addParam("hash", "The encrypted image hash")
  .addParam("aeskey", "The AES key in EVM address format (20 bytes, e.g., 0x1234...)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, fhevm } = hre;
    const fs = require('fs');
    const path = require('path');
    await fhevm.initializeCLIApi();
    const [signer] = await ethers.getSigners();
    
    // 自动获取合约地址
    let contractAddress = taskArgs.contract;
    if (!contractAddress) {
      try {
        // 尝试从部署文件中读取合约地址
        const deploymentPath = path.join(__dirname, '..', 'deployments', hre.network.name, 'SecureImageManager.json');
        if (fs.existsSync(deploymentPath)) {
          const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
          contractAddress = deployment.address;
          console.log(`Auto-detected contract address: ${contractAddress}`);
        } else {
          throw new Error("No deployment file found");
        }
      } catch (error) {
        console.error("Could not auto-detect contract address. Please provide --contract parameter");
        console.error("You can deploy the contract first using: npx hardhat deploy-secure-image-manager");
        return;
      }
    }
    
    const secureImageManager = await ethers.getContractAt(
      "SecureImageManager",
      contractAddress,
      signer
    );
    
    try {
      // 创建加密输入
      const input = fhevm.createEncryptedInput(contractAddress, signer.address);
      
      // 将AES密钥作为地址格式添加（20字节格式）
      input.addAddress(taskArgs.aeskey);
      
      const encryptedInput = await input.encrypt();
      
      // 调用合约的uploadImage方法
      const tx = await secureImageManager.uploadImage(
        encryptedInput.handles[0], // 加密的AES密钥
        encryptedInput.inputProof,
        taskArgs.hash
      );
      
      const receipt = await tx.wait();
      
      if (receipt) {
        // 从事件中获取imageId
        const uploadEvent = receipt.logs.find(
          (log: any) => log.fragment && log.fragment.name === 'ImageUploaded'
        );
        
        if (uploadEvent && 'args' in uploadEvent) {
          console.log(`Image uploaded successfully!`);
          console.log(`  Image ID: ${uploadEvent.args.imageId}`);
          // console.log(`  Hash: ${uploadEvent.args.hash}`);
          console.log(`  Uploader: ${uploadEvent.args.uploader}`);
          console.log(`  Transaction hash: ${tx.hash}`);
        } else {
          console.log(`Image uploaded successfully! Transaction hash: ${tx.hash}`);
        }
      }
      
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  });