# Secure Peak Data

A privacy-preserving energy consumption monitoring system built with Fully Homomorphic Encryption (FHE). This application enables secure storage and management of encrypted energy consumption records on the blockchain, ensuring data privacy while maintaining auditability.

## Demo

### Live Demo

**[https://secure-peak-data.vercel.app/](https://secure-peak-data.vercel.app/)**

### Video Demo

[View Demo Video](./secure-peak-data.mp4)

## Features

- **Encrypted Data Storage**: Energy consumption values and peak indicators are encrypted using FHEVM
- **On-chain Privacy**: Sensitive data remains encrypted on the blockchain
- **Selective Decryption**: Only authorized users can decrypt their own records
- **Modern Web Interface**: Next.js frontend with real-time data visualization
- **MetaMask Integration**: Seamless wallet connection via RainbowKit
- **Sepolia Testnet Support**: Deploy and test on Ethereum Sepolia testnet

## Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **FHEVM** by Zama - Fully Homomorphic Encryption for EVM
- **Hardhat** - Development environment

### Frontend
- **Next.js** 15 with App Router
- **React** 19
- **TypeScript**
- **TailwindCSS** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Data visualization
- **wagmi** + **viem** - Ethereum interactions
- **RainbowKit** - Wallet connection

## Project Structure

```
secure-peak-data/
├── contracts/
│   ├── FHECounter.sol        # Example FHE counter
│   └── SecurePeakData.sol    # Main encrypted records contract
├── deploy/                   # Deployment scripts
├── frontend/
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ConsumptionGraph.tsx
│   │   ├── CreateEntryDialog.tsx
│   │   ├── DataGrid.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useSecurePeakData.tsx
│   │   └── metamask/
│   ├── fhevm/               # FHEVM integration
│   └── abi/                 # Contract ABIs
├── tasks/                   # Hardhat tasks
└── test/                    # Contract tests
```

## Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- MetaMask wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CeciliaBruce/secure-peak-data.git
   cd secure-peak-data
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   # Optional: for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

### Development

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npm run test
   ```

3. **Start local development**
   ```bash
   # Terminal 1: Start local node
   npx hardhat node
   
   # Terminal 2: Deploy contracts
   npx hardhat deploy --network localhost
   
   # Terminal 3: Start frontend
   cd frontend && npm run dev
   ```

4. **Deploy to Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

## Smart Contract API

### SecurePeakData Contract

| Function | Description |
|----------|-------------|
| `createRecord()` | Create new encrypted consumption record |
| `getRecordCount()` | Get total number of records |
| `getRecordMetadata()` | Get public metadata (timestamp, submitter) |
| `getRecordConsumption()` | Get encrypted consumption value |
| `getRecordIsPeak()` | Get encrypted peak indicator |
| `grantAccess()` | Grant decryption access to auditor |

## Available Scripts

### Root Directory
| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run contract tests |
| `npm run coverage` | Generate test coverage |
| `npm run lint` | Run linting |

### Frontend Directory
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with [FHEVM](https://github.com/zama-ai/fhevm) by Zama
