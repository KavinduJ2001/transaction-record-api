import pool from '../db.js';

// TRANSFER MONEY
export const transferMoney = async (req, res) => {
    const client = await pool.connect(); // We need a dedicated client for transactions
    const { receiver_email, amount } = req.body;
    const senderId = req.user.id; // From middleware

    try {
        await client.query('BEGIN'); // 1. Start Transaction

        // 2. Validate Sender's Balance
        const senderWalletRes = await client.query(
            'SELECT * FROM wallets WHERE user_id = $1', 
            [senderId]
        );
        const senderWallet = senderWalletRes.rows[0];

        if (senderWallet.balance < amount) {
            await client.query('ROLLBACK'); // Stop if too poor
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // 3. Find Receiver's Wallet Info
        const receiverUserRes = await client.query(
            'SELECT id FROM users WHERE email = $1', 
            [receiver_email]
        );
        
        if (receiverUserRes.rows.length === 0) {
            await client.query('ROLLBACK'); // Stop if user doesn't exist
            return res.status(404).json({ error: "Receiver not found" });
        }
        const receiverUserId = receiverUserRes.rows[0].id;

        const receiverWalletRes = await client.query(
            'SELECT id FROM wallets WHERE user_id = $1',
            [receiverUserId]
        );
        const receiverWallet = receiverWalletRes.rows[0];

        // 4. PREVENT SELF-TRANSFER
        if (senderId === receiverUserId) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Cannot send money to yourself" });
        }

        // 5. EXECUTE TRANSFER (Atomic Updates)
        
        // A. Deduct from Sender
        await client.query(
            'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
            [amount, senderId]
        );

        // B. Add to Receiver
        await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
            [amount, receiverUserId]
        );

        // C. Record the Transaction History
        await client.query(
            `INSERT INTO transactions (sender_wallet_id, receiver_wallet_id, amount) 
             VALUES ($1, $2, $3)`,
            [senderWallet.id, receiverWallet.id, amount]
        );

        await client.query('COMMIT'); // 6. Save Everything
        res.json({ message: "Transfer successful!" });

    } catch (err) {
        await client.query('ROLLBACK'); // 7. Undo all changes on crash
        console.error(err);
        res.status(500).json({ error: "Transaction Failed" });
    } finally {
        client.release(); // Release the connection back to the pool
    }
};