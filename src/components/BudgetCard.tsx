import React, { useState } from 'react';
import { Target, Trash2, Plus, Check, X } from 'lucide-react';

interface BudgetCardProps {
  id: string;
  category: string;
  limit: number;
  currentAmount: number;
  onDelete: (id: string) => void;
  onDeposit: (id: string, amount: number) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ id, category, limit, currentAmount, onDelete, onDeposit }) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  
  const percentage = Math.min((currentAmount / limit) * 100, 100);
  const isComplete = currentAmount >= limit;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleConfirmDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      onDeposit(id, amount);
      setDepositAmount('');
      setIsDepositing(false);
    }
  };

  return (
    <div className="kinetic-card p-6 bg-white dark:bg-zen-800 dark:border-stone-700 flex flex-col justify-between rounded-3xl relative overflow-hidden group min-h-[180px]">
      {/* Target icon background decoration */}
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
        <Target size={120} />
      </div>

      <div className="flex justify-between items-start mb-4 z-10">
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 truncate">{category}</h5>
            {isComplete && (
                <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black tracking-tighter text-zen-900 dark:text-zen-100">
            {formatCurrency(currentAmount)}
            <span className="text-stone-300 dark:text-stone-600 ml-2 text-sm font-bold">/ {limit.toFixed(0)}</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          {!isDepositing ? (
            <button
              onClick={() => setIsDepositing(true)}
              className="p-2 bg-accent-blue text-white hover:bg-[#1e40af] transition-all rounded-full shadow-vibrant-blue group-hover:scale-110 active:scale-95"
              title="Guardar Dinheiro"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={() => setIsDepositing(false)}
              className="p-2 text-stone-400 hover:text-stone-600 transition-all rounded-full"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-stone-200 dark:text-stone-600 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full"
            title="Remover Meta"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Inline Deposit Field */}
      {isDepositing && (
        <div className="mb-4 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="relative">
              <input 
                autoFocus
                type="number"
                placeholder="Valor para guardar..."
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmDeposit()}
                className="w-full pl-4 pr-12 py-3 bg-stone-50 dark:bg-stone-900/50 border-2 border-accent-blue/20 dark:border-accent-blue/40 rounded-2xl outline-none focus:border-accent-blue font-bold text-sm transition-all dark:text-stone-200"
              />
              <button 
                onClick={handleConfirmDeposit}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-blue text-white p-1.5 rounded-xl hover:scale-105 active:scale-95"
              >
                <Check size={16} strokeWidth={3} />
              </button>
           </div>
        </div>
      )}

      <div className="space-y-3 z-10">
        {/* Solaris Progress Bar */}
        <div className="h-3 bg-stone-50 dark:bg-stone-900/50 rounded-full overflow-hidden border border-stone-100 dark:border-stone-700 p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
              isComplete ? 'bg-accent-emerald' : 'bg-accent-blue'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
          <span className={isComplete ? 'text-accent-emerald' : 'text-stone-400'}>
            {isComplete ? '✨ Objetivo Alcançado' : `${percentage.toFixed(0)}% Guardado`}
          </span>
          {!isComplete && (
            <span className="text-stone-300 dark:text-stone-600">Faltam {formatCurrency(limit - currentAmount)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
