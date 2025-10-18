// components/APIDocumentation.tsx
import React, { useState } from 'react';

export const APIDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bank' | 'crypto'>('bank');

  const bankEndpoints = [
    {
      name: 'Get Balance',
      method: 'GET',
      endpoint: '/api/bank/balance',
      description: 'Retrieve account balance for a specific user',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: { userId: 'string' },
      },
      response: {
        success: true,
        data: {
          userId: 'abc123',
          accountNumber: '1234567890123456',
          balance: 1000.5,
          currency: 'USD',
        },
      },
    },
    {
      name: 'Transfer Funds',
      method: 'POST',
      endpoint: '/api/bank/transfer',
      description: 'Transfer money between two users',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: {
          fromUserId: 'string',
          toUserId: 'string',
          amount: 'number',
        },
      },
      response: {
        success: true,
        data: {
          transactionId: 'tx123',
          from: '1234567890123456',
          to: '9876543210987654',
          amount: 100,
          currency: 'USD',
          status: 'success',
        },
      },
    },
    {
      name: 'Deposit',
      method: 'POST',
      endpoint: '/api/bank/deposit',
      description: 'Deposit money to a user account',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: {
          userId: 'string',
          amount: 'number',
        },
      },
      response: {
        success: true,
        data: {
          transactionId: 'tx124',
          newBalance: 1100.5,
          currency: 'USD',
        },
      },
    },
    {
      name: 'Withdraw',
      method: 'POST',
      endpoint: '/api/bank/withdraw',
      description: 'Withdraw money from a user account',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: {
          userId: 'string',
          amount: 'number',
        },
      },
      response: {
        success: true,
        data: {
          transactionId: 'tx125',
          newBalance: 900.5,
          currency: 'USD',
        },
      },
    },
    {
      name: 'Transaction History',
      method: 'GET',
      endpoint: '/api/bank/transactions',
      description: 'Get transaction history for a user',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: { userId: 'string' },
      },
      response: {
        success: true,
        data: {
          transactions: [
            {
              id: 'tx123',
              type: 'transfer',
              amount: 100,
              currency: 'USD',
              timestamp: '2025-10-18T10:30:00Z',
              status: 'success',
            },
          ],
        },
      },
    },
  ];

  const cryptoEndpoints = [
    {
      name: 'Get Crypto Balance',
      method: 'GET',
      endpoint: '/api/crypto/balance',
      description: 'Retrieve cryptocurrency balances for a user',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: { userId: 'string' },
      },
      response: {
        success: true,
        data: {
          userId: 'abc123',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          balances: {
            BTC: 0.5,
            ETH: 2.5,
            USDT: 1000,
          },
        },
      },
    },
    {
      name: 'Transfer Crypto',
      method: 'POST',
      endpoint: '/api/crypto/transfer',
      description: 'Transfer cryptocurrency between users',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: {
          fromUserId: 'string',
          toUserId: 'string',
          amount: 'number',
          coin: 'BTC | ETH | USDT',
        },
      },
      response: {
        success: true,
        data: {
          transactionId: 'tx456',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          amount: 0.1,
          coin: 'BTC',
          status: 'success',
        },
      },
    },
    {
      name: 'Transaction History',
      method: 'GET',
      endpoint: '/api/crypto/transactions',
      description: 'Get cryptocurrency transaction history',
      request: {
        headers: { Authorization: 'Bearer YOUR_API_KEY' },
        body: { userId: 'string' },
      },
      response: {
        success: true,
        data: {
          transactions: [
            {
              id: 'tx456',
              type: 'transfer',
              amount: 0.1,
              currency: 'BTC',
              timestamp: '2025-10-18T10:30:00Z',
              status: 'success',
            },
          ],
        },
      },
    },
  ];

  const endpoints = activeTab === 'bank' ? bankEndpoints : cryptoEndpoints;

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <h2 className="mb-6 text-2xl font-bold text-neutral-100">
        API Documentation
      </h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-neutral-700">
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'bank'
              ? 'text-primary-500 border-primary-500 border-b-2'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Bank API
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'crypto'
              ? 'text-accent-crypto border-accent-crypto border-b-2'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Crypto API
        </button>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints.map((endpoint, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-neutral-600 bg-neutral-700 p-5"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-lg font-bold text-neutral-100">
                  {endpoint.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  {endpoint.description}
                </p>
              </div>
              <span
                className={`rounded px-3 py-1 text-xs font-bold ${
                  endpoint.method === 'GET'
                    ? 'bg-accent-info text-white'
                    : 'bg-accent-success text-white'
                }`}
              >
                {endpoint.method}
              </span>
            </div>

            <div className="mb-4">
              <code className="text-primary-500 bg-code-bg block rounded px-3 py-2 font-mono text-sm">
                {endpoint.endpoint}
              </code>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Request */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Request
                </h4>
                <div className="bg-code-bg overflow-x-auto rounded p-3">
                  <pre className="text-code-text font-mono text-xs">
                    {JSON.stringify(endpoint.request, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Response */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Response
                </h4>
                <div className="bg-code-bg overflow-x-auto rounded p-3">
                  <pre className="text-code-text font-mono text-xs">
                    {JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Code Examples */}
      <div className="mt-8 border-t border-neutral-700 pt-8">
        <h3 className="mb-4 text-xl font-bold text-neutral-100">
          Code Examples
        </h3>

        <div className="space-y-4">
          {/* JavaScript/Node.js */}
          <div>
            <h4 className="mb-2 font-medium text-neutral-300">
              JavaScript (Node.js)
            </h4>
            <div className="bg-code-bg overflow-x-auto rounded-lg p-4">
              <pre className="text-code-text font-mono text-sm">
                {`const axios = require('axios');


const apiKey = 'YOUR_API_KEY';
const baseURL = 'http://localhost:3000';


async function getBalance(userId) {
  try {
    const response = await axios.get(\`\${baseURL}/api/bank/balance\`, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      },
      data: { userId }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
}`}
              </pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h4 className="mb-2 font-medium text-neutral-300">Python</h4>
            <div className="bg-code-bg overflow-x-auto rounded-lg p-4">
              <pre className="text-code-text font-mono text-sm">
                {`import requests


api_key = 'YOUR_API_KEY'
base_url = 'http://localhost:3000'


def get_balance(user_id):
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    data = {'userId': user_id}
   
    response = requests.get(
        f'{base_url}/api/bank/balance',
        headers=headers,
        json=data
    )
    print(response.json())`}
              </pre>
            </div>
          </div>

          {/* cURL */}
          <div>
            <h4 className="mb-2 font-medium text-neutral-300">cURL</h4>
            <div className="bg-code-bg overflow-x-auto rounded-lg p-4">
              <pre className="text-code-text font-mono text-sm">
                {`curl -X GET http://localhost:3000/api/bank/balance \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "abc123"}'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
