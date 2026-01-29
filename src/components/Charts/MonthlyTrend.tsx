import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface MonthlyTrendProps {
  transactions: Transaction[];
}

const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const monthlyData = new Map<string, { income: number; expense: number }>();

    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const current = monthlyData.get(month) || { income: 0, expense: 0 };
      
      if (t.type === TransactionType.INCOME) {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      
      monthlyData.set(month, current);
    });

    return Array.from(monthlyData.entries())
      .map(([month, values]) => ({
        month,
        label: formatMonthLabel(month),
        income: values.income,
        expense: values.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Sem dados para gerar tendência</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              tickFormatter={(value) => value === 0 ? '0' : `R$ ${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}
              itemStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'income' ? 'ENTRADAS' : 'SAÍDAS'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#E11D48" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-8 border-t border-stone-50 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Entradas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E11D48] shadow-[0_0_10px_rgba(225,29,72,0.4)]"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Saídas</span>
        </div>
      </div>
    </div>
  );
};

// Helper to format month label (Jan, Feb, etc.)
function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}

export default MonthlyTrend;
