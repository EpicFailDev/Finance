import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../../types';

interface ExpenseRankingProps {
  transactions: Transaction[];
  month?: string;
}

const ExpenseRanking: React.FC<ExpenseRankingProps> = ({ transactions, month }) => {
  const data = useMemo(() => {
    // 1. Filtrar gastos do mês selecionado (Excluindo Investimentos)
    const filtered = transactions.filter(t => {
      const isExpense = t.type === TransactionType.EXPENSE;
      const dateStr = String(t.date);
      const matchesMonth = month ? dateStr.indexOf(String(month)) === 0 : true;
      return isExpense && matchesMonth;
    });

    // 0. Função de Limpeza Ultra-Robusta
    const cleanDisplayTitle = (raw: string): string => {
      let clean = raw;
      
      // 1. Remove prefixos comuns (Nubank) com regex flexível (pontos para ignorar acentos/variações)
      const prefixes = [
        /Transfer.ncia (enviada|recebida) pelo Pix\s*-\s*/i,
        /Transfer.ncia (enviada|recebida)\s*-\s*/i,
        /Compra no (d.bito|cr.dito)\s*-\s*/i,
        /Pagamento de fatura\s*/i,
        /Resgate RDB\s*/i
      ];
      
      prefixes.forEach(p => clean = clean.replace(p, ''));
      
      // 2. Remove sufixos de documentos (CNPJ/CPF mascarados ou não)
      // Ex: " - 12.345.678/0001-90" ou " - ***.234.***-**"
      clean = clean.split(' - ')[0]; // Pega a primeira parte se ainda houver separador
      
      // 3. Limpeza final de ruído
      clean = clean
        .replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, '') // Remove CNPJ solto
        .replace(/\*\*\*\.\d{3}\.\d{3}-\*\*/g, '') // Remove CPF mascarado
        .replace(/"/g, '')
        .trim();
        
      return clean || raw;
    };

    // 2. Agrupar por Descrição Limpa
    type GroupedData = Record<string, { amount: number; count: number; category: string }>;
    
    const grouped = filtered.reduce((acc, t) => {
      const name = cleanDisplayTitle(t.description); 
      if (!acc[name]) {
        acc[name] = { amount: 0, count: 0, category: t.category };
      }
      acc[name].amount += t.amount;
      acc[name].count += 1;
      return acc;
    }, {} as GroupedData);

    // 3. Transformar em array e ordenar pelo valor total (Decrescente)
    const sorted = Object.entries(grouped)
      .map(([name, { amount, count, category }]) => ({
        name,
        amount,
        count,
        category
      }))
      .sort((a, b) => b.amount - a.amount);

    return sorted;
  }, [transactions, month]);

  const maxAmount = data.length > 0 ? data[0].amount : 0;
  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Sem gastos neste período</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ranking de Gastos</h4>
        <span className="text-[10px] font-bold text-stone-400">{data.length} Itens</span>
      </div>

      <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
        {data.map((item, index) => {
          const percentOfMax = (item.amount / maxAmount) * 100;
          const percentOfTotal = (item.amount / totalExpenses) * 100;
          
          // Cores baseadas na posição do ranking
          const isTop3 = index < 3;
          const barColor = index === 0 ? 'bg-[#E11D48]' : index === 1 ? 'bg-[#F59E0B]' : index === 2 ? 'bg-[#10B981]' : 'bg-stone-300';
          const textColor = index === 0 ? 'text-[#E11D48]' : 'text-zen-900';

          return (
            <div key={item.name} className="group">
              <div className="flex items-end justify-between mb-1.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-black w-4 text-center ${isTop3 ? 'text-zen-900' : 'text-stone-300'}`}>
                    #{index + 1}
                  </span>
                  <div className="flex flex-col truncate">
                    <span className={`text-xs font-bold truncate ${textColor} tracking-tight`}>
                      {item.name}
                    </span>
                    <span className="text-[9px] text-stone-400 font-medium">
                      {item.count} transação{item.count > 1 ? 'ões' : ''} • {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono text-xs font-black text-zen-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400">
                    {percentOfTotal.toFixed(1)}% do total
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                  style={{ width: `${percentOfMax}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Summary */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Total Gasto</span>
        <span className="font-mono text-sm font-black text-[#E11D48]">{formatCurrency(totalExpenses)}</span>
      </div>
    </div>
  );
};

export default ExpenseRanking;
