// components/APITester.tsx
import React, { useState } from 'react';
import type { APIRequest, Simulation } from '../types';
import { apiSimulator } from '../services/api';
import { formatDate } from '../utils/helpers';

interface APITesterProps {
  simulations: Simulation[];
  onAddRequest: (request: APIRequest) => void;
  requests: APIRequest[];
}

export const APITester: React.FC<APITesterProps> = ({
  simulations,
  onAddRequest,
  requests,
}) => {
  const [endpoint, setEndpoint] = useState('/api/bank/balance');
  const [method, setMethod] = useState('GET');
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  "userId": ""\n}');
  const [showTester, setShowTester] = useState(false);

  const endpoints = {
    bank: [
      {
        value: '/api/bank/balance',
        method: 'GET',
        body: '{\n  "userId": ""\n}',
      },
      {
        value: '/api/bank/transfer',
        method: 'POST',
        body: '{\n  "fromUserId": "",\n  "toUserId": "",\n  "amount": 0\n}',
      },
      {
        value: '/api/bank/deposit',
        method: 'POST',
        body: '{\n  "userId": "",\n  "amount": 0\n}',
      },
      {
        value: '/api/bank/withdraw',
        method: 'POST',
        body: '{\n  "userId": "",\n  "amount": 0\n}',
      },
      {
        value: '/api/bank/transactions',
        method: 'GET',
        body: '{\n  "userId": ""\n}',
      },
    ],
    crypto: [
      {
        value: '/api/crypto/balance',
        method: 'GET',
        body: '{\n  "userId": ""\n}',
      },
      {
        value: '/api/crypto/transfer',
        method: 'POST',
        body: '{\n  "fromUserId": "",\n  "toUserId": "",\n  "amount": 0,\n  "coin": "BTC"\n}',
      },
      {
        value: '/api/crypto/transactions',
        method: 'GET',
        body: '{\n  "userId": ""\n}',
      },
    ],
  };

  const handleSendRequest = async () => {
    try {
      // Update simulations in API simulator
      apiSimulator.setSimulations(simulations);

      const body = JSON.parse(requestBody);
      let response: any;
      let status = 200;

      // Route the request based on endpoint
      if (endpoint === '/api/bank/balance') {
        response = await apiSimulator.getBalance(apiKey, body.userId);
      } else if (endpoint === '/api/bank/transfer') {
        response = await apiSimulator.transfer(
          apiKey,
          body.fromUserId,
          body.toUserId,
          body.amount
        );
      } else if (endpoint === '/api/bank/deposit') {
        response = await apiSimulator.deposit(apiKey, body.userId, body.amount);
      } else if (endpoint === '/api/bank/withdraw') {
        response = await apiSimulator.withdraw(
          apiKey,
          body.userId,
          body.amount
        );
      } else if (endpoint === '/api/bank/transactions') {
        response = await apiSimulator.getTransactionHistory(
          apiKey,
          body.userId
        );
      } else if (endpoint === '/api/crypto/balance') {
        response = await apiSimulator.getCryptoBalance(apiKey, body.userId);
      } else if (endpoint === '/api/crypto/transfer') {
        response = await apiSimulator.cryptoTransfer(
          apiKey,
          body.fromUserId,
          body.toUserId,
          body.amount,
          body.coin
        );
      } else if (endpoint === '/api/crypto/transactions') {
        response = await apiSimulator.getTransactionHistory(
          apiKey,
          body.userId
        );
      }

      if (!response.success) {
        status = 400;
      }

      const newRequest: APIRequest = {
        id: Math.random().toString(36).substr(2, 9),
        endpoint,
        method,
        body: JSON.parse(requestBody),
        response,
        timestamp: new Date(),
        status,
      };

      onAddRequest(newRequest);
    } catch (error: any) {
      const errorRequest: APIRequest = {
        id: Math.random().toString(36).substr(2, 9),
        endpoint,
        method,
        body: requestBody,
        response: {
          success: false,
          error: error.message,
          timestamp: new Date(),
        },
        timestamp: new Date(),
        status: 500,
      };
      onAddRequest(errorRequest);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowTester(!showTester)}
        className="bg-primary-700 hover:bg-primary-600 fixed right-8 bottom-8 z-40 flex items-center gap-2 rounded-full p-4 text-white shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition-all"
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
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {showTester ? 'Hide' : 'API'} Tester
      </button>

      {/* API Tester Panel */}
      {showTester && (
        <div className="fixed right-8 bottom-24 z-40 flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-900 p-4">
            <h3 className="text-lg font-bold text-neutral-100">
              API Request Tester
            </h3>
            <button
              onClick={() => setShowTester(false)}
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

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* API Key */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                API Key
              </label>
              <select
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 font-mono text-sm text-neutral-100 focus:outline-none"
              >
                <option value="">Select API Key</option>
                {simulations.map((sim) => (
                  <option key={sim.id} value={sim.apiKey}>
                    {sim.name} ({sim.provider})
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Endpoint
                </label>
                <select
                  value={endpoint}
                  onChange={(e) => {
                    const selected = [
                      ...endpoints.bank,
                      ...endpoints.crypto,
                    ].find((ep) => ep.value === e.target.value);
                    if (selected) {
                      setEndpoint(selected.value);
                      setMethod(selected.method);
                      setRequestBody(selected.body);
                    }
                  }}
                  className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-sm text-neutral-100 focus:outline-none"
                >
                  <optgroup label="Bank API">
                    {endpoints.bank.map((ep) => (
                      <option key={ep.value} value={ep.value}>
                        {ep.value}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Crypto API">
                    {endpoints.crypto.map((ep) => (
                      <option key={ep.value} value={ep.value}>
                        {ep.value}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Request Body */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={8}
                className="bg-code-bg text-code-text focus:border-primary-600 w-full rounded-lg border border-neutral-600 px-4 py-2 font-mono text-sm focus:outline-none"
                placeholder='{"userId": "abc123"}'
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendRequest}
              className="bg-primary-700 hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-all"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Send Request
            </button>

            {/* Recent Requests */}
            {requests.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-bold text-neutral-300">
                  Recent Requests
                </h4>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {requests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-neutral-600 bg-neutral-700 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              req.method === 'GET'
                                ? 'bg-accent-info text-white'
                                : 'bg-accent-success text-white'
                            }`}
                          >
                            {req.method}
                          </span>
                          <span className="font-mono text-sm text-neutral-300">
                            {req.endpoint}
                          </span>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-bold ${
                            req.status === 200
                              ? 'bg-accent-success text-white'
                              : 'bg-accent-error text-white'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="bg-code-bg mb-2 rounded p-2">
                        <pre className="text-code-text overflow-x-auto text-xs">
                          {JSON.stringify(req.response, null, 2)}
                        </pre>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {formatDate(req.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
