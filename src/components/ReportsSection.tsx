import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, ListOrdered } from 'lucide-react';
import ExpenseByCategory from './Charts/ExpenseByCategory';
import DailyEvolution from './Charts/DailyEvolution'; // Changed from MonthlyTrend
import BudgetProgress from './Charts/BudgetProgress';
import ExpenseRanking from './Charts/ExpenseRanking';
import { Transaction, Budget } from '../types';

interface ReportsSectionProps {
  transactions: Transaction[];
  budgets: Budget[];
  currentMonth: string;
}

type TabType = 'ranking' | 'category' | 'trend' | 'budget';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'ranking', label: 'Ranking', icon: <ListOrdered size={14} /> },
  { id: 'category', label: 'Pizza', icon: <PieChart size={14} /> },
  { id: 'trend', label: 'Diário', icon: <TrendingUp size={14} /> }, // Label changed to Diário
  { id: 'budget', label: 'Metas', icon: <BarChart3 size={14} /> },
];

const ReportsSection: React.FC<ReportsSectionProps> = ({ transactions, budgets, currentMonth }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ranking');

  return (
    <div className="bg-white dark:bg-zen-900 p-6 kinetic-card dark:border-stone-800 h-full flex flex-col">
      {/* Tab Navigation Zen */}
      <div className="flex bg-stone-100 dark:bg-zen-800 p-1 mb-6 border-b-2 border-stone-200 dark:border-stone-700 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-zen-900 dark:bg-zen-50 dark:text-zen-900 text-white shadow-lg translate-y-[-2px]'
                : 'text-stone-400 dark:text-stone-500 hover:text-zen-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.icon}
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-[360px] flex flex-col overflow-hidden">
        {activeTab === 'ranking' && (
          <ExpenseRanking transactions={transactions} month={currentMonth} />
        )}
        {activeTab === 'category' && (
          <ExpenseByCategory transactions={transactions} month={currentMonth} />
        )}
        {activeTab === 'trend' && (
          <DailyEvolution transactions={transactions} currentMonth={currentMonth} />
        )}
        {activeTab === 'budget' && (
          <BudgetProgress 
            budgets={budgets} 
            transactions={transactions} 
            currentMonth={currentMonth} 
          />
        )}
      </div>
    </div>
  );
};

export default ReportsSection;
