import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BankList from './components/BankList';
import TransferHistory from './components/TransferHistory';
import AdminPanel from './components/AdminPanel';
import { useWallet } from './contexts/WalletContext';
import './App.css';

// Protected Route Component
const ProtectedOwnerRoute = ({ children }) => {
  const { isConnected, isOwner } = useWallet();
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only the contract owner can access this section.</p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Main App Content
const AppContent = () => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Bank Manager
            </h1>
            <p className="text-gray-600 mb-8">
              Connect your MetaMask wallet to start managing banks and currencies on the blockchain.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Request new bank creation</li>
                <li>• View existing banks and their details</li>
                <li>• Manage inter-bank transfers</li>
                <li>• Admin controls for contract owners</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/banks" element={<BankList />} />
          <Route path="/transfers" element={<TransferHistory />} />
          <Route path="/admin" element={
            <ProtectedOwnerRoute>
              <AdminPanel />
            </ProtectedOwnerRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <AppContent />
          <Toaster />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;