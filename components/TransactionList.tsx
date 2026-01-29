import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, Edit2, Calendar, CreditCard, Tag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Histórico de Lançamentos</h3>
      </div>
      
      <div className="overflow-x-auto">
        {/* Mobile View (Cards) */}
        <div className="md:hidden">
          {sortedTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum lançamento registrado.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedTransactions.map((t) => (
                <li key={t.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{t.description}</span>
                    <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                     <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Tag size={12} /> {t.category}
                     </span>
                     <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Calendar size={12} /> {formatDate(t.date)}
                     </span>
                     <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <CreditCard size={12} /> {t.paymentMethod}
                     </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Editar Data e Detalhes"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remover Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop View (Table) */}
        <table className="min-w-full text-left text-sm text-gray-600 hidden md:table">
          <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
            <tr>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3">Pagamento</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum lançamento registrado.
                </td>
              </tr>
            ) : (
              sortedTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{t.paymentMethod}</td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                        onClick={() => onEdit(t)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Alterar Data e Detalhes"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Remover Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;