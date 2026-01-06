import bcrypt from "bcrypt";
import pool from "../db.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // 1. Check if user already exists (Prevent duplicates)
    const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "user already exists" });
    }

    // 2. Hash the password (Security Best Practice)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Start Database Transaction (ACID Compliance)
    await pool.query("BEGIN");

    // Step A: Insert the User
    const newUserQuery =
      "INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING id,username,email";

    const newUserRes = await pool.query(newUserQuery, [
      username,
      email,
      passwordHash,
    ]);

    const newUser = newUserRes.rows[0];

    // Step B: Create a Wallet for the new user (Business Logic)
    // We give them 1000.00 LKR for testing purposes.
    const newWalletQuery =
      "INSERT INTO wallets (user_id,balance,currency) VALUES ($1,$2,$3) RETURNING id";

    await pool.query(newWalletQuery, [newUser.id, 1000.0, "LKR"]);

    // 4. Commit the Transaction (Save changes permanently)
    await pool.query("COMMIT");

    res
      .status(201)
      .json({ message: "User Registered Succesfully", user: newUser });
  } catch (err) {
    // If ANY step above fails, undo EVERYTHING.
    await pool.query("ROLLBACK");
    console.error(err.message);
    res.status(500).json({
      error: "Server Error!!",
    });
  }
};
