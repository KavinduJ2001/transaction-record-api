# Secure Transaction Management API

A high-performance RESTful backend API designed to handle secure user authentication and financial transaction management. This system ensures data integrity using ACID-compliant database transactions and secures user access via JWT authentication.

## Project Status
**Current Status:** Active Development

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Planned)
- **Security:** JWT (JSON Web Tokens), Bcrypt hashing
- **Architecture:** RESTful API

## Key Features (In Progress)
- [ ] **User Authentication:** Secure registration and login with JWT and password hashing.
- [ ] **Wallet Management:** Create and manage user wallet balances.
- [ ] **Secure Transactions:** Atomic database transactions to handle fund transfers between users.
- [ ] **Audit Logs:** Complete history of all incoming and outgoing transactions.

## API Endpoints (Planned)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `POST` | `/api/transfers` | Initiate a secure money transfer |
| `GET` | `/api/wallet` | Get current user balance |
