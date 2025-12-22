import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("AuditRecord Contract", function () {
  it("Should create an audit record", async function () {
    // Deploy contract
    const AuditRecord = await ethers.getContractFactory("AuditRecord");
    const audit = await AuditRecord.deploy();
    await audit.deployed();

    // Prepare test inputs
    const contractName = "TestContract";
    const summary = "No major issues found";

    // Call submitAudit()
    const tx = await audit.submitAudit(contractName, summary);
    await tx.wait();

    // Verify stored record
    const record = await audit.getAudit(0);

    expect(record.contractName).to.equal(contractName);
    expect(record.summary).to.equal(summary);
  });
});
