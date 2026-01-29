import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface ExpenseByCategoryProps {
  transactions: Transaction[];
  month?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Habitação': '#2563EB',    // Sapphire (Solaris Indigo)
  'Alimentação': '#10B981',  // Emerald
  'Transporte': '#6366F1',   // Indigo Light
  'Saúde': '#E11D48',        // Solaris Red
  'Lazer': '#F59E0B',        // Ambar
  'Outros': '#94A3B8',       // Slate
  'Default': '#CBD5E1'       // Fallback
};

const ExpenseByCategory: React.FC<ExpenseByCategoryProps> = ({ transactions, month }) => {
  const data = useMemo(() => {
    const filtered = transactions.filter(t => {
      // Ignora Investimentos (Dinheiro Guardado)
      if (t.type === TransactionType.INVESTMENT) return false;
      
      const isExpense = t.type === TransactionType.EXPENSE;
      const dateStr = String(t.date);
      const matchesMonth = month ? dateStr.indexOf(String(month)) === 0 : true;
      return isExpense && matchesMonth;
    });

    const grouped = filtered.reduce((acc, t) => {
      const cat = t.category;
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value: value as number,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Default'],
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  }, [transactions, month]);

  const formatCurrency = (value: number | string) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-stone-50 border-2 border-dashed border-stone-200 mb-4 flex items-center justify-center text-stone-300">
          <PieChart size={32} />
        </div>
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Sem dados este mês</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={data.length > 1 ? 4 : 0}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#1A1A18', 
                border: 'none', 
                borderRadius: '0px',
                color: 'white',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px'
              }}
              itemStyle={{ color: 'white' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="rect" iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-y-3 border-t-2 border-stone-50 pt-6">
        {data.slice(0, 4).map(item => (
          <div key={item.name} className="flex flex-col">
            <span className="text-[10px] uppercase font-extrabold text-stone-400 tracking-wider mb-1">{item.name}</span>
            <span className="font-mono text-sm font-bold">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseByCategory;
