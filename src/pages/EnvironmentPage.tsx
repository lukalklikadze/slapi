// pages/EnvironmentPage.tsx
import React, { useState } from 'react';
import type {
  Environment,
  EnvironmentConfig,
  CustomAPIDefinition,
} from '../types';
import TbcSvg from '../assets/TBC.svg';
import HinkalSvg from '../assets/Hinkal.svg';
import { AddCustomAPIModal } from '../components/AddCustomAPIModal';
import { generateFeatures } from '../utils/apiParser';

interface EnvironmentPageProps {
  onSelectEnvironment: (
    type: Environment,
    provider: string,
    isCustom?: boolean,
    customDef?: CustomAPIDefinition
  ) => void;
  onLogout: () => void;
  customAPIs: CustomAPIDefinition[];
  onAddCustomAPI: (definition: CustomAPIDefinition) => void;
  onRemoveCustomAPI: (id: string) => void;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
  onSelectEnvironment,
  onLogout,
  customAPIs,
  onAddCustomAPI,
  onRemoveCustomAPI,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const defaultEnvironments: EnvironmentConfig[] = [
    {
      type: 'bank' as Environment,
      provider: 'TBC Bank',
      icon: TbcSvg,
      description: 'Banking API Simulator',
      features: [
        'Account Management',
        'Transfers',
        'Balance Queries',
        'Transaction History',
      ],
      isCustom: false,
    },
    {
      type: 'crypto' as Environment,
      provider: 'Hinkal',
      icon: HinkalSvg,
      description: 'Crypto API Simulator',
      features: [
        'Wallet Management',
        'Multi-Coin Support',
        'Token Transfers',
        'Balance Tracking',
      ],
      isCustom: false,
    },
  ];

  // Convert custom APIs to environment configs
  const customEnvironments: EnvironmentConfig[] = customAPIs.map((api) => ({
    type: api.type,
    provider: api.name,
    icon: api.type === 'bank' ? '🏦' : '₿',
    description: api.description,
    features: generateFeatures(api.endpoints),
    isCustom: true,
    customDefinition: api,
  }));

  const allEnvironments = [...defaultEnvironments, ...customEnvironments];

  const handleAddCustomAPI = (definition: CustomAPIDefinition) => {
    onAddCustomAPI(definition);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-neutral-100">
              Choose Environment
            </h1>
            <p className="text-neutral-400">
              Select a financial service API to simulate
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-neutral-700 px-6 py-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-300"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allEnvironments.map((env) => (
            <div
              key={env.provider}
              className="group hover:border-primary-600 relative transform cursor-pointer rounded-xl border-2 border-neutral-700 bg-neutral-800/70 p-8 transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
            >
              {/* Delete button for custom APIs */}
              {env.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${env.provider}?`)) {
                      onRemoveCustomAPI(env.customDefinition!.id);
                    }
                  }}
                  className="hover:bg-accent-error absolute top-4 right-4 rounded-lg bg-neutral-700 p-2 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
                  title="Delete custom API"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}

              <div
                onClick={() =>
                  onSelectEnvironment(
                    env.type,
                    env.provider,
                    env.isCustom,
                    env.customDefinition
                  )
                }
              >
                <div
                  className={`mb-6 inline-block rounded-2xl p-6 ${
                    env.isCustom
                      ? 'bg-neutral-700'
                      : 'from-primary-900 to-primary-800 bg-gradient-to-br'
                  }`}
                >
                  {typeof env.icon === 'string' && env.icon.startsWith('/') ? (
                    <img
                      src={env.icon}
                      alt={env.provider}
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <div className="text-6xl">{env.icon}</div>
                  )}
                </div>

                <div className="mb-2 flex items-start justify-between">
                  <h2 className="group-hover:text-primary-500 text-2xl font-bold text-neutral-100 transition-colors">
                    {env.provider}
                  </h2>
                  {env.isCustom && (
                    <span className="bg-accent-info/20 text-accent-info ml-2 rounded px-2 py-1 text-xs font-medium">
                      Custom
                    </span>
                  )}
                </div>

                <p className="mb-6 text-neutral-400">{env.description}</p>

                <div className="space-y-2">
                  {env.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-sm text-neutral-300"
                    >
                      <svg
                        className="text-accent-success mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-neutral-700 pt-6">
                  <button className="text-primary-500 flex items-center font-medium transition-transform group-hover:scale-105">
                    Get Started
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Custom API Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="group hover:border-primary-600 flex transform cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/50 p-8 transition-all hover:-translate-y-1 hover:bg-neutral-800"
          >
            <div className="bg-primary-900/50 group-hover:bg-primary-900 mb-4 rounded-full p-6 transition-all">
              <svg
                className="text-primary-500 h-12 w-12"
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
            </div>
            <h3 className="group-hover:text-primary-500 mb-2 text-xl font-bold text-neutral-100 transition-colors">
              Add Custom API
            </h3>
            <p className="text-center text-sm text-neutral-400">
              Import your own banking or crypto API documentation
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddCustomAPIModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCustomAPI}
        />
      )}
    </div>
  );
};
