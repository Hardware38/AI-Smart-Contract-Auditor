from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import time
from dotenv import load_dotenv

from web3 import Web3
from eth_account import Account
from pathlib import Path
import json

# Load environment variables
load_dotenv()

app = FastAPI()

# -----------------------------
#     CORS SETTINGS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
#   IN-MEMORY AUDIT HISTORY
# -----------------------------
AUDIT_LOG = []   # (ContractName, Summary, Timestamp, TxHash, FullReport)

# -----------------------------
#   GROQ AI CLIENT
# -----------------------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -----------------------------
#      WEB3 / HARDHAT SETUP
# -----------------------------
RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

web3 = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY)
CHAIN_ID = 31337

# Load ABI
ABI_PATH = Path(__file__).resolve().parent / "AuditRecordABI.json"
with ABI_PATH.open() as f:
    AUDIT_ABI = json.load(f)

audit_contract = web3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=AUDIT_ABI,
)

# -----------------------------
#       REQUEST MODELS
# -----------------------------
class AuditRequest(BaseModel):
    contract_code: str

class SaveAuditRequest(BaseModel):
    contract_name: str
    summary: str
    full_report: str | None = None
    tx_hash: str | None = None

# -----------------------------
#       HOME ROUTE
# -----------------------------
@app.get("/")
def home():
    return {"message": "FastAPI backend active!"}


# --------------------------------------------------------------
#           AI ANALYSIS → RETURNS STRUCTURED JSON
# --------------------------------------------------------------
@app.post("/analyze")
def analyze_contract(data: AuditRequest):

    prompt = f"""
You are a senior smart contract auditor.

Return ONLY a JSON object.
NO markdown.
NO explanation.
NO backticks.

JSON FORMAT:
{{
  "contract_info": {{
    "name": "string",
    "network": "Local Hardhat",
    "language": "Solidity",
    "compiler_version": "string"
  }},
  "overall_severity": "Low" | "Medium" | "High" | "Critical",
  "cvss_score": 0.0,
  "plain_text_summary": "string",
  "vulnerabilities": [
    {{
      "id": "V1",
      "title": "string",
      "severity": "Low" | "Medium" | "High",
      "cvss": 0.0,
      "risk": "string",
      "exploit_scenario": "string",
      "technical_root_cause": "string",
      "recommendation": "string"
    }}
  ],
  "gas_optimizations": ["string"],
  "secure_code_example": "string"
}}

Contract code:
{data.contract_code}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Always respond with pure JSON."},
            {"role": "user", "content": prompt},
        ],
    )

    raw = response.choices[0].message.content

    # JSON CLEAN + PARSE
    try:
        start = raw.find("{")
        end = raw.rfind("}")
        cleaned = raw[start:end + 1]

        parsed = json.loads(cleaned)
        return {"report": parsed}

    except Exception as e:
        return {
            "error": "JSON_PARSE_FAILED",
            "details": str(e),
            "raw": raw
        }


# --------------------------------------------------------------
#     SAVE AUDIT → BLOCKCHAIN + LOCAL AUDIT MEMORY
# --------------------------------------------------------------
@app.post("/save_audit")
def save_audit(data: SaveAuditRequest):

    try:
        nonce = web3.eth.get_transaction_count(account.address, "pending")

        # Submit audit to blockchain with placeholder txHash
        built_tx = audit_contract.functions.submitAudit(
            data.contract_name,
            data.summary,
            "PENDING"
        ).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 4000000,
            "gasPrice": web3.to_wei("1", "gwei"),
            "chainId": CHAIN_ID,
        })

        signed = account.sign_transaction(built_tx)
        tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)

        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        real_tx_hash = tx_hash.hex()

        # Save to in-memory log
        AUDIT_LOG.append({
            "contract_name": data.contract_name,
            "summary": data.summary,
            "timestamp": int(time.time()),
            "tx_hash": real_tx_hash,
            "full_report": data.full_report
        })

        return {
            "tx_hash": real_tx_hash,
            "block_number": receipt.blockNumber
        }



    except Exception as e:
        return {"error": str(e)}


# --------------------------------------------------------------
#                   GET AUDIT HISTORY
# --------------------------------------------------------------
@app.get("/audit_history")
def audit_history():
    return {"audits": AUDIT_LOG}
