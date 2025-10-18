// store/appStore.ts
import type { Simulation, APIRequest, Environment } from '../types';

export interface AppState {
  isAuthenticated: boolean;
  currentPage: 'login' | 'environment' | 'simulations' | 'detail';
  selectedEnvironment: Environment | null;
  selectedProvider: string;
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  apiRequests: APIRequest[];
}

export const initialState: AppState = {
  isAuthenticated: false,
  currentPage: 'login',
  selectedEnvironment: null,
  selectedProvider: '',
  simulations: [],
  currentSimulation: null,
  apiRequests: [],
};

// Store actions
export type AppAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; page: AppState['currentPage'] }
  | { type: 'SET_ENVIRONMENT'; environment: Environment; provider: string }
  | { type: 'ADD_SIMULATION'; simulation: Simulation }
  | { type: 'UPDATE_SIMULATION'; simulation: Simulation }
  | { type: 'SELECT_SIMULATION'; simulation: Simulation }
  | { type: 'DELETE_SIMULATION'; id: string }
  | { type: 'ADD_API_REQUEST'; request: APIRequest };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, currentPage: 'environment' };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    case 'SET_ENVIRONMENT':
      return {
        ...state,
        selectedEnvironment: action.environment,
        selectedProvider: action.provider,
        currentPage: 'simulations',
      };
    case 'ADD_SIMULATION':
      return {
        ...state,
        simulations: [...state.simulations, action.simulation],
        currentSimulation: action.simulation,
        currentPage: 'detail',
      };
    case 'UPDATE_SIMULATION':
      return {
        ...state,
        simulations: state.simulations.map((s) =>
          s.id === action.simulation.id ? action.simulation : s
        ),
        currentSimulation: action.simulation,
      };
    case 'SELECT_SIMULATION':
      return {
        ...state,
        currentSimulation: action.simulation,
        currentPage: 'detail',
      };
    case 'DELETE_SIMULATION':
      return {
        ...state,
        simulations: state.simulations.filter((s) => s.id !== action.id),
        currentSimulation: null,
      };
    case 'ADD_API_REQUEST':
      return {
        ...state,
        apiRequests: [action.request, ...state.apiRequests],
      };
    default:
      return state;
  }
};
