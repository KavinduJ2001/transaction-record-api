import "dotenv/config"; // Load .env variables
import express from "express";
import pool from "./db.js"; //Importing this triggers the database connection!
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
const PORT = process.env.PORT;

// Middleware: Allows the server to read JSON data sent in requests
// Without this, req.body will be undefined.
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/wallet", walletRoutes);

app.use('/api/transactions', transactionRoutes);

// A simple route to check if the server is alive
app.get("/", (req, res) => {
  res.json({ message: "Fintech API is Running!" });
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
