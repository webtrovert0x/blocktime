import React, { useState, useEffect } from 'react';
import type { Block } from 'viem';
import {
  formatTimestamp,
  formatUtc,
  formatDurationSeconds,
  formatNumberWithCommas,
} from '../utils/formatters';
import { projectBlockForDeadline } from '../utils/rpc';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface DeadlineCheckerProps {
  latestBlock: Block | null;
  averageBlockTime: number;
  initialDeadline?: number;
  onSendToInvestigation: (blockNum: string, deadline: number, notes?: string) => void;
}

export const DeadlineChecker: React.FC<DeadlineCheckerProps> = ({
  latestBlock,
  averageBlockTime,
  initialDeadline,
  onSendToInvestigation,
}) => {
  const [targetTimestampInput, setTargetTimestampInput] = useState<string>(
    initialDeadline ? initialDeadline.toString() : ''
  );
  const [category, setCategory] = useState<string>('TIMELOCK_VERIFICATION');

  // Initialize with a default 24h future deadline if empty
  useEffect(() => {
    if (!targetTimestampInput && latestBlock) {
      const futureTs = Number(latestBlock.timestamp) + 86400; // +24 hours
      setTargetTimestampInput(futureTs.toString());
    }
  }, [latestBlock]);

  // Set quick presets
  const applyPresetSeconds = (secondsToAdd: number) => {
    if (!latestBlock) return;
    const newTs = Number(latestBlock.timestamp) + secondsToAdd;
    setTargetTimestampInput(newTs.toString());
  };

  const targetTs = Number(targetTimestampInput);
  const isValidTimestamp = !isNaN(targetTs) && targetTs > 0;

  const currentTs = latestBlock ? Number(latestBlock.timestamp) : Math.floor(Date.now() / 1000);
  const currentBlockNum = latestBlock?.number ?? 0n;

  // Projection calculation
  const projection = isValidTimestamp
    ? projectBlockForDeadline(targetTs, currentBlockNum, currentTs, averageBlockTime)
    : null;

  const absDelta = projection ? Math.abs(projection.deltaSeconds) : 0;
  const isWithinMinerVariance = absDelta <= 15; // EVM 15-second miner timestamp leeway rule

  return (
    <div className="space-y-6">
      {/* Top Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Application Deadline & Timelock Inspector</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Simulate and audit how time-sensitive smart contracts (vesting, timelocks, Dutch auctions, governance windows)
          behave relative to BOTChain block timestamps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Deadline (Unix Timestamp in seconds)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 1730000000"
                value={targetTimestampInput}
                onChange={(e) => setTargetTimestampInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              <button
                type="button"
                onClick={() => applyPresetSeconds(-3600)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                1h Ago
              </button>
              <button
                type="button"
                onClick={() => applyPresetSeconds(3600)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPresetSeconds(86400)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                +24 Hours
              </button>
              <button
                type="button"
                onClick={() => applyPresetSeconds(604800)}
                className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
              >
                +7 Days
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Application Contract Purpose</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TIMELOCK_VERIFICATION">Timelock Controller Delay</option>
              <option value="VESTING_RELEASE">Token Vesting Cliff / Unlock</option>
              <option value="AUCTION_SETTLEMENT">Dutch / English Auction Expiry</option>
              <option value="STAKING_LOCK">Staking Lockup / Cooldown Period</option>
              <option value="GOVERNANCE_WINDOW">DAO Voting Window</option>
              <option value="ORACLE_TIMEOUT">Oracle Heartbeat / Freshness Check</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              Current BOTChain moving average block time: <strong>{averageBlockTime.toFixed(2)}s</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Projection & Analysis Box */}
      {isValidTimestamp && projection && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              projection.hasPassed
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200/80">
              <div className="flex items-center space-x-3">
                {projection.hasPassed ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Hourglass className="w-6 h-6 animate-pulse" />
                  </div>
                )}
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      projection.hasPassed
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {projection.hasPassed ? 'DEADLINE PASSED (TRIGGER ACTIVE)' : 'DEADLINE PENDING (LOCKED)'}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">
                    {projection.hasPassed
                      ? `Passed ${formatDurationSeconds(absDelta)} ago`
                      : `Expires in ${formatDurationSeconds(absDelta)}`}
                  </h4>
                </div>
              </div>

              <button
                onClick={() =>
                  onSendToInvestigation(
                    currentBlockNum.toString(),
                    targetTs,
                    `Deadline check: status=${projection.hasPassed ? 'PASSED' : 'PENDING'}, delta=${absDelta}s, projectedBlock=${projection.projectedBlock.toString()}`
                  )
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Record Deadline Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Target Deadline</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {targetTs}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={formatUtc(targetTs)}>
                  {formatUtc(targetTs)}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Current Block Timestamp</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {currentTs}
                </div>
                <div className="text-[11px] text-slate-500">
                  Block #{currentBlockNum.toString()}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  {projection.hasPassed ? 'Triggered At Est. Block' : 'Projected Execution Block'}
                </span>
                <div className="text-lg font-bold text-blue-700 font-mono mt-0.5">
                  #{projection.projectedBlock.toString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  {projection.hasPassed
                    ? `~${formatNumberWithCommas(currentBlockNum - projection.projectedBlock)} blocks ago`
                    : `~${formatNumberWithCommas(projection.blocksRemaining)} blocks remaining`}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-xl p-3.5 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Precision Rating</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {isWithinMinerVariance ? 'High Variance' : 'High Precision'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Cadence: ~{averageBlockTime.toFixed(1)}s/block
                </div>
              </div>
            </div>
          </div>

          {/* EVM Timestamp Variance / Miner Leeway Warning */}
          {isWithinMinerVariance && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-900">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h5 className="font-bold text-amber-800 text-sm">
                    Time-Sensitive Contract Security Alert: EVM $\pm 15$s Manipulation Window
                  </h5>
                  <p>
                    The difference between the target deadline and block timestamp is currently{' '}
                    <strong>{absDelta}s</strong> (within the consensus timestamp leeway limit of 15 seconds).
                  </p>
                  <p className="text-amber-700">
                    If your contract code uses <code>require(block.timestamp &gt;= deadline)</code>, miners or
                    validators could artificially adjust the block timestamp by a few seconds to trigger or stall
                    execution early. Always ensure critical timelocks use generous buffer windows!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
