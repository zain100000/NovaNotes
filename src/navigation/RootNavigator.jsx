/**
 * @file RootNavigator.jsx
 * @module Navigation/RootNavigator
 * @description The RootNavigator component serves as the entry point for the NovaNotes application, integrating Redux for state management and React Navigation for seamless screen transitions. It wraps the entire app in a Provider to supply the Redux store and a PersistGate to manage persisted state, ensuring a smooth user experience from the moment the app is launched.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import these
import { store, persistor } from '../redux/store/store.store';
import AppNavigator from './AppNavigator';

// 1. Create a client instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Recommended for auth/session checks
    },
  },
});

const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* 2. Wrap everything in the QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
