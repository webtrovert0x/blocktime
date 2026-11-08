import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botchainMainnet } from './chains';
import { http } from 'viem';

// REOWN_ID injected at build/runtime from .env
export const projectId = (process.env.REOWN_ID || '').trim();

// Fallback project ID for initial initialization if user hasn't configured .env yet
const activeProjectId = projectId || '00000000000000000000000000000000';

export const metadata = {
  name: 'BlockTime — Block & Timestamp Inspector',
  description: 'Block-level debugging utility for time-sensitive contracts on BOTChain Mainnet',
  url: 'https://scan.botchain.ai',
  icons: ['https://scan.botchain.ai/favicon.ico'],
};

export const networks = [botchainMainnet] as const;

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId: activeProjectId,
  networks: [botchainMainnet],
  transports: {
    [botchainMainnet.id]: http('https://rpc.botchain.ai'),
  },
});

// Initialize Reown AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainMainnet],
  metadata,
  projectId: activeProjectId,
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#2563eb', // Blue theme matching requirements
    '--w3m-border-radius-master': '8px',
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
