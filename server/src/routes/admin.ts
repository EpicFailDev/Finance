import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { transactions, budgets } from '../db/schema.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Admin Route Active' });
});

// POST reset data (wipe everything)
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    // Delete all rows from both tables
    await db.delete(transactions);
    await db.delete(budgets);
    
    console.log('Admin Action: Data Wiped');
    res.json({ message: 'All data successfully wiped' });
  } catch (error) {
    console.error('Error wiping data:', error);
    res.status(500).json({ error: 'Failed to wipe data' });
  }
});

export default router;
