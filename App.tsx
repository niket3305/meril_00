import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { AppProvider, useApp } from './src/context/AppContext';

// Disable Reanimated strict mode to prevent internal NativeWind / style resolution warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
import { Header } from './src/components/common/Header';
import { BottomNav } from './src/components/common/BottomNav';
import { ToastContainer } from './src/components/common/ToastContainer';
import { LoginScreen } from './src/components/auth/LoginScreen';
import { CustomersView } from './src/components/admin/CustomersView';
import { MachinesView } from './src/components/admin/MachinesView';
import { RequestQueueView } from './src/components/admin/RequestQueueView';
import { MyJobsView } from './src/components/engineer/MyJobsView';
import { JobDetailView } from './src/components/engineer/JobDetailView';
import { CloseJobView } from './src/components/engineer/CloseJobView';
import { ProductOrderingView } from './src/components/engineer/ProductOrderingView';
import { MerilCustomerScreen } from './src/components/customer/MerilCustomerScreen';
import './global.css';

const AppContent: React.FC = () => {
  const { currentScreen, currentRole, isLoading, isLoggedIn } = useApp();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0a3871" />
      </SafeAreaView>
    );
  }

  // Not logged in or on login screen
  if (!isLoggedIn || currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <LoginScreen />
        <ToastContainer />
      </SafeAreaView>
    );
  }

  // Customer Portal from meril_hasim
  if (currentRole === 'customer') {
    return (
      <View style={styles.container}>
        <MerilCustomerScreen />
        <ToastContainer />
      </View>
    );
  }

  // Admin & Engineer Screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'customers':
        return <CustomersView />;
      case 'machines':
        return <MachinesView />;
      case 'request-queue':
        return <RequestQueueView />;
      case 'my-jobs':
        return <MyJobsView />;
      case 'job-detail':
        return <JobDetailView />;
      case 'close-job':
        return <CloseJobView />;
      case 'product-ordering':
        return <ProductOrderingView />;
      default:
        return currentRole === 'admin' ? <RequestQueueView /> : <MyJobsView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav />
      <ToastContainer />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
