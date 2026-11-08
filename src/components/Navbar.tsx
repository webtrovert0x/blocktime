import React from 'react';
import { ExternalLink, Activity } from 'lucide-react';
import { BlockTimeLogo } from './BlockTimeLogo';
import { BotChainLogo } from './BotChainLogo';

interface NavbarProps {
  latestBlockNumber?: bigint | null;
  contractAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ latestBlockNumber, contractAddress }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <BlockTimeLogo className="w-10 h-10 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">BlockTime</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full inline-flex items-center space-x-1.5">
                  <BotChainLogo className="w-3.5 h-3.5 rounded-sm" />
                  <span>BOTChain Mainnet</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Block & Timestamp Inspector for Time-Sensitive Contracts
              </p>
            </div>
          </div>

          {/* Network Details & Wallet */}
          <div className="flex items-center space-x-3">
            {/* Live Block Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-slate-500">Block:</span>
              <span className="font-mono font-bold text-slate-800">
                {latestBlockNumber ? `#${latestBlockNumber.toString()}` : 'Connecting...'}
              </span>
            </div>

            {/* BOTChain Badge */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition"
              title="View BOTChain Mainnet Explorer"
            >
              <BotChainLogo className="w-3.5 h-3.5 rounded-sm" />
              <span>Chain ID: 677</span>
              <ExternalLink className="w-3 h-3 text-blue-500" />
            </a>

            {/* Reown AppKit Wallet Button */}
            <div className="wallet-button-container">
              {/* @ts-ignore Reown web component */}
              <appkit-button balance="show" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
