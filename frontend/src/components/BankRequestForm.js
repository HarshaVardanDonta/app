import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { mockRequestBank } from '../mock/data';
import { Building2, DollarSign, Hash, Loader2 } from 'lucide-react';

const BankRequestForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    currencyName: '',
    currencySymbol: '',
    currencyValue: ''
  });
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
    
    if (!formData.bankName || !formData.currencyName || !formData.currencySymbol || !formData.currencyValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await mockRequestBank({
        ...formData,
        currencyValue: parseFloat(formData.currencyValue)
      });
      
      if (result.success) {
        toast({
          title: "Bank Request Submitted",
          description: `Your bank request has been submitted successfully. Transaction: ${result.transactionHash}`,
        });
        
        // Reset form
        setFormData({
          bankName: '',
          currencyName: '',
          currencySymbol: '',
          currencyValue: ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bank request. Please try again.",
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
                className="w-full"
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
                placeholder="e.g., 1.00"
                value={formData.currencyValue}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
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
        </form>
      </CardContent>
    </Card>
  );
};

export default BankRequestForm;