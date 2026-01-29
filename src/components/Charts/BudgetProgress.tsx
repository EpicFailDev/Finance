import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Budget, Transaction, TransactionType } from '../../types';

interface BudgetProgressProps {
  budgets: Budget[];
  transactions: Transaction[];
  currentMonth: string;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets, transactions, currentMonth }) => {
  // Calculate spent per category
  const spentByCategory = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const data = budgets.map(budget => {
    const spent = spentByCategory[budget.category] || 0;
    const percentage = (spent / budget.limit) * 100;
    
    return {
      category: budget.category,
      spent,
      limit: budget.limit,
      percentage,
      remaining: budget.limit - spent,
      isOver: spent > budget.limit,
    };
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return '#E11D48'; // Solaris Red
    if (percentage >= 80) return '#EAB308';  // Ambar
    return '#10B981'; // Solaris Green
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Sem orçamento definido</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 'dataMax']}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              type="category" 
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
              width={80}
            />
            <Tooltip 
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}
              itemStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: 'white' }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="spent" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.percentage)}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
            {/* Reference lines for limits */}
            {data.map((entry, index) => (
              <ReferenceLine 
                key={`ref-${index}`}
                x={entry.limit} 
                stroke="#CBD5E1" 
                strokeDasharray="3 3"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 border-t border-stone-50 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">&lt;80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">80-100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Estourado</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;
