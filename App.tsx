import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Stats from './components/Stats';
import ImportModal from './components/ImportModal';
import { LayoutDashboard, Wallet, Import } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('finance_transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: uuidv4(),
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja remover este lançamento?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleImport = (importedTransactions: Transaction[]) => {
    setTransactions(prev => [...importedTransactions, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Finanças Pessoais</h1>
          </div>
          
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Import size={18} />
            <span className="hidden sm:inline">Importar Nubank</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Dashboard Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-700">Visão Geral</h2>
          </div>
          <Stats transactions={transactions} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <section className="lg:col-span-1">
             <TransactionForm 
               onAddTransaction={handleAddTransaction}
               editingTransaction={editingTransaction}
               onUpdateTransaction={handleUpdateTransaction}
               onCancelEdit={() => setEditingTransaction(null)}
             />
          </section>

          {/* List Section */}
          <section className="lg:col-span-2">
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
              onEdit={setEditingTransaction}
            />
          </section>
        </div>

      </main>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
      
    </div>
  );
};

export default App;