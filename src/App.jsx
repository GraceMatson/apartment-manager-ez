import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApartmentProvider } from './context/ApartmentContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FlatsDirectory from './components/FlatsDirectory';
import ProfileView from './components/ProfileView';
import MaintenanceView from './components/MaintenanceView';
import ServiceDeskView from './components/ServiceDeskView';
import NoticesView from './components/NoticesView';
import AuthGateway from './components/AuthGateway';
import TenancyRequestModal from './components/TenancyRequestModal';

function MainLayout() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isTenancyModalOpen, setIsTenancyModalOpen] = useState(false);
  const { currentUser, openAuthGateway } = useAuth();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenTenancyModal={() => setIsTenancyModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-viewport">
        {/* Header Topbar */}
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenTenancyModal={() => setIsTenancyModalOpen(true)}
        />

        {/* Dynamic Views */}
        <main className="content-scrollable">
          {activeView === 'dashboard' && (
            <Dashboard
              setActiveView={setActiveView}
              onOpenTenancyModal={() => setIsTenancyModalOpen(true)}
            />
          )}

          {activeView === 'flats' && (
            <FlatsDirectory onOpenTenancyModal={() => setIsTenancyModalOpen(true)} />
          )}

          {activeView === 'profile' && (
            <ProfileView onOpenTenancyModal={() => setIsTenancyModalOpen(true)} />
          )}

          {activeView === 'maintenance' && <MaintenanceView />}

          {activeView === 'service' && <ServiceDeskView />}

          {activeView === 'notices' && <NoticesView />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <AuthGateway />
      <TenancyRequestModal
        isOpen={isTenancyModalOpen}
        onClose={() => setIsTenancyModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ApartmentProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ApartmentProvider>
  );
}
