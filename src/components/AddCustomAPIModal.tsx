// components/AddCustomAPIModal.tsx
import React, { useState } from 'react';
import type { Environment, CustomAPIDefinition } from '../types';
import {
  parseAPIDocumentation,
  createCustomAPIDefinition,
} from '../utils/apiParser';

interface AddCustomAPIModalProps {
  onClose: () => void;
  onAdd: (definition: CustomAPIDefinition) => void;
}

export const AddCustomAPIModal: React.FC<AddCustomAPIModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [step, setStep] = useState<'type' | 'input'>('type');
  const [apiType, setApiType] = useState<Environment>('bank');
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [docText, setDocText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocText(text);
    };
    reader.readAsText(file);
  };

  const loadSampleDoc = () => {
    const sampleDoc = {
      name: 'Other Bank',
      type: apiType,
      description: 'Custom Banking API Simulator',
      endpoints:
        apiType === 'bank'
          ? [
              {
                name: 'Get Balance',
                path: '/api/other-bank/balance',
                method: 'GET',
                description: 'Retrieve account balance',
                requestBody: {
                  userId: 'string',
                },
                responseBody: {
                  userId: 'string',
                  accountNumber: 'string',
                  balance: 'number',
                  currency: 'string',
                },
              },
              {
                name: 'Transfer Funds',
                path: '/api/other-bank/transfer',
                method: 'POST',
                description: 'Transfer money between accounts',
                requestBody: {
                  fromUserId: 'string',
                  toUserId: 'string',
                  amount: 'number',
                },
                responseBody: {
                  transactionId: 'string',
                  status: 'string',
                },
              },
              {
                name: 'Deposit',
                path: '/api/other-bank/deposit',
                method: 'POST',
                description: 'Deposit money to account',
                requestBody: {
                  userId: 'string',
                  amount: 'number',
                },
              },
              {
                name: 'Withdraw',
                path: '/api/other-bank/withdraw',
                method: 'POST',
                description: 'Withdraw money from account',
                requestBody: {
                  userId: 'string',
                  amount: 'number',
                },
              },
              {
                name: 'Transaction History',
                path: '/api/other-bank/transactions',
                method: 'GET',
                description: 'Get transaction history',
                requestBody: {
                  userId: 'string',
                },
              },
            ]
          : [
              {
                name: 'Get Balance',
                path: '/api/other-crypto/balance',
                method: 'GET',
                description: 'Get crypto balances',
                requestBody: {
                  userId: 'string',
                },
              },
              {
                name: 'Transfer',
                path: '/api/other-crypto/transfer',
                method: 'POST',
                description: 'Transfer cryptocurrency',
                requestBody: {
                  fromUserId: 'string',
                  toUserId: 'string',
                  amount: 'number',
                  coin: 'string',
                },
              },
            ],
      userSchema: {
        idField: 'userId',
        balanceFields:
          apiType === 'bank' ? ['balance'] : ['BTC', 'ETH', 'USDT'],
        identifierField: apiType === 'bank' ? 'accountNumber' : 'walletAddress',
      },
    };

    setDocText(JSON.stringify(sampleDoc, null, 2));
  };

  const handleSubmit = () => {
    try {
      setError(null);
      const parsed = parseAPIDocumentation(docText);

      // Override type with selected type
      parsed.type = apiType;

      const definition = createCustomAPIDefinition(parsed);
      onAdd(definition);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-100">
            Add Custom API
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-300"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {step === 'type' ? (
          <div>
            <p className="mb-6 text-neutral-400">
              Select the type of API you want to add
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => {
                  setApiType('bank');
                  setStep('input');
                }}
                className="group hover:border-primary-600 rounded-xl border-2 border-neutral-700 bg-neutral-900 p-6 text-left transition-all"
              >
                <div className="mb-4 text-4xl">🏦</div>
                <h3 className="group-hover:text-primary-500 mb-2 text-xl font-bold text-neutral-100">
                  Banking API
                </h3>
                <p className="text-sm text-neutral-400">
                  Add a custom banking API with accounts and transactions
                </p>
              </button>

              <button
                onClick={() => {
                  setApiType('crypto');
                  setStep('input');
                }}
                className="group hover:border-accent-crypto rounded-xl border-2 border-neutral-700 bg-neutral-900 p-6 text-left transition-all"
              >
                <div className="mb-4 text-4xl">₿</div>
                <h3 className="group-hover:text-accent-crypto mb-2 text-xl font-bold text-neutral-100">
                  Crypto API
                </h3>
                <p className="text-sm text-neutral-400">
                  Add a custom crypto API with wallets and tokens
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setStep('type')}
              className="mb-4 flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300"
            >
              <svg
                className="h-4 w-4"
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
              Back to type selection
            </button>

            <div className="border-primary-600 bg-primary-900/20 mb-4 rounded-lg border p-4">
              <p className="text-primary-500 text-sm">
                Selected type:{' '}
                <strong>{apiType === 'bank' ? 'Banking' : 'Crypto'} API</strong>
              </p>
            </div>

            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setInputMethod('text')}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-all ${
                  inputMethod === 'text'
                    ? 'bg-primary-700 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                Paste JSON
              </button>
              <button
                onClick={() => setInputMethod('file')}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-all ${
                  inputMethod === 'file'
                    ? 'bg-primary-700 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={loadSampleDoc}
                className="border-accent-info bg-accent-info/10 text-accent-info hover:bg-accent-info/20 rounded-lg border px-4 py-2 font-medium transition-all"
              >
                Load Sample
              </button>
            </div>

            {inputMethod === 'text' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  API Documentation (JSON)
                </label>
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  rows={16}
                  className="bg-code-bg text-code-text focus:border-primary-600 w-full rounded-lg border border-neutral-600 px-4 py-3 font-mono text-sm focus:outline-none"
                  placeholder='{"name": "My API", "type": "bank", "endpoints": [...]}'
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Upload Documentation File
                </label>
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none"
                />
                {docText && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-neutral-400">Preview:</p>
                    <pre className="bg-code-bg text-code-text max-h-64 overflow-auto rounded-lg p-4 text-xs">
                      {docText}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="border-accent-error bg-accent-error/10 mt-4 rounded-lg border p-4">
                <p className="text-accent-error text-sm">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-neutral-700 px-4 py-3 font-medium text-neutral-300 transition-all hover:bg-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!docText}
                className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
                  docText
                    ? 'bg-primary-700 hover:bg-primary-600 text-white'
                    : 'cursor-not-allowed bg-neutral-700 text-neutral-500'
                }`}
              >
                Add API
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
