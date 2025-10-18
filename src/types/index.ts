export type Environment = 'bank' | 'crypto';
export type Currency = 'USD' | 'EUR' | 'GEL';
export type CryptoType = 'BTC' | 'ETH' | 'USDT';

export interface BankUser {
  id: string;
  username: string;
  accountNumber: string;
  balance: number;
  currency: Currency;
  transactions: Transaction[];
}

export interface CryptoUser {
  id: string;
  username: string;
  walletAddress: string;
  balances: { [key in CryptoType]: number };
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: Currency | CryptoType;
  from?: string;
  to?: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

export interface Simulation {
  id: string;
  name: string;
  type: Environment;
  provider: string;
  apiKey: string;
  users: (BankUser | CryptoUser)[];
  createdAt: Date;
}

export interface APIRequest {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  response: any;
  timestamp: Date;
  status: number;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}
