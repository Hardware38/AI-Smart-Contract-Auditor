// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditRecord {
    struct AuditEntry {
        address user;
        uint256 timestamp;
        string contractName;
        string summary;
        string txHash;
    }

    AuditEntry[] public auditHistory;

    event AuditSubmitted(
        address indexed user,
        uint256 indexed auditId,
        string contractName,
        string summary,
        string txHash
    );

    function submitAudit(
        string memory _contractName,
        string memory _summary,
        string memory _txHash
    ) public returns (uint256) {

        auditHistory.push(
            AuditEntry({
                user: msg.sender,
                timestamp: block.timestamp,
                contractName: _contractName,
                summary: _summary,
                txHash: _txHash
            })
        );

        uint256 auditId = auditHistory.length - 1;

        emit AuditSubmitted(msg.sender, auditId, _contractName, _summary, _txHash);

        return auditId;
    }

    function getAudit(uint256 _id) 
        public 
        view 
        returns (AuditEntry memory) 
    {
        require(_id < auditHistory.length, "Audit ID does not exist");
        return auditHistory[_id];
    }

    function getTotalAudits() public view returns (uint256) {
        return auditHistory.length;
    }
}
