import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface DailyEvolutionProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
}

const DailyEvolution: React.FC<DailyEvolutionProps> = ({ transactions, currentMonth }) => {
  const data = useMemo(() => {
    // 1. Criar array com todos os dias do mês
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        label: `${day}`,
        income: 0,
        expense: 0,
        dateFull: `${currentMonth}-${String(day).padStart(2, '0')}`
      };
    });

    // 2. Preencher com transações
    transactions.forEach(t => {
      if (!t.date.startsWith(currentMonth)) return;
      
      const dayIndex = parseInt(t.date.split('-')[2]) - 1;
      if (dayIndex >= 0 && dayIndex < daysInMonth) {
        if (t.type === TransactionType.INCOME) {
          days[dayIndex].income += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          // Ignora Investimentos no gráfico de fluxo (ou poderia ser uma 3ª linha, mas vou omitir por enquanto para clareza)
          days[dayIndex].expense += t.amount;
        }
      }
    });

    return days;
  }, [transactions, currentMonth]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calcula totais para exibir no header
  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Fluxo Diário</h4>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-bold text-stone-400 uppercase">Entradas</span>
             <span className="text-xs font-mono font-bold text-[#10B981]">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-bold text-stone-400 uppercase">Saídas</span>
             <span className="text-xs font-mono font-bold text-[#E11D48]">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              dy={10}
              interval={2} // Mostrar a cada 2 dias para não poluir
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              tickFormatter={(value) => value === 0 ? '0' : `${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`}
            />
            <Tooltip 
              cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#64748B', fontWeight: 800, fontSize: '10px', marginBottom: '4px' }}
              labelFormatter={(label) => `Dia ${label}`}
              itemStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700 }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'income' ? 'Calculado (Entrada)' : 'Realizado (Saída)'
              ]}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '0px', paddingBottom: '20px' }}
              formatter={(value) => value === 'income' ? 'ARRECADAÇÃO (ENTRADAS)' : 'GASTOS (SAÍDAS)'}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="income"
              stroke="#2563EB" // Azul Forte (Referência 1) ou Emerald
              strokeWidth={3}
              dot={{ r: 3, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              name="expense"
              stroke="#E11D48"
              strokeWidth={3}
              dot={{ r: 3, fill: '#E11D48', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyEvolution;
