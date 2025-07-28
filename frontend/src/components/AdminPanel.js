import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { 
  Crown, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Coins,
  ArrowRightLeft, 
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdminPanel = () => {
  const [isLoading, setIsLoading] = useState({});
  const [mintAmount, setMintAmount] = useState({});
  const { web3Service } = useWallet();
  const { banks, pendingRequests, pendingTransfers, loading, error, refresh } = useBlockchainData();
  const { toast } = useToast();

  const handleApproveBank = async (bankId) => {
    setIsLoading(prev => ({ ...prev, [bankId]: true }));
    try {
      const tx = await web3Service.generateBank(bankId);
      toast({
        title: "Bank Approved",
        description: `Bank ${bankId} has been approved successfully. Transaction: ${tx.hash}`,
      });
      // Refresh data after successful transaction
      setTimeout(() => {
        refresh();
      }, 3000);
    } catch (error) {
      console.error('Failed to approve bank:', error);
      let errorMessage = 'Failed to approve bank. Please try again.';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [bankId]: false }));
    }
  };

  const handleMintCoins = async (bankId) => {
    const amount = mintAmount[bankId];
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to mint.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [`mint_${bankId}`]: true }));
    try {
      const tx = await web3Service.mintCoins(bankId, parseInt(amount));
      toast({
        title: "Coins Minted",
        description: `${amount} coins have been minted for ${bankId}. Transaction: ${tx.hash}`,
      });
      setMintAmount(prev => ({ ...prev, [bankId]: '' }));
      // Refresh data after successful transaction
      setTimeout(() => {
        refresh();
      }, 3000);
    } catch (error) {
      console.error('Failed to mint coins:', error);
      let errorMessage = 'Failed to mint coins. Please try again.';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`mint_${bankId}`]: false }));
    }
  };

  const handleApproveTransfer = async (transfer) => {
    setIsLoading(prev => ({ ...prev, [`transfer_${transfer.transferId}`]: true }));
    try {
      const tx = await web3Service.approveBankTransfer(transfer.toBankId, transfer.transferId);
      toast({
        title: "Transfer Approved",
        description: `Transfer ${transfer.transferId} has been approved successfully. Transaction: ${tx.hash}`,
      });
      // Refresh data after successful transaction
      setTimeout(() => {
        refresh();
      }, 3000);
    } catch (error) {
      console.error('Failed to approve transfer:', error);
      let errorMessage = 'Failed to approve transfer. Please try again.';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`transfer_${transfer.transferId}`]: false }));
    }
  };

  const handleRejectTransfer = async (transfer) => {
    setIsLoading(prev => ({ ...prev, [`reject_${transfer.transferId}`]: true }));
    try {
      const tx = await web3Service.rejectBankTransfer(transfer.toBankId, transfer.transferId);
      toast({
        title: "Transfer Rejected",
        description: `Transfer ${transfer.transferId} has been rejected. Transaction: ${tx.hash}`,
        variant: "destructive"
      });
      // Refresh data after successful transaction
      setTimeout(() => {
        refresh();
      }, 3000);
    } catch (error) {
      console.error('Failed to reject transfer:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to reject transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`reject_${transfer.transferId}`]: false }));
    }
  };

  if (loading && banks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading admin data from blockchain...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>Failed to load admin data</span>
        </div>
        <p className="text-sm text-gray-600 text-center max-w-md">
          {error}
        </p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-lg text-gray-600">
          Manage banks, approve requests, and oversee the banking system
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button onClick={refresh} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-700">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Banks</p>
                <p className="text-2xl font-bold text-blue-700">{banks.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Transfers</p>
                <p className="text-2xl font-bold text-purple-700">{pendingTransfers.length}</p>
              </div>
              <ArrowRightLeft className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Supply</p>
                <p className="text-2xl font-bold text-green-700">
                  {(banks.reduce((sum, bank) => sum + parseInt(bank.mintedSupply || 0), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Coins className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Bank Requests</TabsTrigger>
          <TabsTrigger value="minting">Coin Minting</TabsTrigger>
          <TabsTrigger value="transfers">Transfer Management</TabsTrigger>
        </TabsList>
        
        {/* Bank Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Pending Bank Requests</span>
              </CardTitle>
              <CardDescription>
                Review and approve new bank creation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.generatedId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{request.bankName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <Badge variant="outline">{request.currencySymbol}</Badge>
                          <span>{request.currencyName}</span>
                          <span>Rate: ${parseFloat(request.currencyValue).toFixed(4)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Submitted by: {request.submittedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {request.generatedId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveBank(request.generatedId)}
                          disabled={isLoading[request.generatedId]}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading[request.generatedId] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending bank requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coin Minting Tab */}
        <TabsContent value="minting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-green-600" />
                <span>Coin Minting</span>
              </CardTitle>
              <CardDescription>
                Mint new coins for approved banks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banks.map((bank) => (
                  <div key={bank.uniqueId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{bank.bankName}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Supply:</span>
                            <p className="font-medium">{parseInt(bank.mintedSupply || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Available:</span>
                            <p className="font-medium">{parseInt(bank.availableSupply || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Currency:</span>
                            <p className="font-medium">{bank.currencySymbol}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="space-y-2">
                          <Label htmlFor={`mint-${bank.uniqueId}`} className="text-sm">
                            Amount to Mint
                          </Label>
                          <Input
                            id={`mint-${bank.uniqueId}`}
                            type="number"
                            min="1"
                            placeholder="0"
                            value={mintAmount[bank.uniqueId] || ''}
                            onChange={(e) => setMintAmount(prev => ({
                              ...prev,
                              [bank.uniqueId]: e.target.value
                            }))}
                            disabled={isLoading[`mint_${bank.uniqueId}`]}
                            className="w-32"
                          />
                        </div>
                        <Button
                          onClick={() => handleMintCoins(bank.uniqueId)}
                          disabled={isLoading[`mint_${bank.uniqueId}`]}
                          className="bg-green-600 hover:bg-green-700 mt-6"
                        >
                          {isLoading[`mint_${bank.uniqueId}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Coins className="w-4 h-4 mr-1" />
                          )}
                          Mint
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {banks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No approved banks available for minting</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Management Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <span>Pending Transfers</span>
              </CardTitle>
              <CardDescription>
                Approve or reject inter-bank transfer requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTransfers.map((transfer) => (
                  <div key={transfer.transferId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">
                          {transfer.fromBankId} → {transfer.toBankId}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Amount: {parseInt(transfer.amount).toLocaleString()} {transfer.currencyName}</span>
                          <span>Date: {new Date(transfer.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono break-all">
                          {transfer.transferId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveTransfer(transfer)}
                          disabled={isLoading[`transfer_${transfer.transferId}`]}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading[`transfer_${transfer.transferId}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectTransfer(transfer)}
                          disabled={isLoading[`reject_${transfer.transferId}`]}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {isLoading[`reject_${transfer.transferId}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingTransfers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending transfers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;