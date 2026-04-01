import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, TripItem, TripDay } from '../types/trip';
import { generateId } from '../utils/helpers';

interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
}

type TripAction =
  | { type: 'SET_TRIPS'; trips: Trip[] }
  | { type: 'ADD_TRIP'; trip: Trip }
  | { type: 'UPDATE_TRIP'; trip: Trip }
  | { type: 'DELETE_TRIP'; tripId: string }
  | { type: 'SET_ACTIVE_TRIP'; tripId: string | null }
  | { type: 'ADD_ITEM'; tripId: string; dayDate: string; item: TripItem }
  | { type: 'REMOVE_ITEM'; tripId: string; dayDate: string; itemId: string }
  | { type: 'UPDATE_ITEM'; tripId: string; dayDate: string; item: TripItem };

const STORAGE_KEY = 'trips_data';

const initialState: TripState = { trips: [], activeTrip: null };

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.trips };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.trip], activeTrip: action.trip };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === action.trip.id ? action.trip : t)),
        activeTrip: state.activeTrip?.id === action.trip.id ? action.trip : state.activeTrip,
      };
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.tripId),
        activeTrip: state.activeTrip?.id === action.tripId ? null : state.activeTrip,
      };
    case 'SET_ACTIVE_TRIP':
      return { ...state, activeTrip: action.tripId ? state.trips.find((t) => t.id === action.tripId) || null : null };
    case 'ADD_ITEM': {
      const updatedTrips = state.trips.map((trip) => {
        if (trip.id !== action.tripId) return trip;
        const dayExists = trip.days.find((d) => d.date === action.dayDate);
        const days = dayExists
          ? trip.days.map((d) => (d.date === action.dayDate ? { ...d, items: [...d.items, action.item] } : d))
          : [...trip.days, { date: action.dayDate, items: [action.item] }].sort((a, b) => a.date.localeCompare(b.date));
        return { ...trip, days, updatedAt: new Date().toISOString() };
      });
      const updatedTrip = updatedTrips.find((t) => t.id === action.tripId) || null;
      return { ...state, trips: updatedTrips, activeTrip: state.activeTrip?.id === action.tripId ? updatedTrip : state.activeTrip };
    }
    case 'REMOVE_ITEM': {
      const updatedTrips = state.trips.map((trip) => {
        if (trip.id !== action.tripId) return trip;
        const days = trip.days.map((d) => (d.date === action.dayDate ? { ...d, items: d.items.filter((i) => i.id !== action.itemId) } : d)).filter((d) => d.items.length > 0);
        return { ...trip, days, updatedAt: new Date().toISOString() };
      });
      const updatedTrip = updatedTrips.find((t) => t.id === action.tripId) || null;
      return { ...state, trips: updatedTrips, activeTrip: state.activeTrip?.id === action.tripId ? updatedTrip : state.activeTrip };
    }
    case 'UPDATE_ITEM': {
      const updatedTrips = state.trips.map((trip) => {
        if (trip.id !== action.tripId) return trip;
        const days = trip.days.map((d) => (d.date === action.dayDate ? { ...d, items: d.items.map((i) => (i.id === action.item.id ? action.item : i)) } : d));
        return { ...trip, days, updatedAt: new Date().toISOString() };
      });
      const updatedTrip = updatedTrips.find((t) => t.id === action.tripId) || null;
      return { ...state, trips: updatedTrips, activeTrip: state.activeTrip?.id === action.tripId ? updatedTrip : state.activeTrip };
    }
    default:
      return state;
  }
}

interface TripContextType {
  state: TripState;
  createTrip: (name: string, destination: string, startDate: string, endDate: string, currency?: string) => Trip;
  deleteTrip: (tripId: string) => void;
  setActiveTrip: (tripId: string | null) => void;
  addItem: (tripId: string, dayDate: string, item: Omit<TripItem, 'id'>) => void;
  removeItem: (tripId: string, dayDate: string, itemId: string) => void;
  updateItem: (tripId: string, dayDate: string, item: TripItem) => void;
  getTotalCost: (trip: Trip) => number;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) dispatch({ type: 'SET_TRIPS', trips: JSON.parse(data) });
    });
  }, []);

  useEffect(() => {
    if (state.trips.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
    }
  }, [state.trips]);

  const createTrip = (name: string, destination: string, startDate: string, endDate: string, currency = 'USD'): Trip => {
    const trip: Trip = {
      id: generateId(),
      name,
      destination,
      startDate,
      endDate,
      days: [],
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRIP', trip });
    return trip;
  };

  const deleteTrip = (tripId: string) => dispatch({ type: 'DELETE_TRIP', tripId });
  const setActiveTrip = (tripId: string | null) => dispatch({ type: 'SET_ACTIVE_TRIP', tripId });

  const addItem = (tripId: string, dayDate: string, item: Omit<TripItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', tripId, dayDate, item: { ...item, id: generateId() } });
  };

  const removeItem = (tripId: string, dayDate: string, itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', tripId, dayDate, itemId });
  };

  const updateItem = (tripId: string, dayDate: string, item: TripItem) => {
    dispatch({ type: 'UPDATE_ITEM', tripId, dayDate, item });
  };

  const getTotalCost = (trip: Trip): number => {
    return trip.days.reduce((total, day) => total + day.items.reduce((dayTotal, item) => dayTotal + (item.cost || 0), 0), 0);
  };

  return (
    <TripContext.Provider value={{ state, createTrip, deleteTrip, setActiveTrip, addItem, removeItem, updateItem, getTotalCost }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};
