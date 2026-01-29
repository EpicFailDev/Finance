import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { transactions, NewTransaction } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// GET all transactions
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allTransactions = await db.select().from(transactions).orderBy(transactions.date);
    res.json(allTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST new transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const newTransaction: NewTransaction = {
      id: randomUUID(),
      description: req.body.description,
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      type: req.body.type,
      paymentMethod: req.body.paymentMethod,
    };

    await db.insert(transactions).values(newTransaction);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// POST bulk import (for Nubank CSV import)
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const transactionsToImport: NewTransaction[] = req.body.map((tx: Omit<NewTransaction, 'id'>) => ({
      ...tx,
      id: randomUUID(),
    }));

    await db.insert(transactions).values(transactionsToImport);
    res.status(201).json({ imported: transactionsToImport.length });
  } catch (error) {
    console.error('Error importing transactions:', error);
    res.status(500).json({ error: 'Failed to import transactions' });
  }
});

// PUT update transaction
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(transactions)
      .set({
        description: req.body.description,
        amount: req.body.amount,
        date: req.body.date,
        category: req.body.category,
        type: req.body.type,
        paymentMethod: req.body.paymentMethod,
      })
      .where(eq(transactions.id as any, id));

    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE transaction
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(transactions).where(eq(transactions.id as any, id));
    res.json({ deleted: id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
