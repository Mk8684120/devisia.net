import React, { useState } from 'react';
import { AppointmentProvider } from './context/AppointmentContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import AppointmentList from './components/AppointmentList';
import Quotes from './components/Quotes';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';

type Page = 'dashboard' | 'calendar' | 'appointments' | 'quotes' | 'settings' | 'users';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return (
          <Calendar
            onDateSelect={setSelectedDate}
            onAppointmentSelect={setSelectedAppointmentId}
          />
        );
      case 'appointments':
        return <AppointmentList />;
      case 'quotes':
        return <Quotes />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppointmentProvider>
          <AppContent />
        </AppointmentProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;