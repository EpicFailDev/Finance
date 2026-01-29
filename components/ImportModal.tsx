import React, { useState } from 'react';
import { Upload, X, Loader2, FileText, CheckCircle } from 'lucide-react';
import { categorizeTransactionsWithGemini } from '../services/geminiService';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Very basic CSV parser for Nubank (Date, Category, Title, Amount)
  // Nubank CSV headers often: date,category,title,amount
  // Amounts in Nubank CSV are often like "123.45" or "123,45" depending on locale settings of export
  const parseCSV = async (text: string) => {
    const lines = text.split('\n');
    const transactions: { date: string, description: string, amount: number, rawAmount: number }[] = [];

    // Skip header usually
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle potential quoted fields if description contains commas
      // Simple regex for CSV splitting ignoring commas inside quotes
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      if (parts.length >= 4) {
        // Nubank format: date,category,title,amount
        // Date is usually YYYY-MM-DD
        const date = parts[0]; 
        const title = parts[2];
        const amountStr = parts[3];

        if (date && title && amountStr) {
           const amount = parseFloat(amountStr);
           if (!isNaN(amount)) {
             transactions.push({
               date,
               description: title,
               amount: Math.abs(amount), // We handle sign via type logic below
               rawAmount: amount
             });
           }
        }
      }
    }
    return transactions;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const rawTransactions = await parseCSV(text);

      if (rawTransactions.length === 0) {
        setError("Não foi possível ler as transações do arquivo. Verifique se é um CSV padrão do Nubank.");
        setIsProcessing(false);
        return;
      }

      // Use Gemini to categorize
      const categoryMap = await categorizeTransactionsWithGemini(
        rawTransactions.map(t => ({ date: t.date, description: t.description, amount: t.amount }))
      );

      const newTransactions: Transaction[] = rawTransactions.map(t => {
        // Determine type based on amount sign from CSV (Nubank uses negative for expenses)
        // Or if rawAmount is positive but it's a known expense type? 
        // Usually Nubank CSV: -10.00 is expense, 100.00 is income (transfer received)
        const isExpense = t.rawAmount < 0; 
        
        return {
          id: uuidv4(),
          date: t.date, // Assumes YYYY-MM-DD from CSV
          description: t.description,
          amount: Math.abs(t.rawAmount),
          category: categoryMap.get(t.description) || Category.OUTROS,
          type: isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
          paymentMethod: PaymentMethod.CREDIT_CARD, // Default for Nubank Statement import
        };
      });

      onImport(newTransactions);
      onClose();

    } catch (err) {
      console.error(err);
      setError("Erro ao processar arquivo. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileText className="text-purple-600 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Importar Extrato Nubank</h2>
          <p className="text-sm text-gray-500 mt-2">
            Faça upload do arquivo CSV do seu extrato. A Inteligência Artificial irá categorizar seus gastos automaticamente.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-purple-600 w-8 h-8" />
                <span className="text-sm font-medium text-purple-600">Categorizando com IA...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-gray-400 w-8 h-8" />
                <span className="text-sm font-medium text-gray-600">Clique para selecionar o CSV</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 text-center">
            Suporta formato CSV padrão exportado pelo app do Nubank.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;