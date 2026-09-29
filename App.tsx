import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/common/Header';
import { BottomNav } from './src/components/common/BottomNav';
import { ToastContainer } from './src/components/common/ToastContainer';
import { LoginScreen } from './src/components/auth/LoginScreen';
import { CustomersView } from './src/components/admin/CustomersView';
import { MachinesView } from './src/components/admin/MachinesView';
import { MyMachinesView } from './src/components/customer/MyMachinesView';
import { RaiseRequestView } from './src/components/customer/RaiseRequestView';
import { RequestStatusView } from './src/components/customer/RequestStatusView';
import { RequestQueueView } from './src/components/admin/RequestQueueView';
import { MyJobsView } from './src/components/engineer/MyJobsView';
import { JobDetailView } from './src/components/engineer/JobDetailView';
import { CloseJobView } from './src/components/engineer/CloseJobView';
import { ProductOrderingView } from './src/components/engineer/ProductOrderingView';
import './global.css';

const AppContent: React.FC = () => {
  const { currentScreen, isLoading, isLoggedIn } = useApp();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0a3871" />
      </SafeAreaView>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'customers':
        return <CustomersView />;
      case 'machines':
        return <MachinesView />;
      case 'my-machines':
        return <MyMachinesView />;
      case 'raise-request':
        return <RaiseRequestView />;
      case 'request-status':
        return <RequestStatusView />;
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
        return <LoginScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {isLoggedIn && currentScreen !== 'login' && <BottomNav />}
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
