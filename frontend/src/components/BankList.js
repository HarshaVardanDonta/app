import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { useWallet } from '../contexts/WalletContext';
import BankRequestForm from './BankRequestForm';
import { Building2, DollarSign, Search, TrendingUp, Coins, ExternalLink, Loader2, AlertCircle, RefreshCw, Plus, Crown } from 'lucide-react';

const BankList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const { banks, loading, error, refresh } = useBlockchainData();
  const { isOwner } = useWallet();

  const handleBankRequestSuccess = () => {
    // Refresh data after successful bank request
    setTimeout(() => {
      refresh();
    }, 2000);
  };

  const filteredBanks = banks.filter(bank =>
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.currencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.currencySymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num) => {
    const numVal = parseInt(num || 0);
    if (numVal >= 1000000) {
      return (numVal / 1000000).toFixed(1) + 'M';
    } else if (numVal >= 1000) {
      return (numVal / 1000).toFixed(1) + 'K';
    }
    return numVal.toLocaleString();
  };

  if (loading && banks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading banks from blockchain...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>Failed to load banks</span>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-600 mt-2">Browse registered banks and request new ones</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={refresh} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Bank Directory and New Request */}
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">Bank Directory</TabsTrigger>
          <TabsTrigger value="request">
            <Plus className="w-4 h-4 mr-1" />
            {isOwner ? 'Request Bank' : 'Request New Bank'}
          </TabsTrigger>
        </TabsList>

        {/* Bank Directory Tab */}
        <TabsContent value="directory" className="space-y-6">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search banks, currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredBanks.length} bank{filteredBanks.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Bank Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBanks.map((bank) => (
              <Card key={bank.uniqueId} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {bank.bankName}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <span>{bank.currencyName}</span>
                          <Badge variant="outline" className="ml-2">
                            {bank.currencySymbol}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Currency Value */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Exchange Rate</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(bank.currencyValue || 0).toFixed(6)}
                      </span>
                    </div>

                    {/* Supply Information */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Coins className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">Minted</span>
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          {formatNumber(bank.mintedSupply)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Available</span>
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {formatNumber(bank.availableSupply)}
                        </div>
                      </div>
                    </div>

                    {/* Bank Address */}
                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded text-xs">
                      <span className="text-gray-600">Bank ID:</span>
                      <span className="font-mono text-gray-800">{bank.uniqueId}</span>
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-indigo-50 rounded">
                        <div className="text-indigo-600 font-medium">Normal Balance</div>
                        <div className="text-indigo-900 font-bold">{formatNumber(bank.normalCurrencyBalance)}</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-purple-600 font-medium">Foreign Balance</div>
                        <div className="text-purple-900 font-bold">{formatNumber(bank.foreignCurrencyBalance)}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700"
                      onClick={() => setSelectedBank(bank)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredBanks.length === 0 && banks.length > 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banks found</h3>
              <p className="text-gray-600">
                No banks match "{searchTerm}". Try a different search term.
              </p>
            </div>
          )}

          {banks.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banks registered yet</h3>
              <p className="text-gray-600">
                Be the first to request a new bank creation!
              </p>
            </div>
          )}
        </TabsContent>

        {/* New Bank Request Tab */}
        <TabsContent value="request" className="space-y-6">
          <BankRequestForm onSuccess={handleBankRequestSuccess} />
        </TabsContent>
      </Tabs>

      {/* Bank Detail Modal */}
      {selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedBank.bankName} Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBank(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Currency</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedBank.currencyName} ({selectedBank.currencySymbol})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(selectedBank.currencyValue || 0).toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Minted</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseInt(selectedBank.mintedSupply || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Available Supply</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseInt(selectedBank.availableSupply || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Normal Balance</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseInt(selectedBank.normalCurrencyBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Foreign Balance</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseInt(selectedBank.foreignCurrencyBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Address</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {selectedBank.bankAddress}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Bank ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                    {selectedBank.uniqueId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {selectedBank.createdBy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BankList;