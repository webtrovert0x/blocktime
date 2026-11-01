import React from 'react';
import type { Block } from 'viem';
import {
  formatTimestamp,
  formatNumberWithCommas,
  formatRelativeTime,
} from '../utils/formatters';
import { Zap, Activity, Gauge, TrendingUp, Layers } from 'lucide-react';

interface GasMetricsProps {
  recentBlocks: Block[];
  averageBlockTime: number;
  averageGasUsed: bigint;
  averageGasLimit: bigint;
  onSelectBlock: (blockNum: string) => void;
}

export const GasMetrics: React.FC<GasMetricsProps> = ({
  recentBlocks,
  averageBlockTime,
  averageGasUsed,
  averageGasLimit,
  onSelectBlock,
}) => {
  const avgUtilization =
    averageGasLimit > 0n ? (Number(averageGasUsed) / Number(averageGasLimit)) * 100 : 0;

  // Network congestion rating
  let congestionStatus = 'Low';
  let congestionColor = 'text-green-700 bg-green-50 border-green-200';
  if (avgUtilization > 75) {
    congestionStatus = 'High Congestion';
    congestionColor = 'text-red-700 bg-red-50 border-red-200';
  } else if (avgUtilization > 40) {
    congestionStatus = 'Moderate';
    congestionColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return (
    <div className="space-y-6">
      {/* Top Level Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Average Gas Utilization</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {avgUtilization.toFixed(2)}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(2, avgUtilization))}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across recent 10 blocks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Moving Block Interval</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {averageBlockTime.toFixed(2)}s
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 mt-2">
            Stable Production
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target ~3s interval</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Congestion State</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{congestionStatus}</div>
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border mt-2 ${congestionColor}`}>
            Load {avgUtilization.toFixed(1)}%
          </span>
          <div className="text-[11px] text-slate-400 mt-1">EVM Gas Capacity</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Block Gas Limit</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
            {formatNumberWithCommas(averageGasLimit)}
          </div>
          <div className="text-xs text-slate-600 mt-2 font-mono">
            Avg Used: {formatNumberWithCommas(averageGasUsed)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">BOTChain Gas Limit</div>
        </div>
      </div>

      {/* Recent Blocks Gas Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Recent Blocks Progression & Gas Ticker</h4>
            <p className="text-xs text-slate-500">Live block cadence and gas usage on BOTChain Testnet</p>
          </div>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
            Window: {recentBlocks.length} blocks
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentBlocks.map((block, idx) => {
            const bNum = block.number ?? 0n;
            const limit = Number(block.gasLimit || 1n);
            const used = Number(block.gasUsed || 0n);
            const utilization = (used / limit) * 100;
            const prevBlock = recentBlocks[idx + 1];
            const delta = prevBlock ? Number(block.timestamp - prevBlock.timestamp) : null;

            return (
              <div
                key={bNum.toString()}
                onClick={() => onSelectBlock(bNum.toString())}
                className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900 hover:text-blue-600 transition">
                        #{bNum.toString()}
                      </span>
                      {delta !== null && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          +{delta}s
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatRelativeTime(block.timestamp)} &bull; {formatTimestamp(block.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Gas Bar & Stats */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">
                      Gas: {formatNumberWithCommas(block.gasUsed)} / {formatNumberWithCommas(block.gasLimit)}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {utilization.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        utilization > 75 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(1, utilization))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tx count & Base Fee */}
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-800">
                    {Array.isArray(block.transactions) ? block.transactions.length : 0} txs
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {block.baseFeePerGas ? `${formatNumberWithCommas(block.baseFeePerGas)} wei base fee` : 'Standard fee'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
