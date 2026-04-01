import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SearchQuery,
  Flight,
  PriceAlert,
  SavedSearch,
  DealOfDay,
  UserPreferences,
  SortOption,
  Airport,
} from '../types';
import { generateId } from '../utils/helpers';

interface AppState {
  searchQuery: SearchQuery;
  searchResults: Flight[];
  isSearching: boolean;
  sortOption: SortOption;
  savedSearches: SavedSearch[];
  priceAlerts: PriceAlert[];
  deals: DealOfDay[];
  favorites: string[];
  recentSearches: SearchQuery[];
  preferences: UserPreferences;
}

type Action =
  | { type: 'SET_SEARCH_QUERY'; payload: Partial<SearchQuery> }
  | { type: 'SET_SEARCH_RESULTS'; payload: Flight[] }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'ADD_SAVED_SEARCH'; payload: SavedSearch }
  | { type: 'REMOVE_SAVED_SEARCH'; payload: string }
  | { type: 'ADD_PRICE_ALERT'; payload: PriceAlert }
  | { type: 'REMOVE_PRICE_ALERT'; payload: string }
  | { type: 'TOGGLE_PRICE_ALERT'; payload: string }
  | { type: 'SET_DEALS'; payload: DealOfDay[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: SearchQuery }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SWAP_AIRPORTS' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialSearchQuery: SearchQuery = {
  origin: null,
  destination: null,
  departureDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  returnDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
  cabinClass: 'business',
  tripType: 'roundtrip',
  passengers: { adults: 1, children: 0, infants: 0 },
  flexibleDates: false,
};

const initialState: AppState = {
  searchQuery: initialSearchQuery,
  searchResults: [],
  isSearching: false,
  sortOption: 'price_asc',
  savedSearches: [],
  priceAlerts: [],
  deals: [],
  favorites: [],
  recentSearches: [],
  preferences: {
    currency: 'USD',
    preferredAirlines: [],
    notifications: true,
    darkMode: false,
  },
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: { ...state.searchQuery, ...action.payload } };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isSearching: false };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'SET_SORT_OPTION':
      return { ...state, sortOption: action.payload };
    case 'ADD_SAVED_SEARCH':
      return { ...state, savedSearches: [action.payload, ...state.savedSearches] };
    case 'REMOVE_SAVED_SEARCH':
      return { ...state, savedSearches: state.savedSearches.filter((s) => s.id !== action.payload) };
    case 'ADD_PRICE_ALERT':
      return { ...state, priceAlerts: [action.payload, ...state.priceAlerts] };
    case 'REMOVE_PRICE_ALERT':
      return { ...state, priceAlerts: state.priceAlerts.filter((a) => a.id !== action.payload) };
    case 'TOGGLE_PRICE_ALERT':
      return {
        ...state,
        priceAlerts: state.priceAlerts.map((a) =>
          a.id === action.payload ? { ...a, isActive: !a.isActive } : a
        ),
      };
    case 'SET_DEALS':
      return { ...state, deals: action.payload };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter((f) => f !== action.payload)
          : [...state.favorites, action.payload],
      };
    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [action.payload, ...state.recentSearches.slice(0, 9)],
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SWAP_AIRPORTS':
      return {
        ...state,
        searchQuery: {
          ...state.searchQuery,
          origin: state.searchQuery.destination,
          destination: state.searchQuery.origin,
        },
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  updateSearch: (query: Partial<SearchQuery>) => void;
  swapAirports: () => void;
  addSavedSearch: () => void;
  removeSavedSearch: (id: string) => void;
  addPriceAlert: (targetPrice: number) => void;
  removePriceAlert: (id: string) => void;
  togglePriceAlert: (id: string) => void;
  toggleFavorite: (flightId: string) => void;
  isFavorite: (flightId: string) => boolean;
  setDeals: (deals: DealOfDay[]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadPersistedState();
  }, []);

  useEffect(() => {
    persistState();
  }, [state.savedSearches, state.priceAlerts, state.favorites, state.preferences]);

  const loadPersistedState = async () => {
    try {
      const data = await AsyncStorage.getItem('appState');
      if (data) {
        const parsed = JSON.parse(data);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (e) {
      // ignore
    }
  };

  const persistState = async () => {
    try {
      await AsyncStorage.setItem(
        'appState',
        JSON.stringify({
          savedSearches: state.savedSearches,
          priceAlerts: state.priceAlerts,
          favorites: state.favorites,
          preferences: state.preferences,
          recentSearches: state.recentSearches,
        })
      );
    } catch (e) {
      // ignore
    }
  };

  const updateSearch = (query: Partial<SearchQuery>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const swapAirports = () => dispatch({ type: 'SWAP_AIRPORTS' });

  const addSavedSearch = () => {
    const saved: SavedSearch = {
      id: generateId(),
      query: { ...state.searchQuery },
      savedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SAVED_SEARCH', payload: saved });
  };

  const removeSavedSearch = (id: string) => dispatch({ type: 'REMOVE_SAVED_SEARCH', payload: id });

  const addPriceAlert = (targetPrice: number) => {
    const alert: PriceAlert = {
      id: generateId(),
      searchQuery: { ...state.searchQuery },
      targetPrice,
      currentLowestPrice: state.searchResults.length > 0 ? state.searchResults[0].price : 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      priceHistory: [],
    };
    dispatch({ type: 'ADD_PRICE_ALERT', payload: alert });
  };

  const removePriceAlert = (id: string) => dispatch({ type: 'REMOVE_PRICE_ALERT', payload: id });
  const togglePriceAlert = (id: string) => dispatch({ type: 'TOGGLE_PRICE_ALERT', payload: id });

  const toggleFavorite = (flightId: string) => dispatch({ type: 'TOGGLE_FAVORITE', payload: flightId });
  const isFavorite = (flightId: string) => state.favorites.includes(flightId);

  const setDeals = (deals: DealOfDay[]) => dispatch({ type: 'SET_DEALS', payload: deals });

  const updatePreferences = (prefs: Partial<UserPreferences>) =>
    dispatch({ type: 'SET_PREFERENCES', payload: prefs });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        updateSearch,
        swapAirports,
        addSavedSearch,
        removeSavedSearch,
        addPriceAlert,
        removePriceAlert,
        togglePriceAlert,
        toggleFavorite,
        isFavorite,
        setDeals,
        updatePreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
