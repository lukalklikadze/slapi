import React from 'react';
import logoImage from '../assets/logo.png';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-800 p-8 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block">
            <div className="bg-primary-900 inline-block rounded-2xl p-4">
              <img
                src={logoImage}
                alt="SLAPI Logo"
                className="h-16 w-16 object-cover"
                style={{
                  objectPosition: 'center',
                  transform: 'scale(2.5)',
                }}
              />
            </div>
          </div>
          <h1 className="text-primary-500 mb-2 text-5xl font-bold">SLAPI</h1>
          <p className="text-lg text-neutral-400">
            Banking & Crypto API Simulator
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Safe testing environment for developers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              type="email"
              placeholder="developer@example.com"
              className="focus:border-primary-600 focus:ring-primary-600/20 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="focus:border-primary-600 focus:ring-primary-600/20 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary-700 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-colors hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
