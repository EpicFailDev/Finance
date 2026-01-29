export enum Category {
  HABITACAO = 'Habitação',
  ALIMENTACAO = 'Alimentação',
  TRANSPORTE = 'Transporte',
  SAUDE = 'Saúde',
  LAZER = 'Lazer',
  OUTROS = 'Outros',
}

export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída',
  INVESTMENT = 'Investimento',
}

export enum PaymentMethod {
  PIX = 'Pix',
  CASH = 'Dinheiro',
  MEAL_VOUCHER = 'Vale-Refeição',
  CREDIT_CARD = 'Cartão de Crédito', // Added for Nubank import compatibility
  DEBIT_CARD = 'Cartão de Débito',
  OTHER = 'Outro'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: Category;
  type: TransactionType;
  paymentMethod: PaymentMethod;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  currentAmount: number;
  month: string;
}
