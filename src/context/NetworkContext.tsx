import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  startMonitoring,
  stopMonitoring,
  subscribeToNetwork,
  NetworkStatus,
  getNetworkStatus,
} from '../services/networkMonitor';

interface NetworkContextType {
  isConnected: boolean;
  connectionQuality: string;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  connectionQuality: 'good',
  isInternetReachable: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus());

  useEffect(() => {
    startMonitoring();
    const unsubscribe = subscribeToNetwork(setStatus);

    return () => {
      unsubscribe();
      stopMonitoring();
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isConnected: status.isConnected,
        connectionQuality: status.quality,
        isInternetReachable: status.isInternetReachable,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
