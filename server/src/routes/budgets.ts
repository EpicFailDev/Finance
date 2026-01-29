import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { budgets, NewBudget } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const month = req.query.month as string;
    
    if (month) {
      const monthBudgets = await db.select().from(budgets).where(eq(budgets.month as any, month));
      res.json(monthBudgets);
    } else {
      const allBudgets = await db.select().from(budgets);
      res.json(allBudgets);
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { category, limit, month, currentAmount } = req.body;
    
    const existing = await db.select().from(budgets)
      .where(and(eq(budgets.category as any, category), eq(budgets.month as any, month)));
    
    if (existing.length > 0) {
      await db.update(budgets)
        .set({ limit, currentAmount: currentAmount ?? existing[0].currentAmount })
        .where(eq(budgets.id as any, existing[0].id));
      res.json({ ...existing[0], limit, currentAmount: currentAmount ?? existing[0].currentAmount });
    } else {
      const newBudget: NewBudget = {
        id: randomUUID(),
        category,
        limit,
        currentAmount: currentAmount || 0,
        month,
      };
      await db.insert(budgets).values(newBudget);
      res.status(201).json(newBudget);
    }
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, limit, month, currentAmount } = req.body;

    await db.update(budgets)
      .set({
        category,
        limit,
        month,
        currentAmount
      })
      .where(eq(budgets.id as any, id));

    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(budgets).where(eq(budgets.id as any, id));
    res.json({ deleted: id });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;
