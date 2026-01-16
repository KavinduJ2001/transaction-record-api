# 🏦 Secure Fintech Transaction API

A high-performance, **ACID-compliant** banking backend built with **Node.js** and **PostgreSQL**.

This API handles secure user authentication, real-time wallet management, and peer-to-peer money transfers. It is engineered to prevent **Race Conditions** (Double Spending) and ensure **Data Integrity** using strict database transactions and row-level locking.

---

## 🚀 Project Status
✅ **Completed** (Ready for Deployment)

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (with `pg` pool)
- **Security:** JWT (Stateless Authentication), Bcrypt (Password Hashing)
- **Architecture:** MVC (Model-View-Controller) Pattern

---

## ⚡ Key Features & Engineering Highlights

### 1. Atomic Money Transfers (ACID Compliant)
- Implemented **Database Transactions** (`BEGIN`...`COMMIT`) to ensure money transfers are "all-or-nothing."
- If a server crashes mid-transaction (e.g., after deduction but before addition), the system automatically performs a `ROLLBACK` to prevent data loss.

### 2. Concurrency Control (Anti-Double Spending)
- Solved the **"Double Spending"** problem using **Conditional Updates** and **Row-Level Locking** in PostgreSQL.
- Logic moves the balance check *inside* the SQL query (`AND balance >= amount`) to ensure thread safety during high-concurrency bursts.

### 3. Bank-Level Security
- **Stateless Authentication:** Uses JSON Web Tokens (JWT) for scalable, session-less login.
- **Password Security:** All passwords are salted and hashed using `bcrypt` before storage.
- **Middleware:** Protected routes using a custom Authorization Middleware to verify tokens.

---

## 📂 Database Schema

The project uses a relational schema with three core tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'LKR'
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    sender_wallet_id INT REFERENCES wallets(id),
    receiver_wallet_id INT REFERENCES wallets(id),
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user & auto-generate wallet | ❌ |
| `POST` | `/api/auth/login` | Login and receive **Bearer Token** | ❌ |

### 💰 Wallet & Transactions
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wallet/balance` | Get current user's balance | ✅ (JWT) |
| `POST` | `/api/transactions/transfer` | Send money to another user (Atomic) | ✅ (JWT) |
| `GET` | `/api/transactions/history` | View list of sent/received transactions | ✅ (JWT) |

---

## 💻 How to Run Locally

### Clone the Repository
```bash
git clone <your-repo-url>
cd transaction-record-api
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
Create a `.env` file in the root directory:
```
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_db
JWT_SECRET=your_super_secret_key
PORT=3000
```

### Start the Server
```bash
npm run dev
```

You should see: `🚀 Server running on port 3000`

## 🧪 Testing (Postman)

1. Register 2 users (User A and User B).
2. Login as User A to get a Token.
3. Use the token in the `Authorization: Bearer <token>` header.
4. Hit the `/transfer` endpoint to send money to User B.
5. Check `/history` to see the audit log.
