import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { useWallet } from '../contexts/WalletContext';
import TransferRequestForm from './TransferRequestForm';
import { ArrowRightLeft, Search, Filter, Clock, CheckCircle, XCircle, Calendar, Loader2, AlertCircle, RefreshCw, Plus } from 'lucide-react';

const TransferHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const { transferHistory, pendingTransfers, loading, error, refresh } = useBlockchainData();
  const { isOwner } = useWallet();

  const handleTransferSuccess = () => {
    // Refresh data after successful transfer request
    setTimeout(() => {
      refresh();
    }, 2000);
  };

  // Combine pending and completed transfers, avoiding duplicates
  const allTransfers = React.useMemo(() => {
    // Create a map to store unique transfers by transferId
    const transferMap = new Map();

    // First, add all completed transfers (they take priority)
    transferHistory.forEach(transfer => {
      transferMap.set(transfer.transferId, {
        ...transfer,
        status: transfer.approved ? 'completed' : 'pending'
      });
    });

    // Then add pending transfers only if they don't already exist
    pendingTransfers.forEach(transfer => {
      if (!transferMap.has(transfer.transferId)) {
        transferMap.set(transfer.transferId, {
          ...transfer,
          status: transfer.approved ? 'completed' : 'pending'
        });
      }
    });

    // Convert map to array and sort by timestamp
    return Array.from(transferMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [pendingTransfers, transferHistory]);

  const filteredTransfers = allTransfers.filter(transfer => {
    const matchesSearch =
      transfer.fromBankId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toBankId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.currencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatAmount = (amount) => {
    return parseInt(amount || 0).toLocaleString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>;
    }
  };

  if (loading && allTransfers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading transfer history from blockchain...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>Failed to load transfer history</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Transfer Management</h1>
          <p className="text-gray-600 mt-2">Track transfers and request new bank-to-bank transfers</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={refresh} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Transfer History and New Request */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Transfer History</TabsTrigger>
          <TabsTrigger value="request">
            <Plus className="w-4 h-4 mr-1" />
            New Transfer
          </TabsTrigger>
        </TabsList>

        {/* Transfer History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search transfers, banks, currencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transfers</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-700">
                      {allTransfers.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {allTransfers.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-700">{allTransfers.length}</p>
                  </div>
                  <ArrowRightLeft className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredTransfers.length} transfer{filteredTransfers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Transfer List */}
          <div className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <Card key={transfer.transferId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {transfer.fromBankId} → {transfer.toBankId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatAmount(transfer.amount)} {transfer.currencyName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(transfer.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(transfer.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransfer(transfer)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTransfers.length === 0 && allTransfers.length > 0 && (
            <div className="text-center py-12">
              <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
              <p className="text-gray-600">
                No transfers match your current filters.
              </p>
            </div>
          )}

          {allTransfers.length === 0 && !loading && (
            <div className="text-center py-12">
              <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers yet</h3>
              <p className="text-gray-600">
                No transfers have been initiated yet.
              </p>
            </div>
          )}
        </TabsContent>

        {/* New Transfer Request Tab */}
        <TabsContent value="request" className="space-y-6">
          <TransferRequestForm onSuccess={handleTransferSuccess} />
        </TabsContent>
      </Tabs>

      {/* Transfer Detail Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Transfer Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransfer(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Status</span>
                  {getStatusBadge(selectedTransfer.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">From Bank</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransfer.fromBankId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">To Bank</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransfer.toBankId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(selectedTransfer.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Currency</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransfer.currencyName}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Transfer ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {selectedTransfer.transferId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <p className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {formatDate(selectedTransfer.timestamp)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Approved</label>
                  <p className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedTransfer.approved ? 'Yes' : 'No'}
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

export default TransferHistory;