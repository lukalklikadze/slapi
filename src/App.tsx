// App.tsx
import React, { useReducer } from 'react';
import { LoginPage } from './pages/LoginPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { BankSimulationPage } from './pages/BankSimulationPage';
import { CryptoSimulationPage } from './pages/CryptoSimulationPage';
import { APITester } from './components/APITester';
import { FloatingBackground } from './components/FloatingBackground';
import { appReducer, initialState } from './store/appStore';
import type { Simulation, Environment, APIRequest } from './types';
import { generateAPIKey, generateId } from './utils/helpers';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const handleLogin = () => {
    dispatch({ type: 'LOGIN' });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleSelectEnvironment = (
    environment: Environment,
    provider: string
  ) => {
    dispatch({ type: 'SET_ENVIRONMENT', environment, provider });
  };

  const handleCreateSimulation = (name: string) => {
    const newSimulation: Simulation = {
      id: generateId(),
      name,
      type: state.selectedEnvironment!,
      provider: state.selectedProvider,
      apiKey: generateAPIKey(),
      users: [],
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_SIMULATION', simulation: newSimulation });
  };

  const handleSelectSimulation = (simulation: Simulation) => {
    dispatch({ type: 'SELECT_SIMULATION', simulation });
  };

  const handleUpdateSimulation = (simulation: Simulation) => {
    dispatch({ type: 'UPDATE_SIMULATION', simulation });
  };

  const handleDeleteSimulation = (id: string) => {
    dispatch({ type: 'DELETE_SIMULATION', id });
  };

  const handleAddAPIRequest = (request: APIRequest) => {
    dispatch({ type: 'ADD_API_REQUEST', request });
  };

  const handleBack = () => {
    if (state.currentPage === 'detail') {
      dispatch({ type: 'SET_PAGE', page: 'simulations' });
    } else if (state.currentPage === 'simulations') {
      dispatch({ type: 'SET_PAGE', page: 'environment' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <FloatingBackground />

      {state.currentPage === 'login' && <LoginPage onLogin={handleLogin} />}

      {state.currentPage === 'environment' && (
        <EnvironmentPage
          onSelectEnvironment={handleSelectEnvironment}
          onLogout={handleLogout}
        />
      )}

      {state.currentPage === 'simulations' && (
        <SimulationsPage
          simulations={state.simulations}
          selectedEnvironment={state.selectedEnvironment!}
          selectedProvider={state.selectedProvider}
          onCreateSimulation={handleCreateSimulation}
          onSelectSimulation={handleSelectSimulation}
          onDeleteSimulation={handleDeleteSimulation}
          onBack={handleBack}
        />
      )}

      {state.currentPage === 'detail' && state.currentSimulation && (
        <>
          {state.currentSimulation.type === 'bank' ? (
            <BankSimulationPage
              simulation={state.currentSimulation}
              onUpdateSimulation={handleUpdateSimulation}
              onBack={handleBack}
            />
          ) : (
            <CryptoSimulationPage
              simulation={state.currentSimulation}
              onUpdateSimulation={handleUpdateSimulation}
              onBack={handleBack}
            />
          )}
        </>
      )}

      {/* API Tester - Available on simulation detail pages */}
      {state.currentPage === 'detail' && (
        <APITester
          simulations={state.simulations}
          onAddRequest={handleAddAPIRequest}
          requests={state.apiRequests}
        />
      )}
    </div>
  );
}

export default App;
