import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import { Plus, X, Check } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction: Transaction | null;
  onUpdateTransaction: (transaction: Transaction) => void;
  onCancelEdit: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
  editingTransaction,
  onUpdateTransaction,
  onCancelEdit,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.OUTROS);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category as Category);
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setMethod(editingTransaction.paymentMethod as PaymentMethod);
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(Category.OUTROS);
    setType(TransactionType.EXPENSE);
    setDate(new Date().toISOString().split('T')[0]);
    setMethod(PaymentMethod.CREDIT_CARD);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      description,
      amount: parseFloat(amount),
      category,
      type,
      date,
      paymentMethod: method,
    };

    if (editingTransaction) {
      onUpdateTransaction({ ...transactionData, id: editingTransaction.id });
    } else {
      onAddTransaction(transactionData);
      resetForm();
    }
  };

  return (
    <div className="kinetic-card p-8 bg-white dark:bg-zen-800 dark:border-stone-700 sticky top-28">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-[#2563EB] p-3 text-white rounded-2xl shadow-lg">
          <Plus size={24} strokeWidth={3} />
        </div>
        <h3 className="font-black text-2xl tracking-tighter text-zen-900 dark:text-zen-100 leading-none">
          {editingTransaction ? 'Editar Registro' : 'Novo Lançamento'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Toggle Tipo */}
        <div className="flex p-1.5 bg-stone-100 dark:bg-zen-900 rounded-2xl border-2 border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
              type === TransactionType.EXPENSE 
                ? 'bg-[#E11D48] text-white shadow-xl scale-100' 
                : 'text-stone-400 hover:text-rose-500 scale-95'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.INCOME)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
              type === TransactionType.INCOME 
                ? 'bg-[#10B981] text-white shadow-xl scale-100' 
                : 'text-stone-400 hover:text-emerald-500 scale-95'
            }`}
          >
            Entrada
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">O que foi?</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-600 focus:border-zen-900 dark:focus:border-zen-100 outline-none font-medium transition-colors bg-white dark:bg-zen-900 dark:text-white"
            placeholder="Ex: Aluguel, Mercado, Freela..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Quanto?</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-stone-400">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 dark:border-stone-600 focus:border-zen-900 dark:focus:border-zen-100 outline-none font-mono font-bold text-lg bg-white dark:bg-zen-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Quando?</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-600 focus:border-zen-900 dark:focus:border-zen-100 outline-none font-mono text-sm bg-white dark:bg-zen-900 dark:text-white dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-600 focus:border-zen-900 dark:focus:border-zen-100 outline-none bg-white dark:bg-zen-900 dark:text-white cursor-pointer"
            >
              {Object.values(Category).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Pagamento</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-600 focus:border-zen-900 dark:focus:border-zen-100 outline-none bg-white dark:bg-zen-900 dark:text-white cursor-pointer"
            >
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-4 border-2 border-stone-200 dark:border-stone-600 font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={`flex-[2] py-4 font-black uppercase tracking-widest text-white shadow-lg hover:translate-y-[-2px] active:scale-95 transition-all rounded-2xl ${
              type === TransactionType.EXPENSE 
                ? 'bg-[#E11D48] hover:bg-[#BE123C]' 
                : 'bg-[#10B981] hover:bg-[#059669]'
            }`}
          >
            {editingTransaction ? 'Atualizar Registro' : 'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;