import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { useWallet } from '../contexts/WalletContext';
import { Building2, DollarSign, Hash, Loader2 } from 'lucide-react';

const BankRequestForm = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    currencyName: '',
    currencySymbol: '',
    currencyValue: ''
  });
  const { web3Service, isConnected } = useWallet();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!formData.bankName || !formData.currencyName || !formData.currencySymbol || !formData.currencyValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.currencyValue) <= 0) {
      toast({
        title: "Validation Error",
        description: "Currency value must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tx = await web3Service.requestBank(
        formData.bankName,
        formData.currencyName,
        formData.currencySymbol,
        parseFloat(formData.currencyValue)
      );
      
      toast({
        title: "Bank Request Submitted",
        description: `Your bank request has been submitted successfully. Transaction: ${tx.hash}`,
      });
      
      // Reset form
      setFormData({
        bankName: '',
        currencyName: '',
        currencySymbol: '',
        currencyValue: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Bank request failed:', error);
      let errorMessage = 'Failed to submit bank request. Please try again.';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Request New Bank</span>
        </CardTitle>
        <CardDescription>
          Submit a request to create a new bank with your specified currency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="flex items-center space-x-1">
                <Building2 className="w-4 h-4" />
                <span>Bank Name</span>
              </Label>
              <Input
                id="bankName"
                name="bankName"
                type="text"
                placeholder="e.g., First National Bank"
                value={formData.bankName}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currencyName" className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Currency Name</span>
              </Label>
              <Input
                id="currencyName"
                name="currencyName"
                type="text"
                placeholder="e.g., US Dollar"
                value={formData.currencyName}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currencySymbol" className="flex items-center space-x-1">
                <Hash className="w-4 h-4" />
                <span>Currency Symbol</span>
              </Label>
              <Input
                id="currencySymbol"
                name="currencySymbol"
                type="text"
                placeholder="e.g., USD"
                maxLength="10"
                value={formData.currencySymbol}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currencyValue" className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Currency Value (vs USD)</span>
              </Label>
              <Input
                id="currencyValue"
                name="currencyValue"
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="e.g., 1.00"
                value={formData.currencyValue}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• This will submit a transaction to the Sepolia testnet</li>
                  <li>• You'll need Sepolia ETH for gas fees</li>
                  <li>• Bank creation requires owner approval</li>
                  <li>• Currency value should be relative to USD (e.g., EUR = 1.08)</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !isConnected}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Bank Request'
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-gray-500 text-center">
              Please connect your wallet to submit a bank request
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default BankRequestForm;