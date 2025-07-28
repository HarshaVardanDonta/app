import React, { createContext, useContext, useState, useEffect } from 'react';
import web3Service from '../services/web3Service';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [contractOwner, setContractOwner] = useState(null);

  const checkOwnership = async (address) => {
    try {
      const response = await axios.post(`${API}/contract/check-ownership`, {
        address: address
      });
      return response.data.isOwner;
    } catch (error) {
      console.error('Failed to check ownership:', error);
      return false;
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!web3Service.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const connection = await web3Service.connectWallet();
      const ownerStatus = await checkOwnership(connection.address);
      
      setAccount(connection.address);
      setIsOwner(ownerStatus);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', connection.address);
      localStorage.setItem('isOwner', ownerStatus.toString());
      
      return connection;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
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
    
    // Remove listeners
    web3Service.removeAllListeners();
  };

  // Get contract owner
  const fetchContractOwner = async () => {
    try {
      const response = await axios.get(`${API}/contract/owner`);
      setContractOwner(response.data.owner);
    } catch (error) {
      console.error('Failed to fetch contract owner:', error);
    }
  };

  // Check if wallet was previously connected and auto-reconnect
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected && savedAddress && web3Service.isMetaMaskInstalled()) {
      // Auto-reconnect
      connectWallet().catch((error) => {
        console.error('Auto-reconnect failed:', error);
        disconnectWallet();
      });
    }
    
    // Fetch contract owner on mount
    fetchContractOwner();
  }, []);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // Account changed, reconnect
          try {
            const ownerStatus = await checkOwnership(accounts[0]);
            setAccount(accounts[0]);
            setIsOwner(ownerStatus);
            localStorage.setItem('walletAddress', accounts[0]);
            localStorage.setItem('isOwner', ownerStatus.toString());
          } catch (error) {
            console.error('Failed to handle account change:', error);
            disconnectWallet();
          }
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const value = {
    account,
    isOwner,
    isConnected,
    isConnecting,
    contractOwner,
    connectWallet,
    disconnectWallet,
    web3Service
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};