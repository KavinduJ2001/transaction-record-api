import express from 'express';
import { transferMoney , getTransactionHistory} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: POST /api/transactions/transfer
// Protected by "authenticateToken" so only logged-in users can send money
router.post('/transfer', authenticateToken, transferMoney);

router.get('/history', authenticateToken, getTransactionHistory);

export default router;