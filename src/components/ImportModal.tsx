import React, { useState } from 'react';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { categorizeTransactionsWithGemini } from '../services/geminiService';
import { Category, PaymentMethod, TransactionType } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Omit<import('../types').Transaction, 'id'>[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    // Detecção Inteligente de Colunas pelo Cabeçalho
    const header = lines[0].toLowerCase().split(/[,;]/);
    const colIdx = {
      date: header.findIndex(h => h.includes('data') || h.includes('date')),
      title: header.findIndex(h => h.includes('desc') || h.includes('title') || h.includes('mercado')),
      amount: header.findIndex(h => h.includes('valor') || h.includes('amount'))
    };

    // Fallbacks para o formato específico: Data(0), Valor(1), Identificador(2), Descrição(3)
    if (colIdx.date === -1) colIdx.date = 0;
    if (colIdx.amount === -1) colIdx.amount = 1; 
    if (colIdx.title === -1) colIdx.title = 3;

    const transactions: { date: string, description: string, amount: number, rawAmount: number }[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Split respeitando delimitadores mais comuns
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)|;/); 
      
      let date = parts[colIdx.date]?.replace(/"/g, ''); 
      const title = parts[colIdx.title]?.replace(/"/g, '') || parts[parts.length - 1]?.replace(/"/g, ''); 
      const amountStr = parts[colIdx.amount]?.replace(/"/g, '').replace('R$', '').trim();

      if (date && title && amountStr) {
        // Conversão de Data DD/MM/YYYY para YYYY-MM-DD
        if (date.includes('/')) {
          const [d, m, y] = date.split('/');
          if (y && m && d) date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        // Normalização de Número (detecta se o separador decimal é vírgula ou ponto)
        const normalizedAmount = amountStr.includes(',') && amountStr.includes('.')
          ? amountStr.replace(/\./g, '').replace(',', '.') // 1.000,00 -> 1000.00
          : amountStr.replace(',', '.'); // 40,00 -> 40.00 ou 40.00 -> 40.00
          
        const amount = parseFloat(normalizedAmount);

        if (!isNaN(amount)) {
          transactions.push({
            date,
            description: title,
            amount: Math.abs(amount),
            rawAmount: amount
          });
        }
      }
    }
    return transactions;
  };

  const cleanDescription = (raw: string): string => {
    let clean = raw;

    // 1. Remover prefixos técnicos do Nubank
    const technicalPrefixes = [
      /Transferência (enviada|recebida) pelo Pix - /i,
      /Transferência (enviada|recebida) - /i,
      /Compra no (débito|crédito) - /i,
      /Pagamento de fatura/i,
      /Resgate RDB/i
    ];

    technicalPrefixes.forEach(p => clean = clean.replace(p, ''));

    // 2. Extrair apenas o nome core (até encontrar o primeiro delimitador técnico - , • /)
    // Muitos extratos do Nubank usam "NOME - CNPJ - BANCO"
    clean = clean.split(' - ')[0]; // Pega o que vem antes do primeiro traço
    clean = clean.split(' •')[0];  // Pega o que vem antes da bolinha de máscara de CPF
    clean = clean.split(/[0-9]{2}\.[0-9]{3}\.[0-9]{3}/)[0]; // Tira se começar CNPJ no meio

    return clean.replace(/"/g, '').trim() || raw;
  };

  const getPaymentMethod = (raw: string): PaymentMethod => {
    const r = raw.toLowerCase();
    if (r.includes('pix')) return PaymentMethod.PIX;
    if (r.includes('débito') || r.includes('debito')) return PaymentMethod.DEBIT_CARD;
    if (r.includes('crédito') || r.includes('credito')) return PaymentMethod.CREDIT_CARD;
    if (r.includes('rdb') || r.includes('resgate')) return PaymentMethod.OTHER;
    return PaymentMethod.CREDIT_CARD; // Default para extrato de cartão se não identificado
  };

  const getCategory = (description: string, amount: number): Category => {
    const d = description.toLowerCase();
    
    // 1. Alimentação
    if (d.match(/(ifood|uber eats|rappi|z. delivery|restaurante|burger|mcdonald|subway|pizza|sushi|pao de acucar|pao.de.acucar|carrefour|extra|assai|atacad|mercado|supermercado|padaria|coffee|cafe|starbucks|outback|madeiro)/)) {
      return Category.ALIMENTACAO;
    }
    
    // 2. Transporte
    if (d.match(/(uber|99|99 app|taxi|posto|gasolina|ipiranga|shell|petrobras|estacionamento|parking|sem parar|veloe|pedagio|buser|clickbus|passagem)/)) {
      return Category.TRANSPORTE;
    }

    // 3. Saúde
    if (d.match(/(droga|drogasil|farmacia|pague menos|raia|ultrafarma|panvel|hospital|clinica|laboratorio|medico|dentista|exame|consulta|psicolog|terapia)/)) {
      return Category.SAUDE;
    }

    // 4. Habitação
    if (d.match(/(luz|energia|agua|saneamento|condominio|aluguel|internet|vivo|claro|tim|oi|net|sky|netflix|amazon prime|disney|spotify|youtube|apple|google|aws|azure)/)) {
      // Streaming geralmente cai em Lazer ou Habitação (Serviços). Vou colocar Streaming em Lazer.
      if (d.match(/(netflix|amazon prime|disney|spotify|youtube|apple|steam|playstation|xbox|nintendo|game)/)) {
        return Category.LAZER;
      }
      return Category.HABITACAO;
    }

    // 5. Lazer (Genérico)
    if (d.match(/(cinema|movie|teatro|show|ingresso|eventim|ticket|sympla|smart fit|gym|academia)/)) {
      return Category.LAZER;
    }

    return Category.OUTROS;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const rawTransactions = parseCSV(text);

      if (rawTransactions.length === 0) {
        setError("Não foi possível ler as transações. Verifique se o CSV é o extrato oficial do Nubank.");
        setIsProcessing(false);
        return;
      }

      // Importação Instantânea com Categorização Inteligente
      const newTransactions = rawTransactions.map(t => {
        const cleanTitle = cleanDescription(t.description);
        return {
          date: t.date,
          description: cleanTitle,
          amount: Math.abs(t.rawAmount),
          category: getCategory(cleanTitle, t.rawAmount), // Categorização Automática
          type: t.rawAmount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
          paymentMethod: getPaymentMethod(t.description),
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
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-heavy max-w-md w-full p-8 relative animate-in fade-in slide-in-from-bottom-10 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-300 hover:text-stone-900 transition-colors p-2 hover:bg-stone-50 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10 mt-4">
          <div className="mx-auto bg-accent-blue/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Nubank_logo_2021.svg/1280px-Nubank_logo_2021.svg.png" 
              alt="Nubank" 
              className="w-12 h-auto"
            />
          </div>
          <h2 className="text-2xl font-black text-zen-900 tracking-tighter">Importar Nubank</h2>
          <p className="text-sm text-stone-400 mt-3 font-medium leading-relaxed">
            Faça upload do seu extrato CSV. Nossa IA irá categorizar cada gasto para você.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
             {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="border-2 border-dashed border-stone-100 rounded-3xl p-10 text-center hover:bg-stone-50 hover:border-accent-blue transition-all relative group bg-stone-50/50">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-accent-blue w-10 h-10" />
                <span className="text-xs font-black uppercase tracking-widest text-accent-blue">Processando Arquivo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-400 group-hover:text-accent-blue transition-colors">
                    <Upload size={24} />
                </div>
                <span className="text-sm font-black text-stone-600 uppercase tracking-widest">Selecionar CSV (Extrato)</span>
              </div>
            )}
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 text-center px-8">
            Processamento local e instantâneo
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;