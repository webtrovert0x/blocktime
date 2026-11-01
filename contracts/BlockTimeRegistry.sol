// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BlockTimeRegistry
 * @dev On-chain audit & investigation registry for time-sensitive smart contract debugging.
 * Records block inspection requests (requiring gas fees) and investigation audits on BOTChain Testnet.
 */
contract BlockTimeRegistry {
    struct InspectionRequest {
        uint256 id;
        address requester;
        uint256 blockNumber;
        uint256 timestamp;
        uint256 feePaid;
    }

    struct Investigation {
        uint256 id;
        address investigator;
        uint256 targetBlockNumber;
        uint256 targetDeadline;
        uint256 recordedBlockNumber;
        uint256 recordedTimestamp;
        string category;
        string notes;
    }

    // Incremental counters
    uint256 public inspectionRequestCount;
    uint256 public investigationCount;

    // Inspection requests storage
    mapping(uint256 => InspectionRequest) public inspectionRequests;
    mapping(address => uint256[]) private userInspectionRequests;

    // Detailed investigation logs storage
    mapping(uint256 => Investigation) public investigations;
    mapping(address => uint256[]) private userInvestigations;

    // Events
    event BlockInspectionRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 indexed blockNumber,
        uint256 timestamp,
        uint256 feePaid
    );

    event InvestigationLogged(
        uint256 indexed id,
        address indexed investigator,
        uint256 indexed targetBlockNumber,
        uint256 targetDeadline,
        string category,
        uint256 recordedTimestamp
    );

    /**
     * @notice Request an on-chain block inspection.
     * Requires gas fee to execute, recording the inspection request permanently on BOTChain.
     * @param blockNumber The block height to inspect
     */
    function requestBlockInspection(uint256 blockNumber) external payable returns (uint256) {
        inspectionRequestCount++;
        uint256 reqId = inspectionRequestCount;

        inspectionRequests[reqId] = InspectionRequest({
            id: reqId,
            requester: msg.sender,
            blockNumber: blockNumber,
            timestamp: block.timestamp,
            feePaid: msg.value
        });

        userInspectionRequests[msg.sender].push(reqId);

        emit BlockInspectionRequested(
            reqId,
            msg.sender,
            blockNumber,
            block.timestamp,
            msg.value
        );

        return reqId;
    }

    /**
     * @notice Get recent inspection requests
     */
    function getRecentInspectionRequests(uint256 offset, uint256 limit)
        external
        view
        returns (InspectionRequest[] memory)
    {
        if (inspectionRequestCount == 0 || offset >= inspectionRequestCount) {
            return new InspectionRequest[](0);
        }

        uint256 available = inspectionRequestCount - offset;
        uint256 count = limit < available ? limit : available;

        InspectionRequest[] memory results = new InspectionRequest[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 targetId = inspectionRequestCount - offset - i;
            results[i] = inspectionRequests[targetId];
        }

        return results;
    }

    /**
     * @notice Record a new block & timestamp investigation audit
     */
    function recordInvestigation(
        uint256 targetBlockNumber,
        uint256 targetDeadline,
        string calldata category,
        string calldata notes
    ) external returns (uint256) {
        investigationCount++;
        uint256 newId = investigationCount;

        Investigation memory record = Investigation({
            id: newId,
            investigator: msg.sender,
            targetBlockNumber: targetBlockNumber,
            targetDeadline: targetDeadline,
            recordedBlockNumber: block.number,
            recordedTimestamp: block.timestamp,
            category: category,
            notes: notes
        });

        investigations[newId] = record;
        userInvestigations[msg.sender].push(newId);

        emit InvestigationLogged(
            newId,
            msg.sender,
            targetBlockNumber,
            targetDeadline,
            category,
            block.timestamp
        );

        return newId;
    }

    /**
     * @notice Retrieve an investigation record by ID
     */
    function getInvestigation(uint256 id) external view returns (Investigation memory) {
        require(id > 0 && id <= investigationCount, "Investigation does not exist");
        return investigations[id];
    }

    /**
     * @notice Get all investigation IDs logged by a specific address
     */
    function getInvestigationsBySender(address sender) external view returns (uint256[] memory) {
        return userInvestigations[sender];
    }

    /**
     * @notice Get a slice of recent investigations for pagination in UI
     */
    function getRecentInvestigations(uint256 offset, uint256 limit)
        external
        view
        returns (Investigation[] memory)
    {
        if (investigationCount == 0 || offset >= investigationCount) {
            return new Investigation[](0);
        }

        uint256 available = investigationCount - offset;
        uint256 count = limit < available ? limit : available;

        Investigation[] memory results = new Investigation[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 targetId = investigationCount - offset - i;
            results[i] = investigations[targetId];
        }

        return results;
    }

    /**
     * @notice Helper to check deadline status relative to the current on-chain block timestamp
     */
    function verifyDeadline(uint256 targetDeadline)
        external
        view
        returns (
            bool hasPassed,
            uint256 deltaSeconds,
            uint256 currentBlockNumber,
            uint256 currentBlockTimestamp
        )
    {
        currentBlockNumber = block.number;
        currentBlockTimestamp = block.timestamp;

        if (currentBlockTimestamp >= targetDeadline) {
            hasPassed = true;
            deltaSeconds = currentBlockTimestamp - targetDeadline;
        } else {
            hasPassed = false;
            deltaSeconds = targetDeadline - currentBlockTimestamp;
        }
    }
}
