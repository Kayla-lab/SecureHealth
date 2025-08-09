// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Secure Image Manager Contract
/// @notice Manages encrypted passwords for image decryption using Zama FHE
contract SecureImageManager is SepoliaConfig {
    
    struct ImageRecord {
        euint256 encryptedPassword;  // FHE encrypted password (EVM address format)
        address uploader;            // Address of the uploader
        string imageHash;            // Hash of the encrypted image
        uint256 timestamp;           // When the image was uploaded
        bool exists;                 // Whether the record exists
    }
    
    // Mapping from image ID to ImageRecord
    mapping(uint256 => ImageRecord) public images;
    
    // Mapping from uploader to their image IDs
    mapping(address => uint256[]) public userImages;
    
    // Mapping to track authorized addresses for each image
    mapping(uint256 => mapping(address => bool)) public authorizedUsers;
    
    // Counter for image IDs
    uint256 public nextImageId;
    
    // Events
    event ImageUploaded(uint256 indexed imageId, address indexed uploader, string imageHash);
    event UserAuthorized(uint256 indexed imageId, address indexed user, address indexed authorizer);
    event UserRevoked(uint256 indexed imageId, address indexed user, address indexed revoker);
    
    /// @notice Upload an encrypted image with its encrypted password
    /// @param encryptedPassword The FHE encrypted password (EVM address format)
    /// @param inputProof The proof for the encrypted input
    /// @param imageHash The hash of the encrypted image data
    /// @return imageId The ID of the uploaded image
    function uploadImage(
        externalEuint256 encryptedPassword,
        bytes calldata inputProof,
        string calldata imageHash
    ) external returns (uint256) {
        uint256 imageId = nextImageId++;
        
        // Convert external encrypted input to internal euint256
        euint256 password = FHE.fromExternal(encryptedPassword, inputProof);
        
        // Create image record
        images[imageId] = ImageRecord({
            encryptedPassword: password,
            uploader: msg.sender,
            imageHash: imageHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add to user's image list
        userImages[msg.sender].push(imageId);
        
        // Grant permissions for FHE operations
        FHE.allowThis(password);
        FHE.allow(password, msg.sender);
        
        // Auto-authorize the uploader
        authorizedUsers[imageId][msg.sender] = true;
        
        emit ImageUploaded(imageId, msg.sender, imageHash);
        
        return imageId;
    }
    
    /// @notice Authorize a user to decrypt an image's password
    /// @param imageId The ID of the image
    /// @param user The address to authorize
    function authorizeUser(uint256 imageId, address user) external {
        require(images[imageId].exists, "Image does not exist");
        require(msg.sender == images[imageId].uploader, "Only uploader can authorize");
        require(!authorizedUsers[imageId][user], "User already authorized");
        
        authorizedUsers[imageId][user] = true;
        
        // Grant FHE access to the authorized user
        FHE.allow(images[imageId].encryptedPassword, user);
        
        emit UserAuthorized(imageId, user, msg.sender);
    }
    
    /// @notice Revoke a user's authorization to decrypt an image's password
    /// @param imageId The ID of the image
    /// @param user The address to revoke authorization from
    function revokeUser(uint256 imageId, address user) external {
        require(images[imageId].exists, "Image does not exist");
        require(msg.sender == images[imageId].uploader, "Only uploader can revoke");
        require(user != images[imageId].uploader, "Cannot revoke uploader");
        require(authorizedUsers[imageId][user], "User not authorized");
        
        authorizedUsers[imageId][user] = false;
        
        emit UserRevoked(imageId, user, msg.sender);
    }
    
    /// @notice Get the encrypted password for an image (only for authorized users)
    /// @param imageId The ID of the image
    /// @return The encrypted password
    function getEncryptedPassword(uint256 imageId) external view returns (euint256) {
        require(images[imageId].exists, "Image does not exist");
        require(authorizedUsers[imageId][msg.sender], "Not authorized to access this image");
        
        return images[imageId].encryptedPassword;
    }
    
    /// @notice Get image metadata
    /// @param imageId The ID of the image
    /// @return uploader The address of the uploader
    /// @return imageHash The hash of the encrypted image
    /// @return timestamp When the image was uploaded
    function getImageInfo(uint256 imageId) external view returns (
        address uploader,
        string memory imageHash,
        uint256 timestamp
    ) {
        require(images[imageId].exists, "Image does not exist");
        
        ImageRecord memory img = images[imageId];
        return (img.uploader, img.imageHash, img.timestamp);
    }
    
    /// @notice Get all image IDs for a user
    /// @param user The user's address
    /// @return Array of image IDs
    function getUserImages(address user) external view returns (uint256[] memory) {
        return userImages[user];
    }
    
    /// @notice Check if a user is authorized for an image
    /// @param imageId The ID of the image
    /// @param user The address to check
    /// @return Whether the user is authorized
    function isAuthorized(uint256 imageId, address user) external view returns (bool) {
        return authorizedUsers[imageId][user];
    }
    
    /// @notice Get the total number of images
    /// @return The total number of uploaded images
    function getTotalImages() external view returns (uint256) {
        return nextImageId;
    }
}