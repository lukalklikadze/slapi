// components/APITester.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { APIRequest, Simulation } from '../types';
import { apiSimulator } from '../services/api';
import { formatDate } from '../utils/helpers';

interface APITesterProps {
  simulations: Simulation[];
  onAddRequest: (request: APIRequest) => void;
  requests: APIRequest[];
}

type EndpointPreset = { value: string; method: 'GET' | 'POST'; body: string };

export const APITester: React.FC<APITesterProps> = ({
  simulations,
  onAddRequest,
  requests,
}) => {
  const [endpoint, setEndpoint] = useState('/api/bank/balance');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  "userId": ""\n}');
  const [showTester, setShowTester] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Static endpoint presets
  const endpoints = useMemo(() => {
    const bank: EndpointPreset[] = [
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
    ];
    const crypto: EndpointPreset[] = [
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
    ];
    return { bank, crypto };
  }, []);

  // figure out selected simulation & provider
  const selectedSim = useMemo(
    () => simulations.find((s) => s.apiKey === apiKey),
    [simulations, apiKey]
  );
  const provider = (selectedSim?.provider || '').toLowerCase();

  // compute which presets are visible based on provider
  const visiblePresets = useMemo<EndpointPreset[]>(() => {
    if (provider.includes('tbc')) return endpoints.bank;
    if (provider.includes('hinkal')) return endpoints.crypto;
    return [...endpoints.bank, ...endpoints.crypto];
  }, [provider, endpoints]);

  // current preset (from visible list)
  const currentPreset = useMemo(
    () => visiblePresets.find((e) => e.value === endpoint),
    [visiblePresets, endpoint]
  );

  // if provider changes and current endpoint is hidden, snap to first allowed
  useEffect(() => {
    if (!visiblePresets.find((p) => p.value === endpoint)) {
      const first = visiblePresets[0];
      if (first) {
        setEndpoint(first.value);
        setMethod(first.method);
        setRequestBody(first.body);
        setJsonError(null);
      }
    }
  }, [provider, visiblePresets, endpoint]);

  const parseBody = (src: string) => {
    try {
      const obj = JSON.parse(src);
      setJsonError(null);
      return obj;
    } catch (e: any) {
      setJsonError(e?.message || 'Invalid JSON');
      return null;
    }
  };

  const prettify = () => {
    const obj = parseBody(requestBody);
    if (!obj) return;
    setRequestBody(JSON.stringify(obj, null, 2));
  };

  const fillSample = () => {
    if (currentPreset) {
      setRequestBody(currentPreset.body);
      setMethod(currentPreset.method);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  const handleSendRequest = async () => {
    const body = parseBody(requestBody);
    if (!body) return;

    setIsSending(true);
    const started = performance.now();

    try {
      apiSimulator.setSimulations(simulations);

      let response: any;
      let status = 200;

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

      if (!response?.success) status = 400;

      const latency = Math.max(0, Math.round(performance.now() - started));

      const newRequest: APIRequest = {
        id: Math.random().toString(36).substr(2, 9),
        endpoint,
        method,
        body,
        response: { ...response, _latencyMs: latency },
        timestamp: new Date(),
        status,
      };

      onAddRequest(newRequest);
    } catch (error: any) {
      const latency = Math.max(0, Math.round(performance.now() - started));
      const errorRequest: APIRequest = {
        id: Math.random().toString(36).substr(2, 9),
        endpoint,
        method,
        body: requestBody,
        response: {
          success: false,
          error: error?.message || 'Unknown error',
          _latencyMs: latency,
          timestamp: new Date(),
        },
        timestamp: new Date(),
        status: 500,
      };
      onAddRequest(errorRequest);
    } finally {
      setIsSending(false);
    }
  };

  const clearHistory = () => {
    console.info('Implement clear in parent if needed.');
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
        <div className="fixed right-8 bottom-24 z-40 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between border-b border-neutral-700 bg-neutral-900 p-4">
            <h3 className="text-lg font-bold text-neutral-100">
              API Request Tester
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fillSample}
                className="rounded border border-neutral-600 px-3 py-1 text-sm text-neutral-200 hover:bg-neutral-700"
                title="Fill sample body for this endpoint"
              >
                Fill sample
              </button>
              <button
                onClick={() => setShowTester(false)}
                className="text-neutral-400 hover:text-neutral-300"
                title="Close"
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
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* API Key */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                API Key
              </label>
              <select
                value={apiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setApiKey(val);

                  // eagerly set first endpoint matching the provider for UX
                  const sim = simulations.find((s) => s.apiKey === val);
                  const prov = (sim?.provider || '').toLowerCase();
                  const list = prov.includes('tbc')
                    ? endpoints.bank
                    : prov.includes('hinkal')
                      ? endpoints.crypto
                      : [...endpoints.bank, ...endpoints.crypto];

                  if (list.length) {
                    setEndpoint(list[0].value);
                    setMethod(list[0].method);
                    setRequestBody(list[0].body);
                    setJsonError(null);
                  }
                }}
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
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
                  className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Endpoint
                </label>
                <select
                  value={endpoint}
                  onChange={(e) => {
                    const selected = visiblePresets.find(
                      (ep) => ep.value === e.target.value
                    );
                    if (selected) {
                      setEndpoint(selected.value);
                      setMethod(selected.method);
                      setRequestBody(selected.body);
                      setJsonError(null);
                    }
                  }}
                  className="focus:border-primary-600 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-sm text-neutral-100 focus:outline-none"
                >
                  {/* Render only the groups allowed by provider */}
                  {(!provider ||
                    (!provider.includes('tbc') &&
                      !provider.includes('hinkal')) ||
                    provider.includes('tbc')) && (
                    <optgroup label="Bank API">
                      {endpoints.bank.map((ep) => (
                        <option key={ep.value} value={ep.value}>
                          {ep.value}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {(!provider ||
                    (!provider.includes('tbc') &&
                      !provider.includes('hinkal')) ||
                    provider.includes('hinkal')) && (
                    <optgroup label="Crypto API">
                      {endpoints.crypto.map((ep) => (
                        <option key={ep.value} value={ep.value}>
                          {ep.value}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* Request Body */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-300">
                  Request Body (JSON)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prettify}
                    className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                  >
                    Prettify
                  </button>
                  <button
                    onClick={() => copy(requestBody)}
                    className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={10}
                className={`bg-code-bg text-code-text w-full rounded-lg border px-4 py-2 font-mono text-sm focus:outline-none ${
                  jsonError
                    ? 'border-accent-error focus:border-accent-error'
                    : 'focus:border-primary-600 border-neutral-600'
                }`}
                placeholder='{"userId": "abc123"}'
              />
              {jsonError && (
                <p className="text-accent-error mt-1 text-xs">
                  JSON error: {jsonError}
                </p>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendRequest}
              disabled={isSending || !!jsonError}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-all ${
                isSending || jsonError
                  ? 'cursor-not-allowed bg-neutral-700'
                  : 'bg-primary-700 hover:bg-primary-600'
              }`}
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
              {isSending ? 'Sending…' : 'Send Request'}
            </button>

            {/* Recent Requests */}
            {requests.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-300">
                    Recent Requests
                  </h4>
                  <button
                    onClick={clearHistory}
                    className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                    title="Implement real clear in parent"
                  >
                    Clear (parent)
                  </button>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {requests.slice(0, 6).map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-neutral-600 bg-neutral-700 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              req.method === 'GET'
                                ? 'bg-accent-info text-white'
                                : 'bg-accent-success text-white'
                            }`}
                          >
                            {req.method}
                          </span>
                          <span className="font-mono text-xs text-neutral-300">
                            {req.endpoint}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              req.status === 200
                                ? 'bg-accent-success text-white'
                                : 'bg-accent-error text-white'
                            }`}
                          >
                            {req.status}
                          </span>
                          {typeof (req.response as any)?._latencyMs ===
                            'number' && (
                            <span className="rounded bg-neutral-600 px-2 py-1 text-xs text-neutral-200">
                              {(req.response as any)._latencyMs} ms
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-code-bg mb-2 rounded p-2">
                        <div className="mb-1 flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              copy(JSON.stringify(req.response, null, 2))
                            }
                            className="rounded border border-neutral-600 px-2 py-0.5 text-[11px] text-neutral-200 hover:bg-neutral-700"
                          >
                            Copy JSON
                          </button>
                        </div>
                        <pre className="text-code-text overflow-x-auto text-xs whitespace-pre">
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
