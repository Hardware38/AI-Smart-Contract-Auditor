# AI-Supported Smart Contract Auditor

**Course:** SEN0401 – Special Topics in Software Engineering (Blockchain)  
**Department:** Computer Engineering  
**University:** Istanbul Kültür University  
**Semester:** Fall 2025  

---

## 📌 Project Overview

This project implements an **AI-Supported Smart Contract Auditor**, a full-stack **AI4Blockchain** application designed to automatically analyze Solidity smart contracts, detect potential security vulnerabilities, and store audit summaries on a blockchain.

The system integrates **artificial intelligence** for vulnerability analysis and **blockchain technology** for transparent and immutable audit storage. The primary objective is to provide an **educational, accessible, and fast auditing tool**, especially for students, novice developers, and small Web3 teams that may not have access to expensive professional auditing services.

---

## 🎯 Project Objectives

- Automatically analyze Solidity smart contracts using AI  
- Identify common security vulnerabilities and risky design patterns  
- Generate structured, human-readable audit reports  
- Store summarized audit results immutably on a blockchain  
- Provide a web-based interface for easy interaction and visualization  

---

## ⭐ Key Features

### 🤖 AI-Based Smart Contract Analysis
- Automated vulnerability detection  
- Severity classification of findings  
- Human-readable explanations  
- Structured JSON audit reports  

### ⛓️ Blockchain Integration
- Audit summaries stored on-chain  
- Immutable and verifiable audit records  
- Local blockchain environment using Hardhat  

### 🖥️ Web-Based Interface
- Paste Solidity source code and analyze instantly  
- View AI-generated audit results  
- Browse historical audit records  
- Inspect full audit reports in text or JSON format  

---

## 🧠 System Architecture

The system follows a modular and layered architecture to ensure separation of concerns and maintainability.

### Architecture Layers

**Frontend (React + Vite)**  
Provides the user interface for submitting smart contracts, displaying AI-generated audit results, and visualizing audit history.

**Backend (FastAPI)**  
Acts as the core application layer. It handles API requests, validates input, communicates with the AI model, and interacts with the blockchain.

**AI Analysis Layer (Groq LLaMA 3.1 8B Instant)**  
Processes Solidity source code and generates structured vulnerability reports with severity levels and remediation guidance.

**Blockchain Layer (Hardhat Local Network)**  
Stores summarized audit results in a smart contract, ensuring transparency and immutability.

### Data Flow

Frontend → Backend → AI Model → Backend → Blockchain → Frontend


---

## 🛠️ Technology Stack

### Frontend
- React  
- Vite  
- JavaScript  
- Axios  
- CSS (custom dark/light theme)  

### Backend & AI Layer
- Python 3  
- FastAPI  
- Pydantic  
- Groq API (LLaMA 3.1 8B Instant)  

### Blockchain Layer
- Solidity  
- Hardhat  
- Web3.py  
- Local Hardhat Network (Chain ID: 31337)  

---

## 📂 Project Structure

AI-Smart-Contract-Auditor/
│
├── frontend/
│ ├── src/
│ └── App.jsx
│
├── backend/
│ ├── main.py
│ ├── app.py
│ └── AuditRecordABI.json
│
├── smart-contract/
│ ├── contracts/
│ │ └── AuditRecord.sol
│ ├── scripts/
│ │ └── deploy.js
│ └── test/
│
├── docs/
│ ├── architecture.png
│ └── api_endpoints.md
│
├── README.md
└── .env.example


⚠️ **The `.env` file is intentionally excluded from the repository for security reasons.**

---

## ▶️ How to Run the Project (Step-by-Step)

The system consists of four main components and **must be executed in the correct order**.

---

### 1️⃣ Start the Local Blockchain (Hardhat Node)

cd C:\Users\MONSTER\Desktop\AI-Smart-Contract-Auditor\smart-contract
npx hardhat node


http://127.0.0.1:8545


⚠️ Keep this terminal open while running the project.

### 2️⃣ Deploy the Smart Contract

cd C:\Users\MONSTER\Desktop\AI-Smart-Contract-Auditor\smart-contract
npx hardhat run scripts/deploy.js --network localhost

This step deploys the AuditRecord.sol smart contract.

📌 Copy the deployed contract address and place it into the backend .env file.

### 3️⃣ Backend Setup & Execution

cd C:\Users\MONSTER\Desktop\AI-Smart-Contract-Auditor\backend
pip install -r requirements.txt

Create a .env file inside the backend/ directory:

GROQ_API_KEY=your_api_key_here
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_hardhat_private_key
CONTRACT_ADDRESS=deployed_contract_address

Run the backend server:

uvicorn main:app --reload


Backend API will be available at:

http://127.0.0.1:8000

### 4️⃣ Frontend Setup & Execution
cd C:\Users\MONSTER\Desktop\AI-Smart-Contract-Auditor\frontend
npm install
npm run dev


Frontend will be available at:

http://localhost:5173

### 🧪 Example Solidity Contracts for Testing
Example 1: Educational Overflow Case
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OverflowToken {
    mapping(address => uint256) public balances;

    function mint(uint256 amount) public {
        // Potential overflow in older Solidity versions
        balances[msg.sender] += amount;
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Not enough balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}

Example 2: Missing Access Control Vulnerability
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BrokenAdmin {
    address public owner;
    uint256 public value;

    constructor() {
        owner = msg.sender;
    }

    // Missing access control
    function updateValue(uint256 newValue) public {
        value = newValue;
    }
}

### 🧪 Testing

Testing was performed in a local development environment:

Smart contract deployment and interaction tested on Hardhat

Backend API tested with multiple Solidity samples

End-to-end flow tested:
Solidity input → AI analysis → blockchain transaction → audit history retrieval

Automated test coverage is limited and can be extended in future work.

### 🎬 Demo

📹 Demo Video (Google Drive):
https://drive.google.com/drive/folders/12jqVp-6kpRDX6YZFhMYLD8FMJeM0ndYf?usp=drive_link

🧪 Live Demo: Local environment (Hardhat + FastAPI + React)

### 🖼️ Screenshots

📁 Screenshots (Google Drive Folder):
https://drive.google.com/drive/folders/1F-VOG1h64bFH9m0_tjAPk8Teg8Y0iUHt?usp=drive_link

### 🔗 Source Code

GitHub Repository:  
👉 https://github.com/Hardware38/AI-Smart-Contract-Auditor

### 📄 Academic Context

This project was developed as part of:

SEN0401 – Special Topics in Software Engineering (Blockchain)
Instructor: Yusuf Altunel
Istanbul Kültür University

### 👥 Team Members

Furkan Soykan – 2200004410

Göksu Bakır – 2100003985

Berat Öztürk – 2100005789

### 📌 Notes

The .env file is intentionally excluded for security reasons
All blockchain operations are performed on a local test network
This project is intended for educational and research purposes only
