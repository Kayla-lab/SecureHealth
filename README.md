# SecureHealth - Blockchain-Based Medical Image Security Management System

SecureHealth is a cutting-edge medical image security management system that combines Fully Homomorphic Encryption (FHE), blockchain technology, and IPFS distributed storage to provide HIPAA-compliant medical image protection and sharing capabilities.

## 🏥 Project Overview

SecureHealth addresses the critical need for secure medical image storage and sharing in healthcare environments. The system encrypts medical images using AES-256 encryption with dynamically generated EVM address format passwords, then uses Zama's FHE technology to encrypt these passwords on the blockchain, ensuring end-to-end security while maintaining the ability to perform computations on encrypted data.

### Key Features

- **🔐 End-to-End Encryption**: AES-256 encryption for medical images with EVM address format passwords
- **🧮 Homomorphic Encryption**: Zama FHE technology for secure password storage on blockchain
- **☁️ Distributed Storage**: IPFS integration for decentralized image storage
- **👤 Access Control**: Fine-grained permission management for authorized users
- **🔗 Blockchain Security**: Ethereum-based smart contracts for immutable security
- **🏥 HIPAA Compliance**: Designed to meet healthcare data protection requirements
- **🌐 Web3 Integration**: Modern Web3 wallet integration with RainbowKit

## 🏗️ System Architecture

### Technical Stack

**Smart Contract Layer:**
- **Framework**: Hardhat with TypeScript
- **Blockchain**: Ethereum (Sepolia Testnet)
- **FHE Library**: Zama FHEVM Solidity Library v0.7.0
- **Language**: Solidity 0.8.24

**Frontend Layer:**
- **Framework**: React 19 + TypeScript + Vite
- **Web3 Integration**: Wagmi + Viem + RainbowKit
- **FHE Integration**: Zama Relayer SDK v0.1.2
- **Encryption**: CryptoJS for AES operations
- **UI/UX**: Modern medical-themed responsive design

**Infrastructure:**
- **Storage**: IPFS (InterPlanetary File System)
- **Network**: Ethereum Sepolia Testnet
- **Node Provider**: Alchemy
- **Development**: Hardhat with custom tasks

### Workflow

1. **Image Preprocessing**: Medical images are loaded and prepared for encryption
2. **Password Generation**: EVM address format passwords are automatically generated
3. **AES Encryption**: Images are encrypted using AES-256 with the generated password
4. **IPFS Upload**: Encrypted images are uploaded to IPFS distributed network
5. **FHE Encryption**: Passwords are encrypted using Zama FHE technology
6. **Blockchain Storage**: Encrypted passwords and metadata stored in smart contracts
7. **Access Control**: Fine-grained permissions managed through blockchain ACL
8. **Secure Decryption**: Authorized users can decrypt and access medical images

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **MetaMask**: Web3 wallet for blockchain interactions
- **Git**: Version control system

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/SecureHealth.git
   cd SecureHealth
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Set up Hardhat variables
   npx hardhat vars set PRIVATE_KEY
   npx hardhat vars set ALCHEMY_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   Required environment variables:
   - `PRIVATE_KEY`: Your Ethereum wallet private key
   - `ALCHEMY_API_KEY`: Alchemy API key for Sepolia network
   - `ETHERSCAN_API_KEY`: Etherscan API key for contract verification

5. **Compile smart contracts**
   ```bash
   npm run compile
   ```

6. **Run tests**
   ```bash
   npm run test
   ```

## 📦 Deployment

### Local Development

1. **Start local Hardhat network**
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts to local network**
   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Start frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

### Sepolia Testnet Deployment

1. **Deploy to Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

2. **Verify contract on Etherscan**
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

3. **Update frontend configuration**
   - Update `CONTRACT_ADDRESS` in `frontend/src/config/contract.ts`
   - Ensure network configuration matches deployment

4. **Test on Sepolia**
   ```bash
   npx hardhat test --network sepolia
   ```

## 📋 Smart Contract Usage

### SecureImageManager Contract

The main smart contract provides the following functionality:

#### Core Functions

```solidity
// Upload encrypted medical image
function uploadImage(
    externalEaddress encryptedPassword,
    bytes calldata inputProof,
    string calldata imageHash
) external returns (uint256);

// Authorize user access to image
function authorizeUser(uint256 imageId, address user) external;

// Get encrypted password (authorized users only)
function getEncryptedPassword(uint256 imageId) external view returns (eaddress);

// Get image metadata
function getImageInfo(uint256 imageId) external view returns (
    address uploader,
    string memory imageHash,
    uint256 timestamp
);

// Get user's uploaded images
function getUserImages(address user) external view returns (uint256[] memory);
```

#### Usage Examples

**Deploy and interact using Hardhat tasks:**

```bash
# Upload an image
npx hardhat SecureImageManager:uploadImage --network sepolia \
  --contract <CONTRACT_ADDRESS> \
  --password <EVM_ADDRESS_PASSWORD> \
  --hash <IPFS_HASH>

# Authorize a user
npx hardhat SecureImageManager:authorizeUser --network sepolia \
  --contract <CONTRACT_ADDRESS> \
  --image-id <IMAGE_ID> \
  --user <USER_ADDRESS>

# Get user images
npx hardhat SecureImageManager:getUserImages --network sepolia \
  --contract <CONTRACT_ADDRESS> \
  --user <USER_ADDRESS>
```

## 🖥️ Frontend Usage

### User Interface

The frontend provides a comprehensive medical image management interface:

1. **Connection**: Connect Web3 wallet using RainbowKit
2. **Upload Process**:
   - Load medical images (supports common formats)
   - Automatic password generation
   - Real-time AES encryption preview
   - IPFS upload with progress tracking
   - Blockchain transaction confirmation

3. **Image Management**:
   - View uploaded medical images
   - Grant access permissions to other users
   - Track image metadata and timestamps

4. **Decryption & Access**:
   - Select images from personal archive
   - Decrypt authorized images
   - View decrypted medical images securely

### Key Components

- **ImageDisplay**: Handles image loading and AES encryption
- **IPFSUpload**: Manages IPFS upload process
- **ZamaIntegration**: Handles FHE operations and blockchain interactions
- **DecryptImage**: Manages secure decryption and viewing
- **UserImageList**: Displays user's medical image archive

### Configuration

Update frontend configuration in `frontend/src/config/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = "0x..."; // Deployed contract address
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  name: "Sepolia Testnet"
};
```

## 🧪 Testing

### Smart Contract Tests

Run comprehensive test suites:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run coverage

# Run tests on Sepolia testnet
npm run test:sepolia

# Run specific test file
npx hardhat test test/SecureImageManager.ts
```

### Test Coverage

The test suite covers:
- Contract deployment and initialization
- Image upload functionality with FHE encryption
- Access control and authorization mechanisms
- Error handling and edge cases
- Gas optimization verification

### Example Test Scenarios

```typescript
// Example test structure
describe("SecureImageManager", function () {
  it("Should upload image with encrypted password", async function () {
    // Test implementation
  });
  
  it("Should authorize users correctly", async function () {
    // Test implementation
  });
  
  it("Should decrypt passwords for authorized users", async function () {
    // Test implementation
  });
});
```

## 🔐 Security Features

### Encryption Layers

1. **AES-256 Encryption**: Medical images encrypted with auto-generated EVM addresses
2. **Zama FHE**: Passwords encrypted using fully homomorphic encryption
3. **Blockchain Security**: Immutable storage on Ethereum blockchain
4. **Access Control Lists**: Fine-grained permission management

### Privacy Protection

- **Zero-Knowledge Proofs**: Verify data integrity without revealing content
- **Client-Side Encryption**: Images never transmitted unencrypted
- **Decentralized Storage**: No single point of failure
- **HIPAA Compliance**: Designed for healthcare data protection requirements

### Audit Trail

- All operations recorded on blockchain
- Immutable transaction history
- User authorization tracking
- Time-stamped access logs

## 🏗️ Project Structure

```
SecureHealth/
├── contracts/                    # Smart contract source files
│   └── SecureImageManager.sol   # Main contract for image management
├── deploy/                      # Deployment scripts
│   └── deploy.ts               # Hardhat deployment configuration
├── tasks/                      # Hardhat custom tasks
│   ├── SecureImageManager.ts   # Contract interaction tasks
│   └── accounts.ts            # Account management utilities
├── test/                       # Test files
│   ├── SecureImageManager.ts  # Contract test suite
│   └── FHECounter.ts         # FHE functionality tests
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ImageDisplay.tsx      # Image encryption component
│   │   │   ├── IPFSUpload.tsx       # IPFS upload component
│   │   │   ├── ZamaIntegration.tsx  # FHE integration
│   │   │   ├── DecryptImage.tsx     # Decryption component
│   │   │   └── UserImageList.tsx    # Image management
│   │   ├── config/           # Configuration files
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.tsx          # Main application component
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── docs/                      # Documentation
│   ├── zama_llm.md           # Zama FHE guide
│   └── zama_doc_relayer.md   # Relayer SDK documentation
├── hardhat.config.ts         # Hardhat configuration
├── package.json              # Root dependencies
└── README.md                 # This file
```

## 📜 Available Scripts

### Root Directory Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile all smart contracts |
| `npm run test` | Run contract test suite |
| `npm run test:sepolia` | Run tests on Sepolia testnet |
| `npm run coverage` | Generate test coverage report |
| `npm run lint` | Run linting checks |
| `npm run clean` | Clean build artifacts |
| `npm run typechain` | Generate TypeScript types |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

## 🛠️ Development Tools

### Hardhat Tasks

Custom Hardhat tasks for contract interaction:

```bash
# Account management
npx hardhat accounts
npx hardhat balance --account <ADDRESS>

# Contract interactions
npx hardhat SecureImageManager:uploadImage
npx hardhat SecureImageManager:authorizeUser
npx hardhat SecureImageManager:getUserImages
```

### Development Utilities

- **TypeChain**: Auto-generated TypeScript bindings
- **Hardhat Gas Reporter**: Gas usage analysis
- **Solidity Coverage**: Test coverage reporting
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting

## 🔍 Network Configuration

### Sepolia Testnet Configuration

```typescript
sepolia: {
  chainId: 11155111,
  url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  accounts: [PRIVATE_KEY],
}
```

### Zama FHEVM Configuration

```typescript
// Contract addresses for Sepolia testnet
FHEVM_EXECUTOR_CONTRACT: "0x848B0066793BcC60346Da1F49049357399B8D595"
ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c"
KMS_VERIFIER_CONTRACT: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC"
INPUT_VERIFIER_CONTRACT: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4"
```

## 📚 Documentation & Resources

### Official Documentation

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://docs.zama.ai/protocol/solidity-guides)
- [Zama Relayer SDK](https://docs.zama.ai/protocol/relayer-docs)

### Technical Guides

- [Smart Contract Development Guide](./docs/zama_llm.md)
- [Frontend Integration Guide](./docs/zama_doc_relayer.md)
- [Security Best Practices](https://docs.zama.ai/protocol/security)

### Community Resources

- [Zama Community Forum](https://community.zama.ai/)
- [Discord Channel](https://discord.gg/zama)
- [GitHub Repository](https://github.com/zama-ai/fhevm)

## 🤝 Contributing

We welcome contributions to SecureHealth! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

## 🛡️ Security Considerations

### Important Security Notes

- Never commit private keys or sensitive information
- Regularly update dependencies to patch security vulnerabilities
- Follow HIPAA compliance guidelines for medical data
- Implement proper access controls and permission management
- Regular security audits recommended for production deployment

### Known Limitations

- IPFS upload currently simulated (not actual IPFS integration)
- Requires Sepolia testnet ETH for transactions
- Frontend optimization needed for large medical images
- Access revocation functionality partially implemented

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- Zama FHEVM: Various open-source licenses
- React ecosystem: MIT License
- Hardhat framework: MIT License

## 🆘 Support & Troubleshooting

### Common Issues

1. **FHEVM Initialization Failed**: Ensure proper network connection and configuration
2. **Transaction Reverted**: Check gas limits and contract permissions
3. **Wallet Connection Issues**: Verify MetaMask is installed and connected to Sepolia
4. **Image Upload Failures**: Check file size and format compatibility

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/SecureHealth/issues)
- **Documentation**: Comprehensive guides in `/docs` directory
- **Community**: Join our Discord for community support
- **Technical Support**: Contact development team for critical issues

## 🗺️ Roadmap

### Upcoming Features

- [ ] **IPFS Integration**: Complete IPFS upload and retrieval functionality
- [ ] **Multi-chain Support**: Deploy on additional blockchain networks
- [ ] **Advanced Access Control**: Role-based permission management
- [ ] **Mobile Application**: React Native mobile app
- [ ] **Batch Operations**: Multiple image upload and management
- [ ] **Analytics Dashboard**: Usage statistics and insights
- [ ] **Integration APIs**: RESTful APIs for third-party integration

### Long-term Vision

- Healthcare provider integration partnerships
- FHIR (Fast Healthcare Interoperability Resources) compliance
- AI-powered medical image analysis on encrypted data
- Cross-institutional medical data sharing platform
- Regulatory approval for clinical use

---

**Built with ❤️ by the SecureHealth team using Zama's revolutionary FHE technology**

*Securing healthcare data for the future of medicine*