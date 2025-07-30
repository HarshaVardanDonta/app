import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, Crown, LogOut } from 'lucide-react';

const Navbar = () => {
  const { account, isOwner, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Bank Manager</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/banks"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/banks')
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                Banks
              </Link>
              <Link
                to="/transfers"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/transfers')
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                Transfers
              </Link>
              {isOwner && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                    }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {isOwner && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatAddress(account)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => connectWallet(false)}
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
                <Button
                  onClick={() => connectWallet(true)}
                  disabled={isConnecting}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Owner
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;