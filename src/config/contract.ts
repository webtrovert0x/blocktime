import deployedConfig from './deployed.json';

// Fallback or dynamically loaded address
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` = (
  (deployedConfig as { address?: string })?.address || '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const BLOCK_TIME_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'requestId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'requester', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'feePaid', type: 'uint256' },
    ],
    name: 'BlockInspectionRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'investigator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'targetBlockNumber', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'targetDeadline', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'category', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'recordedTimestamp', type: 'uint256' },
    ],
    name: 'InvestigationLogged',
    type: 'event',
  },
  {
    inputs: [],
    name: 'inspectionRequestCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'inspectionRequests',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'uint256', name: 'feePaid', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'blockNumber', type: 'uint256' }],
    name: 'requestBlockInspection',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'offset', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'getRecentInspectionRequests',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'requester', type: 'address' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'feePaid', type: 'uint256' },
        ],
        internalType: 'struct BlockTimeRegistry.InspectionRequest[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'investigationCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'investigations',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'address', name: 'investigator', type: 'address' },
      { internalType: 'uint256', name: 'targetBlockNumber', type: 'uint256' },
      { internalType: 'uint256', name: 'targetDeadline', type: 'uint256' },
      { internalType: 'uint256', name: 'recordedBlockNumber', type: 'uint256' },
      { internalType: 'uint256', name: 'recordedTimestamp', type: 'uint256' },
      { internalType: 'string', name: 'category', type: 'string' },
      { internalType: 'string', name: 'notes', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'targetBlockNumber', type: 'uint256' },
      { internalType: 'uint256', name: 'targetDeadline', type: 'uint256' },
      { internalType: 'string', name: 'category', type: 'string' },
      { internalType: 'string', name: 'notes', type: 'string' },
    ],
    name: 'recordInvestigation',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getInvestigation',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'investigator', type: 'address' },
          { internalType: 'uint256', name: 'targetBlockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'targetDeadline', type: 'uint256' },
          { internalType: 'uint256', name: 'recordedBlockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'recordedTimestamp', type: 'uint256' },
          { internalType: 'string', name: 'category', type: 'string' },
          { internalType: 'string', name: 'notes', type: 'string' },
        ],
        internalType: 'struct BlockTimeRegistry.Investigation',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'getInvestigationsBySender',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'offset', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'getRecentInvestigations',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'investigator', type: 'address' },
          { internalType: 'uint256', name: 'targetBlockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'targetDeadline', type: 'uint256' },
          { internalType: 'uint256', name: 'recordedBlockNumber', type: 'uint256' },
          { internalType: 'uint256', name: 'recordedTimestamp', type: 'uint256' },
          { internalType: 'string', name: 'category', type: 'string' },
          { internalType: 'string', name: 'notes', type: 'string' },
        ],
        internalType: 'struct BlockTimeRegistry.Investigation[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'targetDeadline', type: 'uint256' }],
    name: 'verifyDeadline',
    outputs: [
      { internalType: 'bool', name: 'hasPassed', type: 'bool' },
      { internalType: 'uint256', name: 'deltaSeconds', type: 'uint256' },
      { internalType: 'uint256', name: 'currentBlockNumber', type: 'uint256' },
      { internalType: 'uint256', name: 'currentBlockTimestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
