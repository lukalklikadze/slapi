// pages/CryptoSimulationPage.tsx
import React, { useState } from 'react';
import type { Simulation, CryptoUser, CryptoType } from '../types';
import { formatDate } from '../utils/helpers';

interface CryptoSimulationPageProps {
  simulation: Simulation;
  onUpdateSimulation: (simulation: Simulation) => void;
  onBack: () => void;
}

export const CryptoSimulationPage: React.FC<CryptoSimulationPageProps> = ({
  simulation,
  onUpdateSimulation,
  onBack,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    btc: 0,
    eth: 0,
    usdt: 0,
  });

  const [transferData, setTransferData] = useState({
    fromUserId: '',
    toUserId: '',
    amount: 0,
    coin: 'BTC' as CryptoType,
  });

  const selectedUser = simulation.users.find(
    (u) => u.id === selectedUserId
  ) as CryptoUser;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: CryptoUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUser.username,
      walletAddress:
        '0x' +
        Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
      balances: {
        BTC: newUser.btc,
        ETH: newUser.eth,
        USDT: newUser.usdt,
      },
      transactions: [],
    };

    onUpdateSimulation({
      ...simulation,
      users: [...simulation.users, user],
    });

    setNewUser({ username: '', btc: 0, eth: 0, usdt: 0 });
    setShowAddUser(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const fromUser = simulation.users.find(
      (u) => u.id === transferData.fromUserId
    ) as CryptoUser;
    const toUser = simulation.users.find(
      (u) => u.id === transferData.toUserId
    ) as CryptoUser;

    if (!fromUser || !toUser) return;
    if ((fromUser.balances[transferData.coin] || 0) < transferData.amount) {
      alert('Insufficient funds');
      return;
    }

    const transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'transfer' as const,
      amount: transferData.amount,
      currency: transferData.coin,
      from: fromUser.walletAddress,
      to: toUser.walletAddress,
      timestamp: new Date(),
      status: 'success' as const,
    };

    fromUser.balances[transferData.coin] -= transferData.amount;
    toUser.balances[transferData.coin] =
      (toUser.balances[transferData.coin] || 0) + transferData.amount;
    fromUser.transactions.push(transaction);
    toUser.transactions.push(transaction);

    onUpdateSimulation({ ...simulation });
    setTransferData({ fromUserId: '', toUserId: '', amount: 0, coin: 'BTC' });
    setShowTransfer(false);
  };

  const handleDeposit = (userId: string, amount: number, coin: CryptoType) => {
    const user = simulation.users.find((u) => u.id === userId) as CryptoUser;
    if (!user) return;

    const transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit' as const,
      amount,
      currency: coin,
      to: user.walletAddress,
      timestamp: new Date(),
      status: 'success' as const,
    };

    user.balances[coin] = (user.balances[coin] || 0) + amount;
    user.transactions.push(transaction);
    onUpdateSimulation({ ...simulation });
  };

  const handleWithdraw = (userId: string, amount: number, coin: CryptoType) => {
    const user = simulation.users.find((u) => u.id === userId) as CryptoUser;
    if (!user || (user.balances[coin] || 0) < amount) {
      alert('Insufficient funds');
      return;
    }

    const transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'withdrawal' as const,
      amount,
      currency: coin,
      from: user.walletAddress,
      timestamp: new Date(),
      status: 'success' as const,
    };

    user.balances[coin] -= amount;
    user.transactions.push(transaction);
    onUpdateSimulation({ ...simulation });
  };

  const coinColors: Record<CryptoType, string> = {
    BTC: 'text-accent-crypto',
    ETH: 'text-accent-info',
    USDT: 'text-accent-success',
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">
                {simulation.name}
              </h1>
              <p className="mt-1 text-neutral-400">{simulation.provider}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAPIKey(!showAPIKey)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 font-medium text-neutral-300 transition-all hover:bg-neutral-700"
            >
              {showAPIKey ? 'Hide' : 'Show'} API Key
            </button>
            <button
              onClick={() => setShowTransfer(true)}
              className="bg-primary-700 hover:bg-primary-600 rounded-lg px-4 py-2 font-medium text-white transition-all"
            >
              Transfer
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-accent-success hover:bg-accent-success/90 flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* API Key Display */}
        {showAPIKey && (
          <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-neutral-400">API Key</p>
                <code className="text-primary-500 font-mono text-sm">
                  {simulation.apiKey}
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(simulation.apiKey);
                  alert('API Key copied!');
                }}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-all hover:bg-neutral-600"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users List */}
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-xl font-bold text-neutral-100">
              Users ({simulation.users.length})
            </h2>
            <div className="space-y-3">
              {simulation.users.map((user) => {
                const cryptoUser = user as CryptoUser;
                const totalValue =
                  (cryptoUser.balances.BTC || 0) * 50000 +
                  (cryptoUser.balances.ETH || 0) * 3000 +
                  (cryptoUser.balances.USDT || 0);

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`cursor-pointer rounded-lg border-2 bg-neutral-800 p-4 transition-all ${
                      selectedUserId === user.id
                        ? 'border-primary-600'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    <h3 className="mb-2 font-bold text-neutral-100">
                      {cryptoUser.username}
                    </h3>
                    <p className="mb-3 font-mono text-xs break-all text-neutral-400">
                      {cryptoUser.walletAddress}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">BTC:</span>
                        <span className={coinColors.BTC}>
                          {cryptoUser.balances.BTC?.toFixed(6) || '0.000000'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">ETH:</span>
                        <span className={coinColors.ETH}>
                          {cryptoUser.balances.ETH?.toFixed(6) || '0.000000'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">USDT:</span>
                        <span className={coinColors.USDT}>
                          {cryptoUser.balances.USDT?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-neutral-700 pt-3">
                      <p className="text-xs text-neutral-500">Est. Value</p>
                      <p className="text-accent-success text-sm font-bold">
                        ${totalValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6">
                <div className="mb-6">
                  <h2 className="mb-1 text-2xl font-bold text-neutral-100">
                    {selectedUser.username}
                  </h2>
                  <p className="font-mono text-sm break-all text-neutral-400">
                    {selectedUser.walletAddress}
                  </p>
                </div>

                {/* Balances */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  {(['BTC', 'ETH', 'USDT'] as CryptoType[]).map((coin) => (
                    <div key={coin} className="rounded-lg bg-neutral-700 p-4">
                      <p className="mb-1 text-sm text-neutral-400">{coin}</p>
                      <p className={`text-2xl font-bold ${coinColors[coin]}`}>
                        {(selectedUser.balances[coin] || 0).toFixed(
                          coin === 'USDT' ? 2 : 6
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {(['BTC', 'ETH', 'USDT'] as CryptoType[]).map((coin) => (
                    <div key={coin} className="space-y-2">
                      <button
                        onClick={() => {
                          const amount = prompt(`Deposit ${coin} amount:`);
                          if (amount)
                            handleDeposit(
                              selectedUser.id,
                              parseFloat(amount),
                              coin
                            );
                        }}
                        className="bg-accent-success hover:bg-accent-success/90 w-full rounded-lg px-3 py-2 text-sm font-medium text-white transition-all"
                      >
                        + {coin}
                      </button>
                      <button
                        onClick={() => {
                          const amount = prompt(`Withdraw ${coin} amount:`);
                          if (amount)
                            handleWithdraw(
                              selectedUser.id,
                              parseFloat(amount),
                              coin
                            );
                        }}
                        className="bg-accent-warning hover:bg-accent-warning/90 w-full rounded-lg px-3 py-2 text-sm font-medium text-white transition-all"
                      >
                        - {coin}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Transactions */}
                <div>
                  <h3 className="mb-4 text-lg font-bold text-neutral-100">
                    Transaction History
                  </h3>
                  {selectedUser.transactions.length === 0 ? (
                    <p className="py-8 text-center text-neutral-500">
                      No transactions yet
                    </p>
                  ) : (
                    <div className="max-h-96 space-y-3 overflow-y-auto">
                      {selectedUser.transactions
                        .sort(
                          (a, b) =>
                            b.timestamp.getTime() - a.timestamp.getTime()
                        )
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="rounded-lg border border-neutral-600 bg-neutral-700 p-4"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <span className="font-medium text-neutral-300 capitalize">
                                {tx.type}
                              </span>
                              <div className="text-right">
                                <span
                                  className={`text-lg font-bold ${
                                    tx.type === 'deposit' ||
                                    (tx.type === 'transfer' &&
                                      tx.to === selectedUser.walletAddress)
                                      ? 'text-accent-success'
                                      : 'text-accent-error'
                                  }`}
                                >
                                  {tx.type === 'deposit' ||
                                  (tx.type === 'transfer' &&
                                    tx.to === selectedUser.walletAddress)
                                    ? '+'
                                    : '-'}
                                  {tx.amount} {tx.currency}
                                </span>
                              </div>
                            </div>
                            {tx.from && (
                              <p className="text-xs break-all text-neutral-400">
                                From: {tx.from}
                              </p>
                            )}
                            {tx.to && (
                              <p className="text-xs break-all text-neutral-400">
                                To: {tx.to}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-neutral-500">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-12 text-center">
                <p className="text-neutral-500">
                  Select a user to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6">
              <h3 className="mb-4 text-xl font-bold text-neutral-100">
                Add New User
              </h3>
              <form onSubmit={handleAddUser}>
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Initial BTC
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newUser.btc}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          btc: parseFloat(e.target.value),
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Initial ETH
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newUser.eth}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          eth: parseFloat(e.target.value),
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Initial USDT
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newUser.usdt}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          usdt: parseFloat(e.target.value),
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 rounded-lg bg-neutral-700 px-4 py-3 font-medium text-neutral-300 transition-all hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-700 hover:bg-primary-600 flex-1 rounded-lg px-4 py-3 font-medium text-white transition-all"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6">
              <h3 className="mb-4 text-xl font-bold text-neutral-100">
                Transfer Crypto
              </h3>
              <form onSubmit={handleTransfer}>
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      From User
                    </label>
                    <select
                      value={transferData.fromUserId}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          fromUserId: e.target.value,
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                      required
                    >
                      <option value="">Select user</option>
                      {simulation.users.map((u) => {
                        const user = u as CryptoUser;
                        return (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      To User
                    </label>
                    <select
                      value={transferData.toUserId}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          toUserId: e.target.value,
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                      required
                    >
                      <option value="">Select user</option>
                      {simulation.users.map((u) => {
                        const user = u as CryptoUser;
                        return (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Coin
                    </label>
                    <select
                      value={transferData.coin}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          coin: e.target.value as CryptoType,
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                      required
                    >
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={transferData.amount}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTransfer(false)}
                    className="flex-1 rounded-lg bg-neutral-700 px-4 py-3 font-medium text-neutral-300 transition-all hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-700 hover:bg-primary-600 flex-1 rounded-lg px-4 py-3 font-medium text-white transition-all"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
