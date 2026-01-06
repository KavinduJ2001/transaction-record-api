import pool from "../db.js";

export const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT balance,currency FROM wallets WHERE user_id=$1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error!!" });
  }
};
