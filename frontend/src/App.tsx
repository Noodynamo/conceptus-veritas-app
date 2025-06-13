import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { AnalyticsProvider } from './context/AnalyticsProvider';
import { ErrorMonitoringProvider } from './context/ErrorMonitoringProvider';
import * as Sentry from '@sentry/react-native';

// Import your navigation stack here
// import { AppNavigator } from './navigation/AppNavigator';

/**
 * Main App component with all necessary providers
 */
const App = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ErrorMonitoringProvider>
            <AnalyticsProvider>
              <NavigationContainer>
                {/* Add your main navigator here */}
                {/* <AppNavigator /> */}
                {/* Placeholder for navigation - replace with actual navigation */}
                <React.Fragment />
              </NavigationContainer>
            </AnalyticsProvider>
          </ErrorMonitoringProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default Sentry.wrap(App);
