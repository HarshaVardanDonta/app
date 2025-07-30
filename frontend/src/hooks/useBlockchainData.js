import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Custom hook for fetching blockchain data
export const useBlockchainData = () => {
  const { isConnected, web3Service } = useWallet();
  const [data, setData] = useState({
    banks: [],
    pendingRequests: [],
    pendingTransfers: [],
    transferHistory: [],
    loading: true,
    error: null
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAllData = async () => {
    if (!isConnected) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [banksRes, pendingReqRes, pendingTransRes, historyRes] = await Promise.all([
        axios.get(`${API}/banks`),
        axios.get(`${API}/banks/requests/pending`),
        axios.get(`${API}/transfers/pending`),
        axios.get(`${API}/transfers/history`)
      ]);

      setData({
        banks: banksRes.data,
        pendingRequests: pendingReqRes.data,
        pendingTransfers: pendingTransRes.data,
        transferHistory: historyRes.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch data'
      }));
    }
  };

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchAllData();
  }, [isConnected, refreshKey]);

  return {
    ...data,
    refresh
  };
};

// Hook for individual bank data
export const useBankData = (bankId) => {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bankId) return;

    const fetchBank = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API}/banks/${bankId}`);
        setBank(response.data);
      } catch (error) {
        console.error(`Failed to fetch bank ${bankId}:`, error);
        setError(error.response?.data?.detail || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBank();
  }, [bankId]);

  return { bank, loading, error };
};