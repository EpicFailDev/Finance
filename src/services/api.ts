const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  paymentMethod: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  currentAmount: number;
  month: string;
}

// Transactions API
export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async bulkImport(transactions: Omit<Transaction, 'id'>[]): Promise<{ imported: number }> {
    const res = await fetch(`${API_BASE_URL}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions),
    });
    if (!res.ok) throw new Error('Failed to import transactions');
    return res.json();
  },

  async update(id: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },
};

// Budgets API
export const budgetsApi = {
  async getByMonth(month: string): Promise<Budget[]> {
    const res = await fetch(`${API_BASE_URL}/budgets?month=${month}`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async getAll(): Promise<Budget[]> {
    const res = await fetch(`${API_BASE_URL}/budgets`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async upsert(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  async update(id: string, budget: Omit<Budget, 'id'>): Promise<Budget> {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    if (!res.ok) throw new Error('Failed to update budget');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete budget');
  },
};

// Admin API
export const adminApi = {
  async resetData(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to wipe data');
  },
};
