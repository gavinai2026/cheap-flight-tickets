import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { TripProvider } from './src/context/TripContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { UpdateBanner } from './src/components/UpdateBanner';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NetworkProvider>
            <SubscriptionProvider>
              <AppProvider>
                <TripProvider>
                <StatusBar style="auto" />
                <UpdateBanner />
                <OfflineBanner />
                <AppNavigator />
                </TripProvider>
              </AppProvider>
            </SubscriptionProvider>
          </NetworkProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
