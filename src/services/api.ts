// services/api.ts
import type {
  Simulation,
  BankUser,
  CryptoUser,
  Transaction,
  APIResponse,
} from '../types';
import { generateId } from '../utils/helpers';

export class APISimulator {
  private simulations: Map<string, Simulation> = new Map();

  setSimulations(sims: Simulation[]) {
    this.simulations.clear();
    sims.forEach((sim) => this.simulations.set(sim.apiKey, sim));
  }

  // Validate API Key
  private validateApiKey(apiKey: string): Simulation | null {
    return this.simulations.get(apiKey) || null;
  }

  // Bank API Methods
  async getBalance(apiKey: string, userId: string): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'bank') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const user = sim.users.find((u) => u.id === userId) as BankUser;
    if (!user) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        accountNumber: user.accountNumber,
        balance: user.balance,
        currency: user.currency,
      },
      timestamp: new Date(),
    };
  }

  async transfer(
    apiKey: string,
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'bank') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const fromUser = sim.users.find((u) => u.id === fromUserId) as BankUser;
    const toUser = sim.users.find((u) => u.id === toUserId) as BankUser;

    if (!fromUser || !toUser) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    if (fromUser.balance < amount) {
      return {
        success: false,
        error: 'Insufficient funds',
        timestamp: new Date(),
      };
    }

    if (fromUser.currency !== toUser.currency) {
      return {
        success: false,
        error: 'Currency mismatch',
        timestamp: new Date(),
      };
    }

    const transaction: Transaction = {
      id: generateId(),
      type: 'transfer',
      amount,
      currency: fromUser.currency,
      from: fromUser.accountNumber,
      to: toUser.accountNumber,
      timestamp: new Date(),
      status: 'success',
    };

    fromUser.balance -= amount;
    toUser.balance += amount;
    fromUser.transactions.push(transaction);
    toUser.transactions.push(transaction);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        from: fromUser.accountNumber,
        to: toUser.accountNumber,
        amount,
        currency: fromUser.currency,
        status: 'success',
      },
      timestamp: new Date(),
    };
  }

  async deposit(
    apiKey: string,
    userId: string,
    amount: number
  ): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'bank') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const user = sim.users.find((u) => u.id === userId) as BankUser;
    if (!user) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    const transaction: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount,
      currency: user.currency,
      to: user.accountNumber,
      timestamp: new Date(),
      status: 'success',
    };

    user.balance += amount;
    user.transactions.push(transaction);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        newBalance: user.balance,
        currency: user.currency,
      },
      timestamp: new Date(),
    };
  }

  async withdraw(
    apiKey: string,
    userId: string,
    amount: number
  ): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'bank') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const user = sim.users.find((u) => u.id === userId) as BankUser;
    if (!user) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    if (user.balance < amount) {
      return {
        success: false,
        error: 'Insufficient funds',
        timestamp: new Date(),
      };
    }

    const transaction: Transaction = {
      id: generateId(),
      type: 'withdrawal',
      amount,
      currency: user.currency,
      from: user.accountNumber,
      timestamp: new Date(),
      status: 'success',
    };

    user.balance -= amount;
    user.transactions.push(transaction);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        newBalance: user.balance,
        currency: user.currency,
      },
      timestamp: new Date(),
    };
  }

  async getTransactionHistory(
    apiKey: string,
    userId: string
  ): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim) {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const user = sim.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    return {
      success: true,
      data: { transactions: user.transactions },
      timestamp: new Date(),
    };
  }

  // Crypto API Methods
  async getCryptoBalance(apiKey: string, userId: string): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'crypto') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const user = sim.users.find((u) => u.id === userId) as CryptoUser;
    if (!user) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        walletAddress: user.walletAddress,
        balances: user.balances,
      },
      timestamp: new Date(),
    };
  }

  async cryptoTransfer(
    apiKey: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    coin: string
  ): Promise<APIResponse> {
    const sim = this.validateApiKey(apiKey);
    if (!sim || sim.type !== 'crypto') {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const fromUser = sim.users.find((u) => u.id === fromUserId) as CryptoUser;
    const toUser = sim.users.find((u) => u.id === toUserId) as CryptoUser;

    if (!fromUser || !toUser) {
      return { success: false, error: 'User not found', timestamp: new Date() };
    }

    if (
      (fromUser.balances[coin as keyof typeof fromUser.balances] || 0) < amount
    ) {
      return {
        success: false,
        error: 'Insufficient funds',
        timestamp: new Date(),
      };
    }

    const transaction: Transaction = {
      id: generateId(),
      type: 'transfer',
      amount,
      currency: coin as any,
      from: fromUser.walletAddress,
      to: toUser.walletAddress,
      timestamp: new Date(),
      status: 'success',
    };

    fromUser.balances[coin as keyof typeof fromUser.balances] -= amount;
    toUser.balances[coin as keyof typeof toUser.balances] =
      (toUser.balances[coin as keyof typeof toUser.balances] || 0) + amount;

    fromUser.transactions.push(transaction);
    toUser.transactions.push(transaction);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        from: fromUser.walletAddress,
        to: toUser.walletAddress,
        amount,
        coin,
        status: 'success',
      },
      timestamp: new Date(),
    };
  }
}

export const apiSimulator = new APISimulator();
