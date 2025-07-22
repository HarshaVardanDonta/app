import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  MOCK_PENDING_REQUESTS, 
  MOCK_PENDING_TRANSFERS, 
  MOCK_BANKS,
  mockApproveBank,
  mockMintCoins
} from '../mock/data';
import { 
  Crown, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Coins,
  ArrowRightLeft, 
  Clock,
  Loader2
} from 'lucide-react';

const AdminPanel = () => {
  const [isLoading, setIsLoading] = useState({});
  const [mintAmount, setMintAmount] = useState({});
  const { toast } = useToast();

  const handleApproveBank = async (bankId) => {
    setIsLoading(prev => ({ ...prev, [bankId]: true }));
    try {
      const result = await mockApproveBank(bankId);
      if (result.success) {
        toast({
          title: "Bank Approved",
          description: `Bank ${bankId} has been approved successfully. Transaction: ${result.transactionHash}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve bank. Please try again.",
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
      const result = await mockMintCoins(bankId, parseInt(amount));
      if (result.success) {
        toast({
          title: "Coins Minted",
          description: `${amount} coins have been minted for ${bankId}. Transaction: ${result.transactionHash}`,
        });
        setMintAmount(prev => ({ ...prev, [bankId]: '' }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mint coins. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`mint_${bankId}`]: false }));
    }
  };

  const handleApproveTransfer = async (transferId) => {
    setIsLoading(prev => ({ ...prev, [`transfer_${transferId}`]: true }));
    try {
      // Mock approval logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Transfer Approved",
        description: `Transfer ${transferId} has been approved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`transfer_${transferId}`]: false }));
    }
  };

  const handleRejectTransfer = async (transferId) => {
    setIsLoading(prev => ({ ...prev, [`reject_${transferId}`]: true }));
    try {
      // Mock rejection logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Transfer Rejected",
        description: `Transfer ${transferId} has been rejected.`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject transfer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`reject_${transferId}`]: false }));
    }
  };

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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-700">{MOCK_PENDING_REQUESTS.length}</p>
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
                <p className="text-2xl font-bold text-blue-700">{MOCK_BANKS.length}</p>
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
                <p className="text-2xl font-bold text-purple-700">{MOCK_PENDING_TRANSFERS.length}</p>
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
                  {(MOCK_BANKS.reduce((sum, bank) => sum + bank.mintedSupply, 0) / 1000000).toFixed(1)}M
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
                {MOCK_PENDING_REQUESTS.map((request) => (
                  <div key={request.generatedId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{request.bankName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <Badge variant="outline">{request.currencySymbol}</Badge>
                          <span>{request.currencyName}</span>
                          <span>Rate: ${request.currencyValue}</span>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {MOCK_PENDING_REQUESTS.length === 0 && (
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
                {MOCK_BANKS.map((bank) => (
                  <div key={bank.uniqueId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{bank.bankName}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Current Supply:</span>
                            <p className="font-medium">{bank.mintedSupply.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Available:</span>
                            <p className="font-medium">{bank.availableSupply.toLocaleString()}</p>
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
                            placeholder="0"
                            value={mintAmount[bank.uniqueId] || ''}
                            onChange={(e) => setMintAmount(prev => ({
                              ...prev,
                              [bank.uniqueId]: e.target.value
                            }))}
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
                {MOCK_PENDING_TRANSFERS.map((transfer) => (
                  <div key={transfer.transferId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">
                          {transfer.fromBankId} → {transfer.toBankId}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Amount: {transfer.amount.toLocaleString()} {transfer.currencyName}</span>
                          <span>Date: {new Date(transfer.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">
                          {transfer.transferId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveTransfer(transfer.transferId)}
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
                          onClick={() => handleRejectTransfer(transfer.transferId)}
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
                {MOCK_PENDING_TRANSFERS.length === 0 && (
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