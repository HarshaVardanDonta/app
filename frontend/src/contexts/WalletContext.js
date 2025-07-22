import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockConnectWallet, mockConnectOwnerWallet, MOCK_CONTRACT_OWNER } from '../mock/data';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async (asOwner = false) => {
    setIsConnecting(true);
    try {
      // Using mock connection for now
      const connection = asOwner ? await mockConnectOwnerWallet() : await mockConnectWallet();
      setAccount(connection.address);
      setIsOwner(connection.isOwner);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', connection.address);
      localStorage.setItem('isOwner', connection.isOwner.toString());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsOwner(false);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isOwner');
  };

  // Check if wallet was previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    const savedIsOwner = localStorage.getItem('isOwner') === 'true';
    
    if (wasConnected && savedAddress) {
      setAccount(savedAddress);
      setIsOwner(savedIsOwner);
      setIsConnected(true);
    }
  }, []);

  const value = {
    account,
    isOwner,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};