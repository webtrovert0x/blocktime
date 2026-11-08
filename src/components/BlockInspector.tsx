import React, { useState, useEffect } from 'react';
import type { ExtendedBlockInfo } from '../utils/rpc';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BLOCK_TIME_REGISTRY_ABI, DEFAULT_CONTRACT_ADDRESS } from '../config/contract';
import { publicClient } from '../utils/rpc';
import {
  formatTimestamp,
  formatUtc,
  formatRelativeTime,
  formatDurationSeconds,
  formatNumberWithCommas,
  shortenAddress,
} from '../utils/formatters';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Fuel,
  Wallet,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface InspectionRequestItem {
  id: bigint;
  requester: string;
  blockNumber: bigint;
  timestamp: bigint;
  feePaid: bigint;
}

interface BlockInspectorProps {
  currentBlockInfo: ExtendedBlockInfo | null;
  isLoading: boolean;
  onSearchBlock: (query: string) => void;
  onSendToComparator: (blockNum: string) => void;
  onSendToDeadlineChecker: (blockNum: string, timestamp: number) => void;
  onSendToInvestigation: (blockNum: string) => void;
}

export const BlockInspector: React.FC<BlockInspectorProps> = ({
  currentBlockInfo,
  isLoading,
  onSearchBlock,
  onSendToComparator,
  onSendToDeadlineChecker,
  onSendToInvestigation,
}) => {
  const { isConnected, address } = useAccount();

  const [searchInput, setSearchInput] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [targetBlockToInspect, setTargetBlockToInspect] = useState<string>('');
  const [recentRequests, setRecentRequests] = useState<InspectionRequestItem[]>([]);
  const [lastTxReceipt, setLastTxReceipt] = useState<{ hash: string; gasUsed: bigint } | null>(null);

  // Wagmi contract write for requestBlockInspection
  const {
    writeContract,
    data: txHash,
    isPending: isSubmittingTx,
    error: submitTxError,
  } = useWriteContract();

  const {
    isLoading: isWaitingForTx,
    isSuccess: isTxSuccess,
    data: txReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // When tx is confirmed, fetch block and update receipt info
  useEffect(() => {
    if (isTxSuccess && targetBlockToInspect) {
      if (txReceipt) {
        setLastTxReceipt({
          hash: txReceipt.transactionHash,
          gasUsed: txReceipt.gasUsed,
        });
      }
      // Load the block metadata from BOTChain
      onSearchBlock(targetBlockToInspect);
      fetchRecentInspectionRequests();
    }
  }, [isTxSuccess, txReceipt]);

  // Load recent on-chain inspection requests from contract
  const fetchRecentInspectionRequests = async () => {
    try {
      const data = await publicClient.readContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: BLOCK_TIME_REGISTRY_ABI,
        functionName: 'getRecentInspectionRequests',
        args: [0n, 10n],
      });
      if (Array.isArray(data)) {
        setRecentRequests(data as InspectionRequestItem[]);
      }
    } catch (e) {
      console.warn('Could not fetch inspection requests:', e);
    }
  };

  useEffect(() => {
    fetchRecentInspectionRequests();
  }, []);

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    if (!isConnected) {
      alert('Please connect your wallet first. Inspecting a block on BOTChain requires an on-chain transaction and gas fee.');
      return;
    }

    // Prepare block number
    let blockNumToInspect = query;
    if (query === 'latest') {
      blockNumToInspect = currentBlockInfo?.block?.number
        ? currentBlockInfo.block.number.toString()
        : '0';
    }

    setTargetBlockToInspect(blockNumToInspect);

    // Execute on-chain transaction requiring gas fee
    writeContract({
      address: DEFAULT_CONTRACT_ADDRESS,
      abi: BLOCK_TIME_REGISTRY_ABI,
      functionName: 'requestBlockInspection',
      args: [BigInt(blockNumToInspect)],
    });
  };

  const handleQuickInspectLatest = () => {
    if (!isConnected) {
      alert('Please connect your wallet first. Inspecting a block on BOTChain requires an on-chain transaction and gas fee.');
      return;
    }

    const latestNum = currentBlockInfo?.block?.number
      ? currentBlockInfo.block.number.toString()
      : 'latest';

    setSearchInput(latestNum);
    setTargetBlockToInspect(latestNum);

    writeContract({
      address: DEFAULT_CONTRACT_ADDRESS,
      abi: BLOCK_TIME_REGISTRY_ABI,
      functionName: 'requestBlockInspection',
      args: [BigInt(latestNum === 'latest' ? 0 : latestNum)],
    });
  };

  const block = currentBlockInfo?.block;
  const blockNum = block?.number ?? 0n;
  const deltaSeconds = currentBlockInfo?.deltaSeconds;
  const gasUtilization = currentBlockInfo?.gasUtilization || 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Gas-Fee Inspection Trigger Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                On-Chain Block Inspection <span className="text-blue-600 font-semibold">(Requires Gas Fee)</span>
              </h3>
              <p className="text-xs text-slate-500">
                To inspect a block, submit an inquiry transaction to <code>BlockTimeRegistry</code> on BOTChain.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>Standard Network Gas</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleInspectSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Block Number to inspect (e.g. 102500, or latest block height)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmittingTx || isWaitingForTx || !isConnected}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-2 flex-shrink-0"
              >
                {isSubmittingTx ? (
                  <span>Signing in Wallet...</span>
                ) : isWaitingForTx ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                    <span>Waiting for Block (Paying Gas)...</span>
                  </span>
                ) : (
                  <>
                    <Fuel className="w-4 h-4" />
                    <span>Pay Gas &amp; Inspect</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickInspectLatest}
                disabled={isSubmittingTx || isWaitingForTx || !isConnected}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition flex-shrink-0 disabled:opacity-50"
              >
                Inspect Latest (With Gas)
              </button>
            </div>
          </div>

          {!isConnected && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Wallet Not Connected:</strong> You must connect your wallet to submit the on-chain inspection
                  transaction and pay the gas fee on BOTChain Mainnet.
                </span>
              </div>
              <div className="flex-shrink-0">
                {/* @ts-ignore Reown web component */}
                <appkit-button balance="hide" />
              </div>
            </div>
          )}

          {/* Transaction Pending / Success Banner */}
          {isWaitingForTx && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-3">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <p className="font-semibold">Submitting inspection request to BOTChain Mainnet...</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Transaction submitted with gas fee. Once confirmed, the block details will automatically unlock!
                </p>
              </div>
            </div>
          )}

          {lastTxReceipt && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-900 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>
                  <strong>Inspection Confirmed on BOTChain!</strong> Gas Used:{' '}
                  <code className="font-mono font-bold bg-green-100 text-green-800 px-1 py-0.5 rounded">
                    {formatNumberWithCommas(lastTxReceipt.gasUsed)} gas
                  </code>
                </span>
              </div>
              <a
                href={`https://scan.botchain.ai/tx/${lastTxReceipt.hash}`}
                target="_blank"
                rel="noreferrer"
                className="underline font-mono text-[11px] text-green-800 hover:text-green-950 flex items-center space-x-1"
              >
                <span>View Gas Tx on BotScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {submitTxError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Inspection transaction error: {submitTxError.message}</span>
            </div>
          )}
        </form>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-slate-600 font-medium">Retrieving block metadata from BOTChain RPC...</p>
        </div>
      )}

      {/* Main Block Inspection Details Card */}
      {!isLoading && block && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Block #{blockNum.toString()}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Inspected on BOTChain
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 font-mono">
                  <span>Hash:</span>
                  <span className="text-slate-700 truncate max-w-xs sm:max-w-md">{block.hash}</span>
                  <button
                    onClick={() => block.hash && copyToClipboard(block.hash)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                    title="Copy Hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://scan.botchain.ai/block/${blockNum.toString()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-slate-100 rounded text-blue-600 hover:text-blue-800 transition"
                    title="View on BotScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSendToComparator(blockNum.toString())}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                >
                  <span>Compare Block</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSendToDeadlineChecker(blockNum.toString(), Number(block.timestamp))}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Check Deadline</span>
                </button>
                <button
                  onClick={() => onSendToInvestigation(blockNum.toString())}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Log Investigation</span>
                </button>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Timestamp Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Block Timestamp</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {block.timestamp.toString()}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {formatRelativeTime(block.timestamp)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={formatUtc(block.timestamp)}>
                  UTC: {formatUtc(block.timestamp)}
                </div>
              </div>

              {/* Block Time Delta Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Block Time Progression (&Delta;t)</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {deltaSeconds !== undefined ? `${deltaSeconds}s` : 'Genesis / N/A'}
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  {deltaSeconds !== undefined && deltaSeconds <= 5 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                      Steady Cadence (~{deltaSeconds}s)
                    </span>
                  ) : deltaSeconds !== undefined ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Cadence Delay (+{deltaSeconds}s)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Previous block unknown</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Interval from #{blockNum > 0n ? (blockNum - 1n).toString() : '0'}
                </div>
              </div>

              {/* Gas Utilization Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Gas Utilization</span>
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {gasUtilization.toFixed(2)}%
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      gasUtilization > 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, gasUtilization))}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Used: {formatNumberWithCommas(block.gasUsed)}</span>
                  <span>Limit: {formatNumberWithCommas(block.gasLimit)}</span>
                </div>
              </div>

              {/* Transactions Count Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Transactions</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {Array.isArray(block.transactions) ? block.transactions.length : '0'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Base Fee: {block.baseFeePerGas ? `${formatNumberWithCommas(block.baseFeePerGas)} wei` : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Size: {block.size ? `${formatNumberWithCommas(block.size)} bytes` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Detailed Technical Metadata */}
            <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/75 px-4 py-2.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Block Technical Metadata
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50">
                  <span className="font-semibold text-slate-600">Miner / Validator:</span>
                  <span className="sm:col-span-2 font-mono text-slate-800 break-all">
                    {block.miner || '0x0000000000000000000000000000000000000000'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50">
                  <span className="font-semibold text-slate-600">Parent Hash:</span>
                  <span className="sm:col-span-2 font-mono text-slate-800 break-all">
                    {block.parentHash}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50">
                  <span className="font-semibold text-slate-600">State Root:</span>
                  <span className="sm:col-span-2 font-mono text-slate-800 break-all">
                    {block.stateRoot || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50">
                  <span className="font-semibold text-slate-600">Extra Data:</span>
                  <span className="sm:col-span-2 font-mono text-slate-800 break-all">
                    {block.extraData || '0x'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Gas-Paid Inspection Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">On-Chain Inspection Requests Log</h4>
            <p className="text-xs text-slate-500">
              Audit log of block inspections executed on BlockTimeRegistry with gas fees
            </p>
          </div>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
            Total Logged: {recentRequests.length}
          </span>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <Fuel className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No inspection requests recorded yet.</p>
            <p className="mt-0.5">Submit an inspection above to log the first request on BOTChain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Req #ID</th>
                  <th className="py-3 px-4">Inspected Block</th>
                  <th className="py-3 px-4">Requester Address</th>
                  <th className="py-3 px-4">Recorded At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <tr key={req.id.toString()} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #{req.id.toString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{req.blockNumber.toString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600" title={req.requester}>
                      {shortenAddress(req.requester)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatTimestamp(req.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSearchInput(req.blockNumber.toString());
                          onSearchBlock(req.blockNumber.toString());
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded text-[11px] transition"
                      >
                        View Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
