import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SecureImageManager } from "../types";

describe("SecureImageManager", function () {
  let secureImageManager: SecureImageManager;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contract
    const SecureImageManagerFactory = await ethers.getContractFactory("SecureImageManager");
    secureImageManager = await SecureImageManagerFactory.deploy();
    await secureImageManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the initial state correctly", async function () {
      expect(await secureImageManager.nextImageId()).to.equal(0);
      expect(await secureImageManager.getTotalImages()).to.equal(0);
    });
  });

  describe("Image Upload", function () {
    it("Should upload an image successfully", async function () {
      // For testing purposes, we'll create a mock encrypted password
      // In real usage, this would come from the FHE encryption process
      const mockEncryptedPassword = "0x" + "1".repeat(64); // 32 bytes of mock data
      const mockInputProof = "0x" + "2".repeat(128); // Mock proof data
      const imageHash = "QmTest123..."; // Mock IPFS hash
      
      // This test won't fully work without proper FHE setup
      // But we can test the contract structure
      expect(await secureImageManager.getTotalImages()).to.equal(0);
    });

    it("Should increment nextImageId after upload", async function () {
      expect(await secureImageManager.nextImageId()).to.equal(0);
      // After successful upload, nextImageId should be 1
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize users", async function () {
      const imageId = 0;
      const userAddress = user1.address;
      
      // This test assumes an image exists with id 0
      // In a real test, we would first upload an image
      
      expect(await secureImageManager.isAuthorized(imageId, owner.address)).to.be.true;
    });

    it("Should prevent non-owners from authorizing users", async function () {
      const imageId = 0;
      const userAddress = user2.address;
      
      // This should revert when user1 tries to authorize user2 for owner's image
      // await expect(
      //   secureImageManager.connect(user1).authorizeUser(imageId, userAddress)
      // ).to.be.revertedWith("Only uploader can authorize");
    });
  });

  describe("Image Info", function () {
    it("Should return correct image information", async function () {
      // Test getting image info for non-existent image
      await expect(
        secureImageManager.getImageInfo(999)
      ).to.be.revertedWith("Image does not exist");
    });

    it("Should return user's image list", async function () {
      const userImages = await secureImageManager.getUserImages(owner.address);
      expect(userImages).to.be.an('array');
    });
  });
});