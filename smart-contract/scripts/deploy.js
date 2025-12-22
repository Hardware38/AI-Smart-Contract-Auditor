const hre = require("hardhat");

async function main() {
  const AuditRecord = await hre.ethers.getContractFactory("AuditRecord");
  const auditRecord = await AuditRecord.deploy();

  await auditRecord.deployed();

  console.log("AuditRecord deployed to:", auditRecord.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
