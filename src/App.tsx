import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, TransactionType } from './types';
import { transactionsApi, budgetsApi } from './services/api';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Stats from './components/Stats';
import ImportModal from './components/ImportModal';
import BudgetForm from './components/BudgetForm';
import SettingsModal from './components/SettingsModal';
import BudgetSection from './components/BudgetSection';
import ReportsSection from './components/ReportsSection';
import { LayoutDashboard, Wallet, Import, Loader2, PiggyBank, BarChart3, ChevronRight, Plus } from 'lucide-react';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const currentMonth = getCurrentMonth();

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await transactionsApi.getAll();
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      throw err;
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const data = await budgetsApi.getByMonth(currentMonth);
      setBudgets(data as Budget[]);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
  }, [currentMonth]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchTransactions(), fetchBudgets()]);
      } catch {
        setError('Falha ao conectar ao servidor. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchTransactions, fetchBudgets]);

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const created = await transactionsApi.create(newTx);
      setTransactions(prev => [created, ...prev]);
      setIsTransactionFormOpen(false);
    } catch (err) {
      alert('Erro ao salvar transação');
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    try {
      const { id, ...data } = updatedTx;
      await transactionsApi.update(id, data);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
      setEditingTransaction(null);
      setIsTransactionFormOpen(false);
    } catch (err) {
      alert('Erro ao atualizar transação');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este lançamento?')) {
      try {
        await transactionsApi.delete(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert('Erro ao remover transação');
      }
    }
  };

  const handleImport = async (importedTransactions: Omit<Transaction, 'id'>[]) => {
    try {
      await transactionsApi.bulkImport(importedTransactions);
      await fetchTransactions();
    } catch (err) {
      alert('Erro ao importar transações');
    }
  };

  const handleSaveBudget = async (category: string, limit: number, month: string, currentAmount: number) => {
    try {
      await budgetsApi.upsert({ category, limit, month, currentAmount });
      await fetchBudgets();
    } catch (err) {
      alert('Erro ao salvar caixinha');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta caixinha?')) {
      try {
        await budgetsApi.delete(id);
        setBudgets(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert('Erro ao remover caixinha');
      }
    }
  };

  const handleDepositToBudget = async (id: string, amount: number) => {
    try {
      const budget = budgets.find(b => b.id === id);
      if (!budget) return;

      // 1. Create a transaction for the "spent" portion that goes into savings
      await transactionsApi.create({
        description: `Depósito: ${budget.category}`,
        amount,
        date: new Date().toISOString().split('T')[0],
        category: 'Dinheiro Guardado',
        type: TransactionType.INVESTMENT,
        paymentMethod: 'Dinheiro'
      });

      // 2. Update the budget's current progress
      await budgetsApi.update(id, {
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
        currentAmount: budget.currentAmount + amount
      });

      // 3. Refresh all data
      await Promise.all([fetchTransactions(), fetchBudgets()]);
    } catch (err) {
      alert('Erro ao realizar depósito');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      
      {/* Header Solaris Premium - SOLID & BRIGHT */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zen-950 border-b border-stone-100 dark:border-stone-800 px-4 sm:px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
          <button className="w-12 h-12 bg-[#2563EB] flex items-center justify-center text-white rounded-2xl shadow-[0_15px_30px_-8px_rgba(37,99,235,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-4 ring-blue-50">
            <Wallet size={24} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-zen-900 dark:text-zen-50 flex items-center gap-2">
              FINANCE <span className="text-[#2563EB]">ZEN</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Status: Solaris Premium • {currentMonth}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 h-full">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="btn-vibrant flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-white dark:bg-zen-900 border-2 border-[#8A05BE] font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#8A05BE] dark:text-[#A855F7] hover:text-white hover:bg-[#8A05BE] transition-all rounded-full group shadow-md"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg" 
                alt="Nubank" 
                className="w-4 h-4 sm:w-5 sm:h-5 transition-all group-hover:brightness-0 group-hover:invert"
              />
              <span className="hidden xs:inline">Importar Nubank</span>
            </button>

            <button 
              onClick={() => setIsTransactionFormOpen(true)}
              className="hidden lg:flex items-center gap-3 px-7 py-3.5 bg-[#2563EB] text-white font-black text-xs uppercase tracking-[0.15em] rounded-full shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] active:scale-95 hover:translate-y-[-2px] hover:bg-[#1d4ed8] transition-all border-2 border-white/20"
            >
              <Plus size={18} strokeWidth={3} />
              Novo Lançamento
            </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
        
        {/* State Management Layers */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin text-stone-300" />
            <span className="mt-4 text-xs font-bold uppercase tracking-widest text-stone-400">Sincronizando...</span>
          </div>
        )}

        {error && (
          <div className="kinetic-card border-rose-500 p-8 text-rose-500 bg-rose-50">
            <div className="font-bold uppercase tracking-widest mb-1">Erro de Conexão</div>
            <p className="font-medium text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold underline">Tentar Reconectar</button>
          </div>
        )}

        {/* Content Flow */}
        {!loading && !error && (
          <>
            {/* Layer 1: Overview */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent-blue shadow-vibrant-blue"></div>
                <h2 className="text-2xl font-bold tracking-tighter text-zen-900 dark:text-zen-100">Dashboard</h2>
              </div>
              <Stats transactions={transactions} budgets={budgets} />
            </section>

            {/* Layer 2: Analysis & Budgets */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
              
              {/* Reports (Left) */}
              <div className="order-2 lg:order-1 space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-accent-blue"></div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tighter text-zen-900 dark:text-zen-100">Relatórios Visuais</h2>
                </div>
                <div className="kinetic-card p-1 sm:p-2 bg-stone-50 dark:bg-zen-900 dark:border-stone-800 overflow-hidden">
                  <ReportsSection 
                    transactions={transactions}
                    budgets={budgets}
                    currentMonth={currentMonth}
                  />
                </div>
              </div>

              {/* Budgets (Right) */}
              <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-accent-blue"></div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tighter text-zen-900 dark:text-zen-100">Metas do Mês</h2>
                </div>
                <div className="space-y-6">
                  <BudgetForm 
                    currentMonth={currentMonth}
                    onSave={handleSaveBudget}
                    existingBudgets={budgets}
                  />
                  <BudgetSection 
                    budgets={budgets}
                    onDelete={handleDeleteBudget}
                    onDeposit={handleDepositToBudget}
                  />
                </div>
              </div>
            </section>

            {/* Layer 3: Main Operations */}
            <section className="space-y-8 sm:space-y-12 pb-24 lg:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-accent-blue shadow-vibrant-blue"></div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tighter text-zen-900 dark:text-zen-100">Lançamentos Recentes</h2>
              </div>
              
              <div className="w-full h-full">
                <TransactionList 
                  transactions={transactions} 
                  onDelete={handleDeleteTransaction}
                  onEdit={(t) => {
                    setEditingTransaction(t);
                    setIsTransactionFormOpen(true);
                  }}
                />
              </div>
            </section>
          </>
        )}

      </main>

      {/* Mobile Floating Action Button (FAB) - Style: ZEN SOLARIS (Solid Fix) */}
      {!loading && !error && !isTransactionFormOpen && (
        <button
          onClick={() => setIsTransactionFormOpen(true)}
          className="lg:hidden fixed bottom-10 right-8 w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(37,99,235,0.8)] active:scale-90 transition-all z-[60] border-4 border-white"
        >
          <Plus size={36} strokeWidth={3} />
        </button>
      )}

      {/* Transaction Form Modal - Fullscreen on Mobile */}
      {isTransactionFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 sm:py-8 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md" 
            onClick={() => {
              setIsTransactionFormOpen(false);
              setEditingTransaction(null);
            }}
          ></div>
          <div className="animate-in fade-in slide-in-from-bottom-full duration-300 w-full sm:max-w-lg z-10">
            <div className="bg-white dark:bg-zen-900 min-h-[50vh] sm:min-h-0 sm:kinetic-card dark:border-stone-700 relative">
               {/* Mobile Close Indicator */}
               <div className="sm:hidden w-12 h-1 bg-stone-200 mx-auto mt-4 mb-2 rounded-full cursor-pointer" 
                    onClick={() => {
                      setIsTransactionFormOpen(false);
                      setEditingTransaction(null);
                    }}></div>
               <div className="p-0 sm:p-2">
                <TransactionForm 
                  onAddTransaction={handleAddTransaction}
                  editingTransaction={editingTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onCancelEdit={() => {
                    setIsTransactionFormOpen(false);
                    setEditingTransaction(null);
                  }}
                />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação Nubank */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataWiped={() => {
          fetchTransactions();
          fetchBudgets();
        }}
        transactions={transactions}
        budgets={budgets}
      />
      
    </div>
  );
};

export default App;