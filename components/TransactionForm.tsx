import React, { useState, useEffect } from 'react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types';
import { PlusCircle, Save } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction | null;
  onUpdateTransaction?: (t: Transaction) => void;
  onCancelEdit?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAddTransaction, 
  editingTransaction, 
  onUpdateTransaction,
  onCancelEdit
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>(Category.OUTROS);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
      setPaymentMethod(editingTransaction.paymentMethod);
    }
  }, [editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const transactionData = {
      description,
      amount: parseFloat(amount),
      date,
      category,
      type,
      paymentMethod,
    };

    if (editingTransaction && onUpdateTransaction) {
      onUpdateTransaction({ ...transactionData, id: editingTransaction.id });
    } else {
      onAddTransaction(transactionData);
    }

    // Reset form only if not editing (or after successful edit if parent handles close)
    if (!editingTransaction) {
      setDescription('');
      setAmount('');
      setCategory(Category.OUTROS);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(Category.OUTROS);
    setType(TransactionType.EXPENSE);
    setPaymentMethod(PaymentMethod.PIX);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Toggle */}
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg ${
                type === TransactionType.INCOME 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg ${
                type === TransactionType.EXPENSE 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Saída
            </button>
          </div>

          {/* Amount */}
          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
             <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ex: Compras Supermercado"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

           {/* Payment Method */}
           <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {Object.values(PaymentMethod).map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {editingTransaction && (
             <button
             type="button"
             onClick={handleCancel}
             className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
           >
             Cancelar
           </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {editingTransaction ? <Save size={18} /> : <PlusCircle size={18} />}
            {editingTransaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TransactionForm;