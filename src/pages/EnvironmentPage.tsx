import React from 'react';
import type { Environment } from '../types';
import TbcSvg from '../assets/TBC.svg';
import HinkalSvg from '../assets/Hinkal.svg';

interface EnvironmentPageProps {
  onSelectEnvironment: (type: Environment, provider: string) => void;
  onLogout: () => void;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
  onSelectEnvironment,
  onLogout,
}) => {
  const environments = [
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
      color: 'primary-700',
      bgGradient: 'from-primary-900 to-primary-800',
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
      color: 'accent-crypto',
      bgGradient: 'from-neutral-800 to-neutral-900',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-neutral-900 p-8">
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

        <div className="grid gap-8 md:grid-cols-2">
          {environments.map((env) => (
            <div
              key={env.provider}
              onClick={() => onSelectEnvironment(env.type, env.provider)}
              className="hover:border-primary-600 group transform cursor-pointer rounded-xl border-2 border-neutral-700 bg-neutral-800 p-8 transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
            >
              <div
                className={`bg-gradient-to-br ${env.bgGradient} mb-6 inline-block rounded-2xl p-6`}
              >
                <img
                  src={env.icon}
                  alt={env.provider}
                  className="h-24 w-24 object-contain"
                />
              </div>

              <h2 className="group-hover:text-primary-500 mb-2 text-2xl font-bold text-neutral-100 transition-colors">
                {env.provider}
              </h2>
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
                <button className="text-primary-500 group-hover:text-primary-400 flex items-center font-medium transition-colors">
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
          ))}
        </div>
      </div>
    </div>
  );
};
