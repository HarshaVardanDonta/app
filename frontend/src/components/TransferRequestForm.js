import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { useWallet } from '../contexts/WalletContext';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { ArrowRightLeft, Building2, DollarSign, Loader2, Info, AlertTriangle } from 'lucide-react';

const TransferRequestForm = ({ onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fromBankId: '',
        toBankId: '',
        amount: ''
    });
    const { web3Service, isConnected } = useWallet();
    const { toast } = useToast();
    const { banks } = useBlockchainData();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getSelectedBankInfo = (bankId) => {
        return banks.find(bank => bank.uniqueId === bankId);
    };

    const validateTransfer = () => {
        if (!formData.fromBankId || !formData.toBankId || !formData.amount) {
            return 'Please fill in all fields';
        }

        if (formData.fromBankId === formData.toBankId) {
            return 'Source and destination banks must be different';
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0) {
            return 'Amount must be greater than 0';
        }

        const fromBank = getSelectedBankInfo(formData.fromBankId);
        if (fromBank) {
            const availableBalance = parseInt(fromBank.availableSupply || 0);
            if (amount > availableBalance) {
                return `Insufficient funds. Available: ${availableBalance.toLocaleString()}`;
            }
        }

        return null;
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

        const validationError = validateTransfer();
        if (validationError) {
            toast({
                title: "Validation Error",
                description: validationError,
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const tx = await web3Service.requestBankTransfer(
                formData.fromBankId,
                formData.toBankId,
                parseInt(formData.amount)
            );

            toast({
                title: "Transfer Request Submitted",
                description: `Your transfer request has been submitted successfully. Transaction: ${tx.hash}`,
            });

            // Reset form
            setFormData({
                fromBankId: '',
                toBankId: '',
                amount: ''
            });

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Transfer request failed:', error);
            let errorMessage = 'Failed to submit transfer request. Please try again.';

            if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was rejected by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient ETH for gas fees';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection';
            } else if (error.message.includes('revert')) {
                errorMessage = 'Transaction failed: ' + (error.reason || 'Unknown blockchain error');
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

    const fromBank = getSelectedBankInfo(formData.fromBankId);
    const toBank = getSelectedBankInfo(formData.toBankId);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                    <span>Request Bank Transfer</span>
                </CardTitle>
                <CardDescription>
                    Submit a request to transfer funds between banks (requires admin approval)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bank Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* From Bank */}
                        <div className="space-y-2">
                            <Label className="flex items-center space-x-1">
                                <Building2 className="w-4 h-4" />
                                <span>From Bank</span>
                            </Label>
                            <Select
                                value={formData.fromBankId}
                                onValueChange={(value) => handleSelectChange('fromBankId', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select source bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map((bank) => (
                                        <SelectItem key={bank.uniqueId} value={bank.uniqueId}>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{bank.bankName}</span>
                                                <span className="text-sm text-gray-500">({bank.currencySymbol})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {fromBank && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 font-medium">Available Balance:</span>
                                        <span className="text-blue-900 font-bold">
                                            {parseInt(fromBank.availableSupply || 0).toLocaleString()} {fromBank.currencySymbol}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-blue-600">Exchange Rate:</span>
                                        <span className="text-blue-800">
                                            ${parseFloat(fromBank.currencyValue || 0).toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* To Bank */}
                        <div className="space-y-2">
                            <Label className="flex items-center space-x-1">
                                <Building2 className="w-4 h-4" />
                                <span>To Bank</span>
                            </Label>
                            <Select
                                value={formData.toBankId}
                                onValueChange={(value) => handleSelectChange('toBankId', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select destination bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks
                                        .filter(bank => bank.uniqueId !== formData.fromBankId)
                                        .map((bank) => (
                                            <SelectItem key={bank.uniqueId} value={bank.uniqueId}>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{bank.bankName}</span>
                                                    <span className="text-sm text-gray-500">({bank.currencySymbol})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {toBank && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-700 font-medium">Foreign Balance:</span>
                                        <span className="text-green-900 font-bold">
                                            {parseInt(toBank.foreignCurrencyBalance || 0).toLocaleString()} {toBank.currencySymbol}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-green-600">Exchange Rate:</span>
                                        <span className="text-green-800">
                                            ${parseFloat(toBank.currencyValue || 0).toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>Amount</span>
                            {fromBank && (
                                <span className="text-sm text-gray-500">
                                    (in {fromBank.currencySymbol})
                                </span>
                            )}
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter amount to transfer"
                            value={formData.amount}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="w-full"
                        />
                    </div>

                    {/* Transfer Summary */}
                    {fromBank && toBank && formData.amount && (
                        <div className="p-4 bg-gray-50 border rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Info className="w-4 h-4 mr-1" />
                                Transfer Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">From:</span>
                                    <span className="font-medium">{fromBank.bankName} ({fromBank.currencySymbol})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">To:</span>
                                    <span className="font-medium">{toBank.bankName} ({toBank.currencySymbol})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-medium">
                                        {parseInt(formData.amount || 0).toLocaleString()} {fromBank.currencySymbol}
                                    </span>
                                </div>
                                {fromBank.currencyValue && toBank.currencyValue && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estimated value in {toBank.currencySymbol}:</span>
                                        <span className="font-medium">
                                            {Math.round((parseInt(formData.amount || 0) * parseFloat(fromBank.currencyValue)) / parseFloat(toBank.currencyValue)).toLocaleString()} {toBank.currencySymbol}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Warning Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Important Notes:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Transfer requests require admin approval before execution</li>
                                    <li>• This will submit a transaction to the blockchain</li>
                                    <li>• You'll need ETH for gas fees</li>
                                    <li>• Funds will be held until the transfer is approved or rejected</li>
                                    <li>• Exchange rates are for estimation only</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !isConnected || banks.length < 2}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting Transfer Request...
                            </>
                        ) : (
                            <>
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Submit Transfer Request
                            </>
                        )}
                    </Button>

                    {!isConnected && (
                        <p className="text-sm text-gray-500 text-center">
                            Please connect your wallet to submit a transfer request
                        </p>
                    )}

                    {banks.length < 2 && (
                        <p className="text-sm text-gray-500 text-center">
                            At least 2 banks are required to make transfers
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};

export default TransferRequestForm;
