import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, TransactionType, Category } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface StatsProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Stats: React.FC<StatsProps> = ({ transactions }) => {
  
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      else expense += t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    
    Object.values(Category).forEach(c => data[c] = 0);

    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        if (data[t.category] !== undefined) {
          data[t.category] += t.amount;
        }
      });

    return Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Entradas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <ArrowUpCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Saídas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.expense)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full">
            <ArrowDownCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Saldo Total</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400">
               Sem dados de despesas para exibir.
             </div>
          )}
        </div>

        {/* Simple Bar Chart for Income vs Expense */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Entradas vs Saídas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Entrada', value: stats.income },
                { name: 'Saída', value: stats.expense },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis hide />
              <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {
                  [{ name: 'Entrada', value: stats.income }, { name: 'Saída', value: stats.expense }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Entrada' ? '#22c55e' : '#ef4444'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;