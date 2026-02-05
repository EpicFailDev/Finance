import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonth, onMonthChange }) => {
  const date = new Date(`${currentMonth}-01T00:00:00`);

  const handlePrev = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    const newMonthStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    const newMonthStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthStr);
  };

  const formattedDate = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  // Capitalize first letter
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="flex items-center gap-2 bg-stone-100 dark:bg-zen-900 rounded-full p-1.5 border border-stone-200 dark:border-stone-800 shadow-inner">
      <button 
        onClick={handlePrev}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow"
        title="Mês Anterior"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center">
        <Calendar size={14} className="text-stone-400 dark:text-stone-600" />
        <span className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
          {displayDate}
        </span>
      </div>

      <button 
        onClick={handleNext}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow"
        title="Próximo Mês"
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default MonthSelector;
