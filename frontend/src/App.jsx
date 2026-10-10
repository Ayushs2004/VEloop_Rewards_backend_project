import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { WalletPage } from './pages/WalletPage';
import { PayoutPage } from './pages/PayoutPage';
import { AdminPage } from './pages/AdminPage';
import { walletApi } from './api/client';
import './App.css';

function MainApp() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(undefined);

  const fetchLiveBalance = async () => {
    if (!user) return;
    try {
      const res = await walletApi.getWallet();
      if (res.success && res.data) {
        setWalletBalance(res.data.ves);
      }
    } catch {
      // ignore preview errors
    }
  };

  useEffect(() => {
    fetchLiveBalance();
  }, [user, activePage]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '1rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div
          className="spin"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1'
          }}
        />
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Initializing VELoop Rewards...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        walletBalance={walletBalance}
      />
      <main className="main-content">
        {activePage === 'wallet' && (
          <WalletPage onNavigateToPayout={() => setActivePage('payout')} />
        )}
        {activePage === 'payout' && (
          <PayoutPage onBackToWallet={() => setActivePage('wallet')} />
        )}
        {activePage === 'admin' && <AdminPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
