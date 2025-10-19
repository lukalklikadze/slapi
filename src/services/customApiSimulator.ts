// services/customApiSimulator.ts
import type {
  CustomAPIDefinition,
  Simulation,
  BankUser,
  CryptoUser,
  Transaction,
  APIResponse,
  APIEndpoint,
} from '../types';
import { generateId } from '../utils/helpers';

export class CustomAPISimulator {
  private customDefinitions: Map<string, CustomAPIDefinition> = new Map();

  registerCustomAPI(definition: CustomAPIDefinition) {
    this.customDefinitions.set(definition.name, definition); // ✅ Stores by name
  }

  getCustomDefinition(providerName: string) {
    console.log('Looking up custom definition for:', providerName);
    return this.customDefinitions.get(providerName); // ✅ Looks up by name
  }

  async executeCustomEndpoint(
    endpoint: APIEndpoint,
    body: any,
    apiKey: string,
    simulations: Simulation[]
  ): Promise<APIResponse> {
    const sim = simulations.find((s) => s.apiKey === apiKey);
    if (!sim) {
      return {
        success: false,
        error: 'Invalid API key',
        timestamp: new Date(),
      };
    }

    const customDef = this.customDefinitions.get(sim.provider);
    if (!customDef) {
      return {
        success: false,
        error: 'Custom API definition not found',
        timestamp: new Date(),
      };
    }

    try {
      const endpointName = endpoint.name.toLowerCase();
      const userSchema = customDef.userSchema;

      // Get Balance
      if (endpointName.includes('balance') || endpointName.includes('get')) {
        const userId = body[userSchema.idField];
        const user = sim.users.find((u) => u.id === userId);

        if (!user) {
          return {
            success: false,
            error: 'User not found',
            timestamp: new Date(),
          };
        }

        const responseData: any = {
          [userSchema.idField]: user.id,
        };

        if (sim.type === 'bank') {
          const bankUser = user as BankUser;
          responseData[userSchema.identifierField] = bankUser.accountNumber;
          responseData.balance = bankUser.balance;
          responseData.currency = bankUser.currency;
        } else {
          const cryptoUser = user as CryptoUser;
          responseData[userSchema.identifierField] = cryptoUser.walletAddress;
          responseData.balances = cryptoUser.balances;
        }

        return {
          success: true,
          data: responseData,
          timestamp: new Date(),
        };
      }

      // Transfer
      if (endpointName.includes('transfer')) {
        const fromUserId = body.fromUserId || body.from;
        const toUserId = body.toUserId || body.to;
        const amount = body.amount;

        const fromUser = sim.users.find((u) => u.id === fromUserId);
        const toUser = sim.users.find((u) => u.id === toUserId);

        if (!fromUser || !toUser) {
          return {
            success: false,
            error: 'User not found',
            timestamp: new Date(),
          };
        }

        if (sim.type === 'bank') {
          const from = fromUser as BankUser;
          const to = toUser as BankUser;

          if (from.balance < amount) {
            return {
              success: false,
              error: 'Insufficient funds',
              timestamp: new Date(),
            };
          }

          if (from.currency !== to.currency) {
            return {
              success: false,
              error: 'Currency mismatch',
              timestamp: new Date(),
            };
          }

          const tx: Transaction = {
            id: generateId(),
            type: 'transfer',
            amount,
            currency: from.currency,
            from: from.accountNumber,
            to: to.accountNumber,
            timestamp: new Date(),
            status: 'success',
          };

          from.balance -= amount;
          to.balance += amount;
          from.transactions.push(tx);
          to.transactions.push(tx);

          return {
            success: true,
            data: {
              transactionId: tx.id,
              from: from.accountNumber,
              to: to.accountNumber,
              amount,
              status: 'success',
            },
            timestamp: new Date(),
          };
        } else {
          const from = fromUser as CryptoUser;
          const to = toUser as CryptoUser;
          const coin = body.coin || body.currency || 'BTC';

          if (
            (from.balances[coin as keyof typeof from.balances] || 0) < amount
          ) {
            return {
              success: false,
              error: 'Insufficient funds',
              timestamp: new Date(),
            };
          }

          const tx: Transaction = {
            id: generateId(),
            type: 'transfer',
            amount,
            currency: coin as any,
            from: from.walletAddress,
            to: to.walletAddress,
            timestamp: new Date(),
            status: 'success',
          };

          from.balances[coin as keyof typeof from.balances] -= amount;
          to.balances[coin as keyof typeof to.balances] =
            (to.balances[coin as keyof typeof to.balances] || 0) + amount;
          from.transactions.push(tx);
          to.transactions.push(tx);

          return {
            success: true,
            data: {
              transactionId: tx.id,
              from: from.walletAddress,
              to: to.walletAddress,
              amount,
              coin,
              status: 'success',
            },
            timestamp: new Date(),
          };
        }
      }

      // Deposit
      if (endpointName.includes('deposit')) {
        const userId = body[userSchema.idField];
        const amount = body.amount;
        const user = sim.users.find((u) => u.id === userId);

        if (!user) {
          return {
            success: false,
            error: 'User not found',
            timestamp: new Date(),
          };
        }

        if (sim.type === 'bank') {
          const bankUser = user as BankUser;
          const tx: Transaction = {
            id: generateId(),
            type: 'deposit',
            amount,
            currency: bankUser.currency,
            to: bankUser.accountNumber,
            timestamp: new Date(),
            status: 'success',
          };

          bankUser.balance += amount;
          bankUser.transactions.push(tx);

          return {
            success: true,
            data: {
              transactionId: tx.id,
              newBalance: bankUser.balance,
            },
            timestamp: new Date(),
          };
        } else {
          const cryptoUser = user as CryptoUser;
          const coin = body.coin || body.currency || 'BTC';

          const tx: Transaction = {
            id: generateId(),
            type: 'deposit',
            amount,
            currency: coin as any,
            to: cryptoUser.walletAddress,
            timestamp: new Date(),
            status: 'success',
          };

          cryptoUser.balances[coin as keyof typeof cryptoUser.balances] =
            (cryptoUser.balances[coin as keyof typeof cryptoUser.balances] ||
              0) + amount;
          cryptoUser.transactions.push(tx);

          return {
            success: true,
            data: {
              transactionId: tx.id,
              newBalance:
                cryptoUser.balances[coin as keyof typeof cryptoUser.balances],
            },
            timestamp: new Date(),
          };
        }
      }

      // Withdraw
      if (endpointName.includes('withdraw')) {
        const userId = body[userSchema.idField];
        const amount = body.amount;
        const user = sim.users.find((u) => u.id === userId);

        if (!user) {
          return {
            success: false,
            error: 'User not found',
            timestamp: new Date(),
          };
        }

        if (sim.type === 'bank') {
          const bankUser = user as BankUser;

          if (bankUser.balance < amount) {
            return {
              success: false,
              error: 'Insufficient funds',
              timestamp: new Date(),
            };
          }

          const tx: Transaction = {
            id: generateId(),
            type: 'withdrawal',
            amount,
            currency: bankUser.currency,
            from: bankUser.accountNumber,
            timestamp: new Date(),
            status: 'success',
          };

          bankUser.balance -= amount;
          bankUser.transactions.push(tx);

          return {
            success: true,
            data: {
              transactionId: tx.id,
              newBalance: bankUser.balance,
            },
            timestamp: new Date(),
          };
        }
      }

      // Transaction History
      if (
        endpointName.includes('transaction') ||
        endpointName.includes('history')
      ) {
        const userId = body[userSchema.idField];
        const user = sim.users.find((u) => u.id === userId);

        if (!user) {
          return {
            success: false,
            error: 'User not found',
            timestamp: new Date(),
          };
        }

        return {
          success: true,
          data: { transactions: user.transactions },
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        error: 'Endpoint not implemented',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}

export const customAPISimulator = new CustomAPISimulator();
