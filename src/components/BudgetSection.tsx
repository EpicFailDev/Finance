import React from 'react';
import { PiggyBank } from 'lucide-react';
import BudgetCard from './BudgetCard';
import { Transaction, Budget, TransactionType } from '../types';

interface BudgetSectionProps {
  budgets: Budget[];
  onDelete: (id: string) => void;
  onDeposit: (id: string, amount: number) => void;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ budgets, onDelete, onDeposit }) => {
  if (budgets.length === 0) {
    return (
      <div className="bg-stone-50 dark:bg-zen-900 border-2 border-dashed border-stone-200 dark:border-stone-800 p-8 text-center rounded-3xl kinetic-transition">
        <div className="w-12 h-12 bg-white dark:bg-zen-800 border-2 border-stone-100 dark:border-stone-700 flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-stone-600 rounded-2xl">
          <PiggyBank size={24} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Nenhuma caixinha ativa
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {budgets.map(budget => (
        <BudgetCard
          key={budget.id}
          id={budget.id}
          category={budget.category}
          limit={budget.limit}
          currentAmount={budget.currentAmount}
          onDelete={onDelete}
          onDeposit={onDeposit}
        />
      ))}
    </div>
  );
};

export default BudgetSection;
