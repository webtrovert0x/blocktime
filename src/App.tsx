import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReownAlertBanner } from './components/ReownAlertBanner';
import { BlockInspector } from './components/BlockInspector';
import { BlockComparator } from './components/BlockComparator';
import { DeadlineChecker } from './components/DeadlineChecker';
import { GasMetrics } from './components/GasMetrics';
import { InvestigationRegistry } from './components/InvestigationRegistry';
import { TimeSensitivityTools } from './components/TimeSensitivityTools';
import { BlockTimeLogo } from './components/BlockTimeLogo';
import { BotChainLogo } from './components/BotChainLogo';
import {
  fetchBlockWithDelta,
  fetchRecentBlocks,
  type ExtendedBlockInfo,
} from './utils/rpc';
import type { Block } from 'viem';
import {
  Search,
  ArrowLeftRight,
  Clock,
  Zap,
  FileSpreadsheet,
  Wrench,
  Activity,
  Layers,
} from 'lucide-react';

type TabType = 'inspector' | 'comparator' | 'deadline' | 'gas' | 'registry' | 'tools';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inspector');

  // Core block data state
  const [currentBlockInfo, setCurrentBlockInfo] = useState<ExtendedBlockInfo | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [averageBlockTime, setAverageBlockTime] = useState<number>(3);
  const [averageGasUsed, setAverageGasUsed] = useState<bigint>(0n);
  const [averageGasLimit, setAverageGasLimit] = useState<bigint>(30000000n);
  const [isLoadingBlock, setIsLoadingBlock] = useState<boolean>(true);

  // Cross-tab transfer states
  const [comparatorBlockA, setComparatorBlockA] = useState<string>('');
  const [comparatorBlockB, setComparatorBlockB] = useState<string>('');
  const [deadlineTarget, setDeadlineTarget] = useState<number | undefined>(undefined);
  const [registryPrefillBlock, setRegistryPrefillBlock] = useState<string>('');
  const [registryPrefillDeadline, setRegistryPrefillDeadline] = useState<number | undefined>(undefined);
  const [registryPrefillNotes, setRegistryPrefillNotes] = useState<string>('');

  // Initial load & polling
  const loadLatestData = async (silent = false) => {
    if (!silent) setIsLoadingBlock(true);
    try {
      const [blockInfo, recentData] = await Promise.all([
        fetchBlockWithDelta('latest'),
        fetchRecentBlocks(10),
      ]);
      setCurrentBlockInfo(blockInfo);
      setRecentBlocks(recentData.blocks);
      setAverageBlockTime(recentData.averageBlockTime);
      setAverageGasUsed(recentData.averageGasUsed);
      setAverageGasLimit(recentData.averageGasLimit);
    } catch (err) {
      console.error('Failed to fetch latest BOTChain block:', err);
    } finally {
      if (!silent) setIsLoadingBlock(false);
    }
  };

  useEffect(() => {
    loadLatestData();
    // Poll every 5 seconds for live BOTChain updates
    const interval = setInterval(() => {
      loadLatestData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for cross-component interactions
  const handleSearchBlock = async (query: string) => {
    setIsLoadingBlock(true);
    try {
      const clean = query.trim();
      if (clean === 'latest') {
        const info = await fetchBlockWithDelta('latest');
        setCurrentBlockInfo(info);
      } else if (clean.startsWith('0x')) {
        const info = await fetchBlockWithDelta(clean as `0x${string}`);
        setCurrentBlockInfo(info);
      } else {
        const info = await fetchBlockWithDelta(BigInt(clean));
        setCurrentBlockInfo(info);
      }
    } catch (err: any) {
      alert(`Could not load block "${query}": ${err?.message || 'Block not found'}`);
    } finally {
      setIsLoadingBlock(false);
    }
  };

  const handleSendToComparator = (blockNum: string) => {
    setComparatorBlockA(blockNum);
    const num = BigInt(blockNum);
    if (num > 1n) {
      setComparatorBlockB((num - 1n).toString());
    }
    setActiveTab('comparator');
  };

  const handleSendToDeadlineChecker = (blockNum: string, timestamp: number) => {
    setDeadlineTarget(timestamp);
    setActiveTab('deadline');
  };

  const handleSendToInvestigation = (
    blockNum: string,
    deadlineOrNotes?: number | string,
    notesParam?: string
  ) => {
    setRegistryPrefillBlock(blockNum);
    if (typeof deadlineOrNotes === 'number') {
      setRegistryPrefillDeadline(deadlineOrNotes);
      setRegistryPrefillNotes(notesParam || '');
    } else {
      setRegistryPrefillNotes(deadlineOrNotes || '');
    }
    setActiveTab('registry');
  };

  const latestBlock = currentBlockInfo?.block || (recentBlocks[0] || null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar latestBlockNumber={latestBlock?.number} />
      <ReownAlertBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'inspector'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Block Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('comparator')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'comparator'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Block Comparator</span>
          </button>

          <button
            onClick={() => setActiveTab('deadline')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'deadline'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Deadline & Timelock Checker</span>
          </button>

          <button
            onClick={() => setActiveTab('gas')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'gas'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Gas & Progression Ticker</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'registry'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Investigation Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Developer Security Tools</span>
          </button>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'inspector' && (
            <BlockInspector
              currentBlockInfo={currentBlockInfo}
              isLoading={isLoadingBlock}
              onSearchBlock={handleSearchBlock}
              onSendToComparator={handleSendToComparator}
              onSendToDeadlineChecker={handleSendToDeadlineChecker}
              onSendToInvestigation={(b) => handleSendToInvestigation(b)}
            />
          )}

          {activeTab === 'comparator' && (
            <BlockComparator
              initialBlockA={
                comparatorBlockA ||
                (latestBlock && latestBlock.number !== null ? latestBlock.number.toString() : '')
              }
              initialBlockB={
                comparatorBlockB ||
                (latestBlock && latestBlock.number !== null && latestBlock.number > 1n
                  ? (latestBlock.number - 1n).toString()
                  : '')
              }
              onSendToInvestigation={(b, notes) => handleSendToInvestigation(b, notes)}
            />
          )}

          {activeTab === 'deadline' && (
            <DeadlineChecker
              latestBlock={latestBlock}
              averageBlockTime={averageBlockTime}
              initialDeadline={deadlineTarget}
              onSendToInvestigation={(b, d, notes) => handleSendToInvestigation(b, d, notes)}
            />
          )}

          {activeTab === 'gas' && (
            <GasMetrics
              recentBlocks={recentBlocks}
              averageBlockTime={averageBlockTime}
              averageGasUsed={averageGasUsed}
              averageGasLimit={averageGasLimit}
              onSelectBlock={(b) => {
                handleSearchBlock(b);
                setActiveTab('inspector');
              }}
            />
          )}

          {activeTab === 'registry' && (
            <InvestigationRegistry
              prefilledBlock={registryPrefillBlock}
              prefilledDeadline={registryPrefillDeadline}
              prefilledNotes={registryPrefillNotes}
              onInspectBlock={(b) => {
                handleSearchBlock(b);
                setActiveTab('inspector');
              }}
            />
          )}

          {activeTab === 'tools' && (
            <TimeSensitivityTools
              currentBlockNumber={latestBlock?.number}
              currentBlockTimestamp={latestBlock ? Number(latestBlock.timestamp) : undefined}
              averageBlockTime={averageBlockTime}
            />
          )}
        </div>
      </main>

      {/* BOT Chain Ecosystem Showcase Section */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-sm flex-shrink-0">
                  <BotChainLogo className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold tracking-tight text-white">BOT Chain Ecosystem</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur border border-white/30">
                      Mainnet Live
                    </span>
                  </div>
                  <p className="text-xs text-blue-100">
                    High-performance, AI-optimized EVM blockchain powering next-generation dApps
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
              >
                <BotChainLogo className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span>BOT Chain Website</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">botchain.ai</span>
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur transition flex items-center space-x-2"
              >
                <BotChainLogo className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span>BOT Chain Explorer</span>
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">scan.botchain.ai</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-3">
              <BlockTimeLogo className="w-9 h-9 rounded-xl shadow-sm flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 text-sm">BlockTime Inspector</span>
                <span className="text-slate-400 text-xs ml-2">BOT Chain Mainnet (Chain ID 677)</span>
              </div>
            </div>

            {/* Required Links in Footer with Official BOTChain Logo */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-blue-600 flex items-center space-x-2 transition"
              >
                <BotChainLogo className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span className="font-semibold text-slate-900">BOT Chain Website:</span>
                <span className="text-blue-600 underline">https://botchain.ai</span>
              </a>

              <span className="text-slate-300 hidden sm:inline">&bull;</span>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-blue-600 flex items-center space-x-2 transition"
              >
                <BotChainLogo className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span className="font-semibold text-slate-900">BOT Chain Explorer:</span>
                <span className="text-blue-600 underline">https://scan.botchain.ai</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
            <div>
              Verified Smart Contract:{' '}
              <a
                href="https://scan.botchain.ai/address/0x6Df0eD4cf20Dff23376cab013Dea4f45DB53f2CD#code"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-blue-600 hover:text-blue-800 underline"
              >
                0x6Df0eD4cf20Dff23376cab013Dea4f45DB53f2CD
              </a>{' '}
              <span className="text-green-600 font-semibold ml-1">✓ Verified</span>
            </div>
            <div>&copy; 2026 BlockTime Protocol. Built on BOT Chain.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
