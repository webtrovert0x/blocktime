import React from 'react';
import { projectId } from '../config/wagmi';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ReownAlertBanner: React.FC = () => {
  if (projectId && projectId.length >= 10) {
    return null; // All good, do not show banner
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Reown AppKit Configuration:</strong> Add your project ID to{' '}
            <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">REOWN_ID</code> in{' '}
            <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">.env</code> to connect
            wallets. Block inspection, RPC reading, and calculations on BOTChain Mainnet work without any setup!
          </span>
        </div>
        <a
          href="https://cloud.reown.com"
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 flex-shrink-0"
        >
          Get Reown ID &rarr;
        </a>
      </div>
    </div>
  );
};

