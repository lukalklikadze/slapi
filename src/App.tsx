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
import type {
  Simulation,
  Environment,
  APIRequest,
  CustomAPIDefinition,
} from './types';
import { generateAPIKey, generateId } from './utils/helpers';
import { customAPISimulator } from './services/customApiSimulator';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [customAPIs, setCustomAPIs] = React.useState<CustomAPIDefinition[]>([]);

  const handleLogin = () => {
    dispatch({ type: 'LOGIN' });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleSelectEnvironment = (
    environment: Environment,
    provider: string,
    isCustom?: boolean,
    customDef?: CustomAPIDefinition
  ) => {
    dispatch({ type: 'SET_ENVIRONMENT', environment, provider });

    // Store custom definition if provided
    if (isCustom && customDef) {
      dispatch({ type: 'SET_CUSTOM_DEFINITION', customDefinition: customDef });
    }
  };

  const handleAddCustomAPI = (definition: CustomAPIDefinition) => {
    setCustomAPIs([...customAPIs, definition]);
    customAPISimulator.registerCustomAPI(definition);
  };

  const handleRemoveCustomAPI = (id: string) => {
    setCustomAPIs(customAPIs.filter((api) => api.id !== id));
    // Also remove any simulations using this API
    const apiToRemove = customAPIs.find((api) => api.id === id);
    if (apiToRemove) {
      const updatedSims = state.simulations.filter(
        (sim) => sim.provider !== apiToRemove.name
      );
      dispatch({ type: 'SET_SIMULATIONS', simulations: updatedSims });
    }
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
    <div className="relative min-h-screen overflow-hidden bg-neutral-900">
      {/* Floating Background - Always visible */}
      <FloatingBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {state.currentPage === 'login' && <LoginPage onLogin={handleLogin} />}

        {state.currentPage === 'environment' && (
          <EnvironmentPage
            onSelectEnvironment={handleSelectEnvironment}
            onLogout={handleLogout}
            customAPIs={customAPIs}
            onAddCustomAPI={handleAddCustomAPI}
            onRemoveCustomAPI={handleRemoveCustomAPI}
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
    </div>
  );
}

export default App;
