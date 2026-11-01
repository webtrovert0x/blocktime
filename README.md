# BlockTime — Block and Timestamp Inspector

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network: BOTChain Testnet](https://img.shields.io/badge/Network-BOTChain%20Testnet%20(968)-2563eb.svg)](https://scan.bohr.life/)
[![Solidity: ^0.8.20](https://img.shields.io/badge/Solidity-^0.8.20-3b82f6.svg)](https://soliditylang.org/)
[![Whitepaper](https://img.shields.io/badge/Documentation-Whitepaper-blue.svg)](WHITEPAPER.md)

**BlockTime** is a developer inspection and block-level debugging utility specifically designed for developers building time-sensitive smart contracts (timelock controllers, token vesting schedules, Dutch auctions, staking lockups, liquidation bots, and oracle-dependent protocols) on **BOTChain Testnet**.

- **Repository**: [https://github.com/webtrovert0x/blocktime](https://github.com/webtrovert0x/blocktime)
- **Technical Whitepaper**: [Read WHITEPAPER.md](WHITEPAPER.md)

---

## 🚀 Deployed Contract Information

- **Contract Name**: `BlockTimeRegistry.sol`
- **Network**: **BOTChain Testnet**
- **Chain ID**: `968`
- **RPC URL**: `https://rpc.bohr.life`
- **Native Currency**: `BOT`
- **Deployed Address**: [`0x0C7F6B890fB52f7B461D95a774B66d1cb4b8bFCB`](https://scan.bohr.life/address/0x0C7F6B890fB52f7B461D95a774B66d1cb4b8bFCB)
- **Explorer**: [BohrScan Block Explorer](https://scan.bohr.life/)

---

## 🛠️ Features

### 1. 🔍 Single Block Deep-Dive Inspector (On-Chain Gas Fee Required)
- Inspecting a block sends an on-chain transaction to `BlockTimeRegistry.requestBlockInspection` on BOTChain Testnet, requiring network gas fees.
- Records the inspection inquiry permanently on-chain and returns the verified block details.
- Query any block by **Block Number** or inspect **Latest Block**.
- Displays exact gas used by the inspection transaction and links to the gas tx on BohrScan.
- Full breakdown: Unix timestamp, localized display time, UTC time, time delta from previous block ($\Delta t = t_n - t_{n-1}$), gas utilization gauge, base fee, miner address, and state root.
- Includes historical ledger of gas-paid inspection requests.

### 2. ⚖️ Block Timestamp & Progression Comparator
- Compare any two blocks (Block A vs. Block B) side-by-side.
- Quick presets: Compare with Previous (-1), -10 Blocks, or -100 Blocks.
- Computes:
  - Exact elapsed duration ($\Delta t$ in seconds, minutes, hours, days).
  - Block count difference ($\Delta \text{blocks}$).
  - Effective average block interval across that specific block range ($(\text{time}_B - \text{time}_A) / \Delta \text{blocks}$).
  - Gas utilization delta and total transaction count differences.

### 3. ⏱️ Application Deadline & Timelock Checker
- Time-sensitive protocol simulator for contracts relying on `block.timestamp`.
- Supports categories: Vesting Release, Timelock Controller Delay, Auction Expiry, Staking Lockup, and DAO Voting Windows.
- Automatically calculates:
  - Expiry status (Passed / Active).
  - Time remaining countdown or time elapsed.
  - Projected block number on BOTChain when the deadline will trigger based on live moving average block time.
  - **EVM $\pm 15$s Timestamp Manipulation Warning**: Alerts developers if the deadline delta falls within the consensus tolerance window where block producers can legally adjust timestamps.

### 4. 📊 Gas & Block Progression Ticker
- Live feed of the last 10 blocks on BOTChain Testnet.
- Network congestion meter (Low, Moderate, High Congestion based on EVM gas capacity).
- Real-time block interval calculations and gas limits.

### 5. 📜 On-Chain Investigation Registry (`BlockTimeRegistry.sol`)
- Developers and auditors can record verifiable investigation audits directly on BOTChain Testnet.
- Stores target block number, target deadline, category, investigator address, and custom debugging notes.
- Historical investigation ledger with direct one-click buttons to inspect referenced blocks.

### 6. 🧰 Developer Security Tools
- Two-way Unix epoch converter (Human Date <-> Unix seconds <-> Milliseconds).
- EVM miner drift simulation calculator.
- Timelock delay calculator: calculates exact projected block heights for custom duration offsets.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS (White and Blue palette), Lucide Icons
- **Web3 & Wallet**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`, `@tanstack/react-query`
- **Smart Contracts**: Solidity `^0.8.20`, Hardhat

---

## ⚙️ Environment Variables

The project uses a clean `.env` file (see `.env.example`):

```env
# BOTChain Testnet Private Key for deploying BlockTimeRegistry.sol
PRIVATE_KEY=your_private_key_here

# Reown Project ID for AppKit wallet connection
REOWN_ID=your_reown_project_id_here
```

> **Note**: As configured, `REOWN_ID` is used directly in `vite.config.ts` via `dotenv` without requiring the public `VITE_` prefix.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Compile Smart Contracts
```bash
npm run compile
```

### 4. Deploy or Re-deploy Contract
```bash
npm run deploy
```
This deploys `BlockTimeRegistry.sol` to BOTChain Testnet and automatically updates `src/config/deployed.json`.

### 5. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
blockTime/
├── contracts/
│   └── BlockTimeRegistry.sol       # On-chain investigation and block inspection registry
├── scripts/
│   └── deploy.cjs                  # Automated deployment script to BOTChain Testnet
├── src/
│   ├── components/
│   │   ├── BlockInspector.tsx      # Single block inspection requiring gas fee
│   │   ├── BlockComparator.tsx     # Side-by-side block timestamp & progression comparator
│   │   ├── DeadlineChecker.tsx     # Application timelock & deadline simulator
│   │   ├── GasMetrics.tsx          # Real-time gas capacity and progression ticker
│   │   ├── InvestigationRegistry.tsx # On-chain historical audit log interface
│   │   ├── Navbar.tsx              # Navigation header with live block status & Reown wallet
│   │   ├── ReownAlertBanner.tsx    # Wallet setup helper banner
│   │   └── TimeSensitivityTools.tsx # EVM 15s drift calculator & epoch converter
│   ├── config/
│   │   ├── chains.ts               # BOTChain Testnet viem chain definition
│   │   ├── contract.ts             # BlockTimeRegistry ABI & address configuration
│   │   ├── deployed.json           # Live deployed contract deployment metadata
│   │   └── wagmi.ts                # Reown AppKit + Wagmi v2 configuration
│   ├── utils/
│   │   ├── formatters.ts           # Timestamps, dates, gas, and hash formatters
│   │   └── rpc.ts                  # BOTChain RPC query and block projection utilities
│   ├── App.tsx                     # Main layout with tab navigation
│   ├── index.css                   # Tailwind styling
│   └── main.tsx                    # React root with Wagmi & React Query providers
├── hardhat.config.cjs              # Hardhat configuration for BOTChain
├── vite.config.ts                  # Vite build configuration (inlining REOWN_ID)
├── package.json
├── WHITEPAPER.md                   # Formal protocol whitepaper
├── README.md                       # Documentation & guide
└── .gitignore                      # Git ignore rules protecting private keys & env
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
