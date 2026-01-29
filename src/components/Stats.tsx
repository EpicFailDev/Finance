import React from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from 'lucide-react';
import { Budget } from '../types';

interface StatsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const Stats: React.FC<StatsProps> = ({ transactions, budgets }) => {
  const calculateStats = () => {
    const stats = transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.income += t.amount;
        } else if (t.type === TransactionType.INVESTMENT) {
          acc.invested += t.amount;
        } else {
          acc.expense += t.amount;
        }
        // Balance = Income - (Expense + Investment)
        // O dinheiro investido saiu da conta corrente, então reduz o saldo disponível
        acc.balance = acc.income - acc.expense - acc.invested;
        return acc;
      },
      { income: 0, expense: 0, invested: 0, balance: 0 }
    );

    const totalSaved = budgets.reduce((acc, b) => acc + b.currentAmount, 0);
    
    return { ...stats, totalSaved };
  };

  const { income, expense, balance, totalSaved } = calculateStats();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 gap-4 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar md:grid-cols-4">
      
      {/* Saldo Total - Foco Central */}
      <div className="kinetic-card min-w-[260px] md:min-w-0 flex-1 p-5 sm:p-6 group border-t-8 border-t-accent-blue shadow-vibrant-blue snap-center transition-all duration-300 bg-white dark:bg-zen-900 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-400">Saldo Atual</span>
          <div className="p-2 bg-stone-100 dark:bg-stone-800 group-hover:bg-accent-blue group-hover:text-white transition-all duration-300">
            <Wallet size={18} />
          </div>
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-black tracking-tighter text-zen-900 dark:text-zen-100">
          {formatCurrency(balance)}
        </div>
      </div>

      {/* Dinheiro Guardado */}
      <div className="kinetic-card min-w-[260px] md:min-w-0 flex-1 p-5 sm:p-6 border-t-8 border-t-[#6366F1] shadow-md group snap-center transition-all duration-300 bg-white dark:bg-zen-900 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-400">Guardado</span>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white transition-all">
            <PiggyBank size={18} />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-black text-[#6366F1] tracking-tighter">
          {formatCurrency(totalSaved)}
        </div>
        <p className="text-[9px] font-bold text-indigo-400 mt-2 uppercase tracking-wider">Nas Caixinhas</p>
      </div>

      {/* Entradas */}
      <div className="kinetic-card min-w-[260px] md:min-w-0 flex-1 p-5 sm:p-6 border-t-8 border-t-accent-emerald shadow-vibrant-emerald group snap-center transition-all duration-300 bg-white dark:bg-zen-900 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-400">Entradas</span>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-accent-emerald group-hover:bg-accent-emerald group-hover:text-white transition-all">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-black text-accent-emerald tracking-tighter">
          {formatCurrency(income)}
        </div>
      </div>

      {/* Saídas */}
      <div className="kinetic-card min-w-[260px] md:min-w-0 flex-1 p-5 sm:p-6 border-t-8 border-t-accent-rose shadow-md group snap-center transition-all duration-300 bg-white dark:bg-zen-900 dark:border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-400">Saídas</span>
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-accent-rose group-hover:bg-accent-rose group-hover:text-white transition-all">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-black text-accent-rose tracking-tighter">
          {formatCurrency(expense)}
        </div>
      </div>

    </div>
  );
};

export default Stats;