// pages/SimulationsPage.tsx
import React, { useState } from 'react';
import type { Simulation, Environment } from '../types';
import { formatDate } from '../utils/helpers';

interface SimulationsPageProps {
  simulations: Simulation[];
  selectedEnvironment: Environment;
  selectedProvider: string;
  onCreateSimulation: (name: string) => void;
  onSelectSimulation: (simulation: Simulation) => void;
  onDeleteSimulation: (id: string) => void;
  onBack: () => void;
}

export const SimulationsPage: React.FC<SimulationsPageProps> = ({
  simulations,
  selectedEnvironment,
  selectedProvider,
  onCreateSimulation,
  onSelectSimulation,
  onDeleteSimulation,
  onBack,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Simulation | null>(null);

  const filteredSims = simulations.filter(
    (s) => s.type === selectedEnvironment && s.provider === selectedProvider
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSimName.trim()) {
      onCreateSimulation(newSimName.trim());
      setNewSimName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
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
                {selectedProvider} Simulations
              </h1>
              <p className="mt-1 text-neutral-400">
                {filteredSims.length} simulation
                {filteredSims.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Show top-right "New Simulation" only if there are simulations */}
          {filteredSims.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-700 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all"
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
              New Simulation
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredSims.length === 0 ? (
          <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-12 text-center">
            <div className="mb-4 inline-block rounded-full bg-neutral-700 p-6">
              <svg
                className="h-12 w-12 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-neutral-300">
              No simulations yet
            </h3>
            <p className="mb-6 text-neutral-500">
              Create your first simulation to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-700 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-all"
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
              Create Simulation
            </button>
          </div>
        ) : (
          /* Simulations Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSims.map((sim) => (
              <div
                key={sim.id}
                className="hover:border-primary-600 group cursor-pointer rounded-xl border border-neutral-700 bg-neutral-800 p-6 transition-all"
                onClick={() => onSelectSimulation(sim)}
              >
                {/* ICONS ROW */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="bg-primary-900 flex items-center justify-center rounded-lg p-3">
                    <svg
                      className="text-primary-500 h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(sim);
                    }}
                    className="rounded-lg p-2 text-red-500 transition-all hover:bg-neutral-700 hover:text-red-400"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <h3 className="group-hover:text-primary-500 mb-2 text-lg font-bold text-neutral-100 transition-colors">
                  {sim.name}
                </h3>

                <div className="mb-4 space-y-2 text-sm">
                  {/* USERS WITH TOOLTIP */}
                  <div className="group/tooltip relative flex items-center text-neutral-400">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {sim.users.length} user{sim.users.length !== 1 ? 's' : ''}
                    {sim.users.length > 0 && (
                      <div className="absolute bottom-full left-0 mb-2 hidden w-max max-w-[220px] rounded-md bg-neutral-800 px-3 py-2 text-xs text-neutral-300 shadow-lg transition-opacity duration-200 group-hover/tooltip:block">
                        {sim.users
                          .slice(0, 3)
                          .map((u) => ('username' in u ? u.username : u.id))
                          .join(', ')}
                        {sim.users.length > 3 && '...'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-neutral-400">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatDate(sim.createdAt)}
                  </div>
                </div>

                <div className="border-t border-neutral-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">API Key</span>
                    <code className="text-primary-500 rounded bg-neutral-900 px-2 py-1 font-mono text-xs">
                      {sim.apiKey.substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Simulation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6">
              <h3 className="mb-4 text-xl font-bold text-neutral-100">
                Create New Simulation
              </h3>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    Simulation Name
                  </label>
                  <input
                    type="text"
                    value={newSimName}
                    onChange={(e) => setNewSimName(e.target.value)}
                    placeholder="My Test Simulation"
                    className="focus:border-primary-600 focus:ring-primary-600/20 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewSimName('');
                    }}
                    className="flex-1 rounded-lg bg-neutral-700 px-4 py-3 font-medium text-neutral-300 transition-all hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-700 hover:bg-primary-600 flex-1 rounded-lg px-4 py-3 font-medium text-white transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center">
              <h3 className="mb-4 text-lg font-bold text-neutral-100">
                Are you sure you want to delete simulation "{deleteTarget.name}
                "?
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    onDeleteSimulation(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-500"
                >
                  Yes
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-500"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
