import React from 'react';
import { X, Trash2, Download, Moon, Sun, AlertTriangle } from 'lucide-react';
import { adminApi, Transaction, Budget } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataWiped: () => void;
  transactions: Transaction[];
  budgets: Budget[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onDataWiped,
  transactions 
}) => {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleWipeData = async () => {
    if (confirm('⚠️ PERIGO: Isso apagará TODOS os seus lançamentos e caixinhas permanentemente.\n\nTem certeza absoluta?')) {
      if (confirm('Última chance: Essa ação não pode ser desfeita. Confirmar limpeza total?')) {
        try {
          await adminApi.resetData();
          onDataWiped();
          onClose();
          alert('Sistema resetado com sucesso.');
        } catch (err) {
          alert('Erro ao resetar sistema. Verifique o servidor.');
          console.error(err);
        }
      }
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_zen_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-zen-900 w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-50 dark:bg-zen-800 px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 tracking-tight">Configurações</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors text-stone-500 dark:text-stone-400">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Theme & General */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Geral</div>
            
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-zen-800 border-2 border-stone-100 dark:border-stone-700 rounded-2xl hover:border-stone-300 dark:hover:border-stone-500 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-stone-700 dark:text-stone-200">Aparência</div>
                  <div className="text-xs text-stone-400 font-medium">{theme === 'dark' ? 'Escuro' : 'Claro (Padrão)'}</div>
                </div>
              </div>
            </button>

            <button 
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-zen-800 border-2 border-stone-100 dark:border-stone-700 rounded-2xl hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:hover:border-blue-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-stone-700 dark:text-stone-200">Exportar Dados</div>
                  <div className="text-xs text-stone-400 font-medium group-hover:text-blue-500 dark:group-hover:text-blue-400">Baixar backup em JSON</div>
                </div>
              </div>
            </button>
          </div>

          <div className="w-full h-px bg-stone-100"></div>

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={12} />
              Zona de Perigo
            </div>
            
            <button 
              onClick={handleWipeData}
              className="w-full flex items-center justify-between p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl hover:bg-rose-100 hover:border-rose-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-rose-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-rose-700">Limpar Histórico</div>
                  <div className="text-xs text-rose-400 font-medium">Apagar todos os dados</div>
                </div>
              </div>
            </button>
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-stone-50 dark:bg-zen-800 px-6 py-3 border-t border-stone-100 dark:border-stone-800 text-center">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Finance Zen v1.2</span>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
