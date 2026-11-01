import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReownAlertBanner } from './components/ReownAlertBanner';
import { BlockInspector } from './components/BlockInspector';
import { BlockComparator } from './components/BlockComparator';
import { DeadlineChecker } from './components/DeadlineChecker';
import { GasMetrics } from './components/GasMetrics';
import { InvestigationRegistry } from './components/InvestigationRegistry';
import { TimeSensitivityTools } from './components/TimeSensitivityTools';
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">BlockTime Inspector</span>
            <span>&bull;</span>
            <span>BOTChain Testnet (Chain ID 968)</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Explorer (BohrScan)
            </a>
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              RPC Endpoint
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
