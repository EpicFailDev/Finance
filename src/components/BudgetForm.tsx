import React, { useState } from 'react';
import { Category, Budget } from '../types';
import { Target, Save } from 'lucide-react';

interface BudgetFormProps {
  currentMonth: string;
  onSave: (category: string, limit: number, month: string, currentAmount: number) => void;
  existingBudgets: Budget[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({ currentMonth, onSave, existingBudgets }) => {
  const [category, setCategory] = useState<Category>(Category.HABITACAO);
  const [limit, setLimit] = useState('');
  const [alreadySaved, setAlreadySaved] = useState('');

  const activeBudget = existingBudgets.find(b => b.category === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLimit = parseFloat(limit) || 0;
    const currentAmount = parseFloat(alreadySaved) || 0;
    
    if (targetLimit <= 0) {
      alert('O objetivo da meta deve ser maior que zero.');
      return;
    }

    onSave(category, targetLimit, currentMonth, currentAmount);
    setLimit('');
    setAlreadySaved('');
  };

  return (
    <div className="kinetic-card p-6 bg-white dark:bg-zen-800 dark:border-stone-700 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-xl">
          <Target className="text-accent-blue" size={20} />
        </div>
        <h4 className="font-black text-xs tracking-widest uppercase text-zen-900 dark:text-zen-100">Criar Caixinha</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2 ml-1">Para que é esta meta?</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 border-2 border-stone-100 dark:border-stone-700 rounded-2xl focus:border-accent-blue outline-none text-sm font-bold bg-stone-50 dark:bg-zen-900 dark:text-white transition-all cursor-pointer"
          >
            {Object.values(Category).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2 ml-1">
              Valor do Objetivo
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-5 py-4 border-2 border-stone-100 dark:border-stone-700 rounded-2xl focus:border-accent-blue outline-none font-mono text-xl font-black bg-stone-50 dark:bg-zen-900 dark:text-white transition-all"
              placeholder="0,00"
            />
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2 ml-1">
              Quanto já coloquei?
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={alreadySaved}
                onChange={(e) => setAlreadySaved(e.target.value)}
                className="w-full pl-5 pr-14 py-4 border-2 border-stone-100 dark:border-stone-700 rounded-2xl focus:border-accent-blue outline-none font-mono text-xl font-black bg-stone-50 dark:bg-zen-900 dark:text-white transition-all"
                placeholder="0,00"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563EB] text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 shadow-vibrant-blue transition-all"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {activeBudget && (
          <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest text-center">
            Meta atual: <span className="text-accent-blue">R$ {activeBudget.currentAmount.toFixed(2)} / {activeBudget.limit.toFixed(2)}</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default BudgetForm;
