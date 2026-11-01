import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BLOCK_TIME_REGISTRY_ABI, DEFAULT_CONTRACT_ADDRESS } from '../config/contract';
import { publicClient } from '../utils/rpc';
import {
  formatTimestamp,
  formatUtc,
  shortenAddress,
  formatNumberWithCommas,
} from '../utils/formatters';
import {
  FileText,
  PlusCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface InvestigationItem {
  id: bigint;
  investigator: string;
  targetBlockNumber: bigint;
  targetDeadline: bigint;
  recordedBlockNumber: bigint;
  recordedTimestamp: bigint;
  category: string;
  notes: string;
}

interface InvestigationRegistryProps {
  prefilledBlock?: string;
  prefilledDeadline?: number;
  prefilledNotes?: string;
  onInspectBlock: (blockNum: string) => void;
}

export const InvestigationRegistry: React.FC<InvestigationRegistryProps> = ({
  prefilledBlock = '',
  prefilledDeadline,
  prefilledNotes = '',
  onInspectBlock,
}) => {
  const { isConnected, address } = useAccount();

  const [contractAddress, setContractAddress] = useState<string>(
    DEFAULT_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
      ? DEFAULT_CONTRACT_ADDRESS
      : ''
  );

  const [targetBlock, setTargetBlock] = useState(prefilledBlock);
  const [targetDeadline, setTargetDeadline] = useState(
    prefilledDeadline ? prefilledDeadline.toString() : '0'
  );
  const [category, setCategory] = useState('TIMELOCK_VERIFICATION');
  const [notes, setNotes] = useState(prefilledNotes);

  const [investigationsList, setInvestigationsList] = useState<InvestigationItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Sync props changes
  useEffect(() => {
    if (prefilledBlock) setTargetBlock(prefilledBlock);
  }, [prefilledBlock]);

  useEffect(() => {
    if (prefilledDeadline) setTargetDeadline(prefilledDeadline.toString());
  }, [prefilledDeadline]);

  useEffect(() => {
    if (prefilledNotes) setNotes(prefilledNotes);
  }, [prefilledNotes]);

  // Wagmi contract write
  const {
    writeContract,
    data: txHash,
    isPending: isSubmitting,
    error: submitError,
  } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch recent investigations from contract
  const fetchInvestigations = async () => {
    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return;
    }

    setIsLoadingList(true);
    setListError(null);

    try {
      // Call getRecentInvestigations(0, 30)
      const data = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: BLOCK_TIME_REGISTRY_ABI,
        functionName: 'getRecentInvestigations',
        args: [0n, 30n],
      });

      if (Array.isArray(data)) {
        setInvestigationsList(data as InvestigationItem[]);
      }
    } catch (err: any) {
      console.warn('Error reading from contract:', err);
      setListError('Could not read from contract address. Make sure BlockTimeRegistry is deployed.');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (contractAddress && contractAddress.startsWith('0x')) {
      fetchInvestigations();
    }
  }, [contractAddress, isTxSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      alert('Please deploy BlockTimeRegistry.sol or enter the contract address first.');
      return;
    }

    if (!targetBlock) {
      alert('Please provide a target block number.');
      return;
    }

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: BLOCK_TIME_REGISTRY_ABI,
      functionName: 'recordInvestigation',
      args: [
        BigInt(targetBlock),
        BigInt(targetDeadline || '0'),
        category,
        notes || 'No extra notes provided.',
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Contract Address Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>BlockTimeRegistry On-Chain Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently record and verify time-sensitive contract investigations directly on BOTChain Testnet.
            </p>
          </div>
          <button
            onClick={fetchInvestigations}
            disabled={isLoadingList}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Contract Address (BlockTimeRegistry.sol on BOTChain Testnet)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value.trim())}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {contractAddress && (
              <a
                href={`https://scan.bohr.life/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium flex items-center space-x-1 transition"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {!contractAddress && (
            <p className="text-[11px] text-amber-700 mt-1.5">
              Deploy your contract with <code>npm run deploy</code> after adding your <code>PRIVATE_KEY</code> in{' '}
              <code>.env</code>, or paste your deployed address above.
            </p>
          )}
        </div>
      </div>

      {/* Record Investigation Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          <span>Record New Investigation</span>
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Block Number</label>
              <input
                type="number"
                placeholder="e.g. 102500"
                value={targetBlock}
                onChange={(e) => setTargetBlock(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Deadline Timestamp (Optional)
              </label>
              <input
                type="number"
                placeholder="Unix seconds or 0"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Tag</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="TIMELOCK_VERIFICATION">TIMELOCK_VERIFICATION</option>
                <option value="VESTING_RELEASE">VESTING_RELEASE</option>
                <option value="AUCTION_SETTLEMENT">AUCTION_SETTLEMENT</option>
                <option value="GAS_SPIKE_AUDIT">GAS_SPIKE_AUDIT</option>
                <option value="TIMESTAMP_DRIFT">TIMESTAMP_DRIFT</option>
                <option value="ORACLE_HEARTBEAT">ORACLE_HEARTBEAT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Notes & Context</label>
            <textarea
              rows={2}
              placeholder="e.g. Checked timelock delay consistency for vault contract release..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              {isConnected ? (
                <span className="text-green-700 font-medium">Connected: {shortenAddress(address)}</span>
              ) : (
                <span className="text-slate-500">Connect wallet to sign and submit investigation</span>
              )}
            </span>

            <button
              type="submit"
              disabled={isSubmitting || isWaitingForTx || !isConnected}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>Confirming in Wallet...</span>
              ) : isWaitingForTx ? (
                <span>Waiting for Block Inclusion...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit to BOTChain</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Transaction confirmation feedback */}
        {isTxSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Investigation record successfully committed to BOTChain!</span>
            </div>
            {txHash && (
              <a
                href={`https://scan.bohr.life/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline font-mono text-[11px] hover:text-green-950"
              >
                View Tx
              </a>
            )}
          </div>
        )}

        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Transaction error: {submitError.message}</span>
          </div>
        )}
      </div>

      {/* Recorded Investigations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Historical Investigations Registry</h4>
            <p className="text-xs text-slate-500">
              Total Recorded: <strong>{investigationsList.length}</strong>
            </p>
          </div>
        </div>

        {listError && (
          <div className="p-6 text-center text-xs text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>{listError}</p>
          </div>
        )}

        {!listError && investigationsList.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No investigations recorded yet on this contract.</p>
            <p className="mt-1">Fill out the form above to log the first block investigation.</p>
          </div>
        )}

        {!listError && investigationsList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target Block</th>
                  <th className="py-3 px-4">Target Deadline</th>
                  <th className="py-3 px-4">Investigator</th>
                  <th className="py-3 px-4">Recorded At</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investigationsList.map((item) => (
                  <tr key={item.id.toString()} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #{item.id.toString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{item.targetBlockNumber.toString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.targetDeadline > 0n ? item.targetDeadline.toString() : 'None'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600" title={item.investigator}>
                      {shortenAddress(item.investigator)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatTimestamp(item.recordedTimestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.notes}>
                      {item.notes}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onInspectBlock(item.targetBlockNumber.toString())}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded text-[11px] transition"
                      >
                        Inspect Block
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

