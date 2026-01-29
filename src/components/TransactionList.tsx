import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, Edit3, Calendar, Tag, CreditCard, PiggyBank } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  
  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const cleanDisplayTitle = (raw: string): string => {
    let clean = raw;
    
    // 1. Remove prefixos comuns (Nubank) com regex flexível
    const prefixes = [
      /Transfer.ncia (enviada|recebida) pelo Pix\s*-\s*/i,
      /Transfer.ncia (enviada|recebida)\s*-\s*/i,
      /Compra no (d.bito|cr.dito)\s*-\s*/i,
      /Pagamento de fatura\s*/i,
      /Resgate RDB\s*/i
    ];
    
    prefixes.forEach(p => clean = clean.replace(p, ''));
    
    // 2. Remove sufixos de documentos e limpa ruído
    clean = clean.split(' - ')[0]; 
    
    return clean
      .replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '') // Remove CNPJ solto
      .replace(/\*\*\*\.\d{3}\.\d{3}-\*\*/g, '') // Remove CPF mascarado
      .replace(/"/g, '')
      .trim() || raw;
  };

  const groupTransactionsByDate = () => {
    const groups = new Map<string, Transaction[]>();
    transactions.forEach(t => {
      const date = t.date;
      const current = groups.get(date) || [];
      groups.set(date, [...current, t]);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const sortedGroups = groupTransactionsByDate();

  if (transactions.length === 0) {
    return (
      <div className="kinetic-card p-12 text-center bg-white dark:bg-zen-900 border dark:border-stone-800">
        <div className="inline-block p-4 bg-stone-50 text-stone-300 mb-4">
          <Calendar size={48} />
        </div>
        <p className="text-stone-500 font-medium">Nenhum registro encontrado.</p>
        <p className="text-stone-400 text-sm mt-1">Comece adicionando seus ganhos ou gastos no formulário.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sortedGroups.map(([date, group]) => (
        <div key={date} className="relative">
          {/* Date Header - Focus Point */}
          <div className="flex items-center gap-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zen-800 dark:text-zen-100 opacity-40 bg-zen-50 dark:bg-transparent pr-4 z-10">
              {formatDate(date)}
            </h4>
            <div className="flex-1 h-[2px] bg-stone-200 dark:bg-stone-800"></div>
          </div>

          <div className="space-y-3">
            {group.map((t) => {
              const isExpanded = expandedIds.has(t.id);
              const displayTitle = cleanDisplayTitle(t.description);
              const isDiff = displayTitle !== t.description;

              return (
                <div 
                  key={t.id} 
                  onClick={() => toggleExpand(t.id)}
                  className={`kinetic-card group bg-white dark:bg-zen-800 flex flex-col items-stretch p-3.5 sm:p-4 gap-3 rounded-2xl border border-stone-50 dark:border-stone-700 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    isExpanded ? 'ring-2 ring-accent-blue/10 bg-blue-50/10 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 shrink-0 flex items-center justify-center text-[9px] font-black tracking-widest rounded-xl ${
                        t.type === TransactionType.INCOME 
                          ? 'bg-accent-emerald/10 text-accent-emerald' 
                          : t.type === TransactionType.INVESTMENT
                            ? 'bg-indigo-50 text-[#6366F1]'
                            : 'bg-rose-50 text-[#E11D48]'
                      }`}>
                        {t.type === TransactionType.INVESTMENT ? <PiggyBank size={18} /> : t.category.substring(0, 3).toUpperCase()}
                      </div>
                      
                      <div className="overflow-hidden">
                        <h5 className="font-bold text-base text-zen-900 dark:text-zen-100 tracking-tight leading-none mb-1.5 truncate group-hover:text-accent-blue transition-colors">
                          {displayTitle}
                        </h5>
                        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                          <span className="flex items-center gap-1.5"><Tag size={10} className="text-stone-300 dark:text-stone-600" /> {t.category}</span>
                          <span className="flex items-center gap-1.5"><CreditCard size={10} className="text-stone-300 dark:text-stone-600" /> {t.paymentMethod}</span>
                          {isDiff && <span className="text-accent-blue/40 font-black">+ detalhes</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-stone-100 sm:pl-6">
                      <div className={`font-mono font-black text-xl tracking-tighter shrink-0 ${
                        t.type === TransactionType.INCOME 
                          ? 'text-accent-emerald' 
                          : t.type === TransactionType.INVESTMENT
                            ? 'text-[#6366F1]'
                            : 'text-[#E11D48]'
                      }`}>
                        {t.type === TransactionType.INCOME ? '+' : t.type === TransactionType.INVESTMENT ? '➜' : '-'} {formatCurrency(t.amount)}
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onEdit(t)}
                          className="w-8 h-8 flex items-center justify-center text-stone-300 dark:text-stone-600 hover:text-accent-blue hover:bg-accent-blue/5 transition-all rounded-full"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="w-8 h-8 flex items-center justify-center text-stone-300 dark:text-stone-600 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Expansíveis */}
                  {isExpanded && isDiff && (
                    <div className="mt-4 pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed italic bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl">
                        <span className="uppercase text-[9px] font-black tracking-widest block mb-1 text-stone-400">Descrição Completa:</span>
                        {t.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;