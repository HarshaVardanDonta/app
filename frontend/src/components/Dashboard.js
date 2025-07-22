import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import BankRequestForm from './BankRequestForm';
import { MOCK_BANKS, MOCK_PENDING_REQUESTS, MOCK_TRANSFER_HISTORY } from '../mock/data';
import { Building2, DollarSign, ArrowRightLeft, TrendingUp, Crown, Users } from 'lucide-react';

const Dashboard = () => {
  const { isOwner } = useWallet();

  // Calculate stats
  const totalBanks = MOCK_BANKS.length;
  const pendingRequests = MOCK_PENDING_REQUESTS.length;
  const totalTransfers = MOCK_TRANSFER_HISTORY.length;
  const totalMintedSupply = MOCK_BANKS.reduce((sum, bank) => sum + bank.mintedSupply, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          {isOwner ? 'Admin Dashboard' : 'Bank Manager Dashboard'}
        </h1>
        <p className="text-lg text-gray-600">
          {isOwner 
            ? 'Manage banks, approve requests, and oversee the entire banking system'
            : 'View banks, submit requests, and manage your banking activities'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Banks
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalBanks}</div>
            <p className="text-xs text-gray-500 mt-1">Active institutions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Supply
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(totalMintedSupply / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-500 mt-1">Minted coins</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Transfers
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalTransfers}</div>
            <p className="text-xs text-gray-500 mt-1">Completed transactions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isOwner ? 'Pending Requests' : 'Request Status'}
            </CardTitle>
            {isOwner ? <Crown className="h-4 w-4 text-orange-500" /> : <Users className="h-4 w-4 text-orange-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingRequests}</div>
            <p className="text-xs text-gray-500 mt-1">
              {isOwner ? 'Awaiting approval' : 'Under review'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Banks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Recent Banks</span>
            </CardTitle>
            <CardDescription>Latest registered banking institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_BANKS.slice(0, 3).map((bank) => (
                <div key={bank.uniqueId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{bank.bankName}</h4>
                    <p className="text-sm text-gray-600">{bank.currencyName} ({bank.currencySymbol})</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {(bank.mintedSupply / 1000000).toFixed(1)}M minted
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest inter-bank transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TRANSFER_HISTORY.slice(0, 3).map((transfer) => (
                <div key={transfer.transferId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {transfer.fromBankId} → {transfer.toBankId}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transfer.amount.toLocaleString()} {transfer.currencyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transfer.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Request Form for non-owners */}
      {!isOwner && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Request New Bank</h2>
          <BankRequestForm />
        </div>
      )}

      {/* Owner Quick Actions */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Admin shortcuts for common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Pending Requests</h4>
                <p className="text-sm text-gray-600 mb-3">Review and approve bank creation requests</p>
                <Badge variant="outline">{pendingRequests} pending</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Mint Coins</h4>
                <p className="text-sm text-gray-600 mb-3">Add new currency supply to banks</p>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Transfer Management</h4>
                <p className="text-sm text-gray-600 mb-3">Approve inter-bank transfers</p>
                <Badge variant="outline">Monitor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;