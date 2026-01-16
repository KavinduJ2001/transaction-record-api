import pool from '../db.js';

// // TRANSFER MONEY
// export const transferMoney = async (req, res) => {
//     const client = await pool.connect(); // We need a dedicated client for transactions
//     const { receiver_email, amount } = req.body;
//     const senderId = req.user.id; // From middleware

//     try {
//         await client.query('BEGIN'); // 1. Start Transaction

//         // 2. Validate Sender's Balance
//         const senderWalletRes = await client.query(
//             'SELECT * FROM wallets WHERE user_id = $1', 
//             [senderId]
//         );
//         const senderWallet = senderWalletRes.rows[0];

//         if (senderWallet.balance < amount) {
//             await client.query('ROLLBACK'); // Stop if too poor
//             return res.status(400).json({ error: "Insufficient funds" });
//         }

//         // 3. Find Receiver's Wallet Info
//         const receiverUserRes = await client.query(
//             'SELECT id FROM users WHERE email = $1', 
//             [receiver_email]
//         );
        
//         if (receiverUserRes.rows.length === 0) {
//             await client.query('ROLLBACK'); // Stop if user doesn't exist
//             return res.status(404).json({ error: "Receiver not found" });
//         }
//         const receiverUserId = receiverUserRes.rows[0].id;

//         const receiverWalletRes = await client.query(
//             'SELECT id FROM wallets WHERE user_id = $1',
//             [receiverUserId]
//         );
//         const receiverWallet = receiverWalletRes.rows[0];

//         // 4. PREVENT SELF-TRANSFER
//         if (senderId === receiverUserId) {
//             await client.query('ROLLBACK');
//             return res.status(400).json({ error: "Cannot send money to yourself" });
//         }

//         // 5. EXECUTE TRANSFER (Atomic Updates)
        
//         // A. Deduct from Sender
//         await client.query(
//             'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
//             [amount, senderId]
//         );

//         // B. Add to Receiver
//         await client.query(
//             'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
//             [amount, receiverUserId]
//         );

//         // C. Record the Transaction History
//         await client.query(
//             `INSERT INTO transactions (sender_wallet_id, receiver_wallet_id, amount) 
//              VALUES ($1, $2, $3)`,
//             [senderWallet.id, receiverWallet.id, amount]
//         );

//         await client.query('COMMIT'); // 6. Save Everything
//         res.json({ message: "Transfer successful!" });

//     } catch (err) {
//         await client.query('ROLLBACK'); // 7. Undo all changes on crash
//         console.error(err);
//         res.status(500).json({ error: "Transaction Failed" });
//     } finally {
//         client.release(); // Release the connection back to the pool
//     }
// };

// TRANSFER MONEY (Best practice: conditional UPDATE)
export const transferMoney = async (req, res) => {
  const client = await pool.connect();
  const { receiver_email, amount } = req.body;
  const senderId = req.user.id;

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    await client.query("BEGIN");

    // 1) Find receiver
    const receiverUserRes = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [receiver_email]
    );

    if (receiverUserRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Receiver not found" });
    }
    const receiverUserId = receiverUserRes.rows[0].id;

    if (senderId === receiverUserId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cannot send money to yourself" });
    }

    // 2) Deduct from sender ONLY if balance is enough (race-safe)
    const senderDeductRes = await client.query(
      `UPDATE wallets
       SET balance = balance - $1
       WHERE user_id = $2 AND balance >= $1
       RETURNING id`,
      [amountNum, senderId]
    );

    if (senderDeductRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient funds" });
    }
    const senderWalletId = senderDeductRes.rows[0].id;

    // 3) Add to receiver (ensure receiver wallet exists)
    const receiverAddRes = await client.query(
      `UPDATE wallets
       SET balance = balance + $1
       WHERE user_id = $2
       RETURNING id`,
      [amountNum, receiverUserId]
    );

    if (receiverAddRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Receiver wallet not found" });
    }
    const receiverWalletId = receiverAddRes.rows[0].id;

    // 4) Record transaction
    await client.query(
      `INSERT INTO transactions (sender_wallet_id, receiver_wallet_id, amount)
       VALUES ($1, $2, $3)`,
      [senderWalletId, receiverWalletId, amountNum]
    );

    await client.query("COMMIT");
    return res.json({ message: "Transfer successful!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "Transaction Failed" });
  } finally {
    client.release();
  }
};


// GET TRANSACTION HISTORY
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id; // From Middleware

        // 1. Get the User's Wallet ID
        const walletRes = await pool.query(
            'SELECT id FROM wallets WHERE user_id = $1',
            [userId]
        );
        
        if (walletRes.rows.length === 0) {
            return res.status(404).json({ error: "Wallet not found" });
        }
        
        const walletId = walletRes.rows[0].id;

        // 2. Find all transactions where this wallet was Sender OR Receiver
        // ORDER BY created_at DESC ensures the newest transactions show first
        const historyQuery = `
            SELECT * FROM transactions 
            WHERE sender_wallet_id = $1 OR receiver_wallet_id = $1 
            ORDER BY created_at DESC
        `;
        
        const history = await pool.query(historyQuery, [walletId]);

        res.json(history.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};