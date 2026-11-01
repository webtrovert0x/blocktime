import React, { useState } from 'react';
import {
  formatDurationSeconds,
  formatTimestamp,
  formatUtc,
} from '../utils/formatters';
import { Wrench, ShieldAlert, Clock, ArrowRight, Calculator } from 'lucide-react';

interface TimeSensitivityToolsProps {
  currentBlockNumber?: bigint | null;
  currentBlockTimestamp?: number;
  averageBlockTime: number;
}

export const TimeSensitivityTools: React.FC<TimeSensitivityToolsProps> = ({
  currentBlockNumber = 0n,
  currentBlockTimestamp = Math.floor(Date.now() / 1000),
  averageBlockTime = 3,
}) => {
  const safeBlockNumber = currentBlockNumber ?? 0n;
  // Epoch Converter state
  const [unixInput, setUnixInput] = useState<string>(currentBlockTimestamp.toString());
  const [dateInput, setDateInput] = useState<string>(
    new Date(currentBlockTimestamp * 1000).toISOString().slice(0, 16)
  );

  // Timelock Delay Estimator state
  const [delayHours, setDelayHours] = useState<string>('48');

  // Miner Drift Test state
  const [testDeadlineOffset, setTestDeadlineOffset] = useState<string>('10');

  // Convert Unix -> Date
  const handleUnixChange = (val: string) => {
    setUnixInput(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      try {
        setDateInput(new Date(num * 1000).toISOString().slice(0, 16));
      } catch (e) {}
    }
  };

  // Convert Date -> Unix
  const handleDateChange = (val: string) => {
    setDateInput(val);
    try {
      const parsed = new Date(val).getTime();
      if (!isNaN(parsed)) {
        setUnixInput(Math.floor(parsed / 1000).toString());
      }
    } catch (e) {}
  };

  // Timelock calculation
  const hoursNum = parseFloat(delayHours) || 0;
  const totalDelaySeconds = hoursNum * 3600;
  const projectedUnlockTimestamp = currentBlockTimestamp + totalDelaySeconds;
  const estimatedBlocksRequired = Math.round(totalDelaySeconds / (averageBlockTime || 3));
  const projectedUnlockBlock = safeBlockNumber + BigInt(estimatedBlocksRequired);

  // Miner variance calculation
  const offsetSec = parseInt(testDeadlineOffset) || 0;
  const deadlineForTest = currentBlockTimestamp + offsetSec;
  const canMinerBypass = offsetSec <= 15 && offsetSec >= -15;

  return (
    <div className="space-y-6">
      {/* 1. EVM Miner Timestamp Drift Security Tester */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              EVM 15-Second Miner Timestamp Drift Auditor
            </h3>
            <p className="text-xs text-slate-500">
              EVM consensus allows block timestamps to deviate by up to ~15 seconds from wall-clock time.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hypothetical Application Deadline Offset (seconds from now)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={testDeadlineOffset}
                  onChange={(e) => setTestDeadlineOffset(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">seconds</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Deadline Unix Timestamp
              </label>
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                {deadlineForTest}
              </div>
            </div>
          </div>

          {/* Vulnerability Verdict */}
          <div
            className={`p-4 rounded-xl border text-xs ${
              canMinerBypass
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-green-50 border-green-200 text-green-900'
            }`}
          >
            <div className="font-bold text-sm mb-1">
              {canMinerBypass
                ? '⚠️ Vulnerable to Timestamp Manipulation'
                : '✅ Safe: Outside 15-Second Drift Window'}
            </div>
            <p className="text-xs">
              {canMinerBypass ? (
                <>
                  Because the deadline is within <strong>&plusmn;15 seconds</strong> of the block timestamp, a
                  block producer can legally set <code>block.timestamp = {deadlineForTest}</code> early, prematurely
                  triggering conditions like <code>require(block.timestamp &gt;= deadline)</code> without waiting in
                  real time.
                </>
              ) : (
                <>
                  The {offsetSec}s offset is sufficiently larger than the EVM 15-second variance bound. Miners
                  cannot falsify the block timestamp to prematurely trigger this deadline without rejecting the block.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Timelock Delay & Block Progression Estimator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Timelock Delay & Block Height Estimator
            </h3>
            <p className="text-xs text-slate-500">
              Calculate projected block heights for protocol delays (OpenZeppelin TimelockController, DAO voting, etc.)
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delay Period (Hours)
              </label>
              <input
                type="number"
                value={delayHours}
                onChange={(e) => setDelayHours(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Block Height
              </label>
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                #{safeBlockNumber.toString()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Effective Cadence
              </label>
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                {averageBlockTime.toFixed(2)} seconds/block
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Blocks to elapse</span>
              <span className="text-lg font-bold font-mono text-blue-700">
                ~{estimatedBlocksRequired.toLocaleString()} blocks
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Projected Execution Block</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                #{projectedUnlockBlock.toString()}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Unlock Timestamp</span>
              <span className="text-sm font-bold font-mono text-slate-800 block">
                {projectedUnlockTimestamp}
              </span>
              <span className="text-[10px] text-slate-400 block truncate" title={formatUtc(projectedUnlockTimestamp)}>
                {formatUtc(projectedUnlockTimestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Epoch & Human Datetime Converter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Two-Way Unix Epoch Converter</h3>
            <p className="text-xs text-slate-500">
              Instantly convert between Solidity <code>block.timestamp</code> seconds and ISO/human calendar formats.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unix Timestamp (Seconds)
            </label>
            <input
              type="text"
              value={unixInput}
              onChange={(e) => handleUnixChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={() => handleUnixChange(Math.floor(Date.now() / 1000).toString())}
              className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset to Current Time
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Human Date & Time (Local)
            </label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="text-[11px] text-slate-500 mt-2 truncate" title={formatUtc(Number(unixInput))}>
              UTC: {formatUtc(Number(unixInput))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
