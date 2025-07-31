import { ethers } from 'ethers';
import { getProvider, getContract, CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID, SEPOLIA_NETWORK } from '../config/web3';

class Web3Service {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.provider = getProvider();
      this.signer = await this.provider.getSigner();

      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt('11155111')) { // Sepolia chain ID
        await this.switchToSepolia();
      }

      // Get contract instance with signer
      this.contract = await getContract(this.provider, true);

      return {
        address: accounts[0],
        chainId: network.chainId.toString(),
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Switch to Sepolia network
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        throw switchError;
      }
    }
  }

  // Get current account
  async getCurrentAccount() {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const accounts = await this.provider.listAccounts();
    return accounts[0]?.address || null;
  }

  // Check if current account is contract owner
  async isContractOwner() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const owner = await this.contract.owner();
      const currentAccount = await this.getCurrentAccount();
      return owner.toLowerCase() === currentAccount.toLowerCase();
    } catch (error) {
      console.error('Failed to check ownership:', error);
      return false;
    }
  }

  // Contract Read Methods

  async getPendingRequests() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const requests = await this.contract.getPendingRequests();
      return requests.map(request => ({
        bankName: request.bankName,
        currencyName: request.currencyName,
        currencySymbol: request.currencySymbol,
        currencyValue: ethers.formatUnits(request.currencyValue, 0),
        submittedBy: request.submittedBy,
        approved: request.approved,
        generatedId: request.generatedId,
      }));
    } catch (error) {
      console.error('Failed to get pending requests:', error);
      throw error;
    }
  }

  async getBankIds() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const bankIds = [];
      let index = 0;

      while (true) {
        try {
          const bankId = await this.contract.bankIds(index);
          if (bankId) {
            bankIds.push(bankId);
            index++;
          } else {
            break;
          }
        } catch (error) {
          // No more bank IDs
          break;
        }
      }

      return bankIds;
    } catch (error) {
      console.error('Failed to get bank IDs:', error);
      throw error;
    }
  }

  async getBankDetails(bankId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const bank = await this.contract.banks(bankId);
      return {
        uniqueId: bank.uniqueId,
        bankName: bank.bankName,
        currencyName: bank.currencyName,
        currencySymbol: bank.currencySymbol,
        currencyValue: ethers.formatUnits(bank.currencyValue, 0),
        createdBy: bank.createdBy,
        bankAddress: bank.bankAddress,
        mintedSupply: ethers.formatUnits(bank.mintedSupply, 0),
        availableSupply: ethers.formatUnits(bank.availableSupply, 0),
        normalCurrencyBalance: ethers.formatUnits(bank.normalCurrencyBalance, 0),
        foreignCurrencyBalance: ethers.formatUnits(bank.foreignCurrencyBalance, 0),
      };
    } catch (error) {
      console.error('Failed to get bank details:', error);
      throw error;
    }
  }

  async getAllBanks() {
    try {
      const bankIds = await this.getBankIds();
      const banks = [];

      for (const bankId of bankIds) {
        const bankDetails = await this.getBankDetails(bankId);
        banks.push(bankDetails);
      }

      return banks;
    } catch (error) {
      console.error('Failed to get all banks:', error);
      throw error;
    }
  }

  async getPendingTransfers(bankId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transfers = await this.contract.viewPendingTransactions(bankId);
      return transfers.map(transfer => ({
        transferId: transfer.transferId,
        fromBankId: transfer.fromBankId,
        toBankId: transfer.toBankId,
        amount: ethers.formatUnits(transfer.amount, 0),
        currencyName: transfer.currencyName,
        timestamp: parseInt(transfer.timestamp.toString()) * 1000,
        approved: transfer.approved,
      }));
    } catch (error) {
      console.error('Failed to get pending transfers:', error);
      throw error;
    }
  }

  async getTransferHistory(bankId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transfers = await this.contract.getBankTransferHistory(bankId);
      return transfers.map(transfer => ({
        transferId: transfer.transferId,
        fromBankId: transfer.fromBankId,
        toBankId: transfer.toBankId,
        amount: ethers.formatUnits(transfer.amount, 0),
        currencyName: transfer.currencyName,
        timestamp: parseInt(transfer.timestamp.toString()) * 1000,
        approved: transfer.approved,
      }));
    } catch (error) {
      console.error('Failed to get transfer history:', error);
      throw error;
    }
  }

  // Contract Write Methods

  async requestBank(bankName, currencyName, currencySymbol, currencyValue) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Convert currency value to wei (assuming it's a decimal)
      const valueInWei = ethers.parseUnits(currencyValue.toString(), 0);

      const tx = await this.contract.requestBank(
        bankName,
        currencyName,
        currencySymbol,
        valueInWei
      );

      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Failed to request bank:', error);
      throw error;
    }
  }

  async generateBank(bankId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.generateBank(bankId);

      // Try to wait for the transaction, but handle rate limiting gracefully
      try {
        await tx.wait();
      } catch (waitError) {
        // If we get rate limiting error while waiting, don't fail the whole operation
        if (waitError.message?.includes('rate limit') ||
          waitError.code === -32005 ||
          waitError.message?.includes('could not coalesce error')) {
          console.warn('Rate limiting while waiting for transaction, but transaction was submitted:', tx.hash);
        } else {
          throw waitError;
        }
      }

      return tx;
    } catch (error) {
      console.error('Failed to generate bank:', error);
      throw error;
    }
  }

  async mintCoins(bankId, amount) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 0);
      const tx = await this.contract.mintCoins(bankId, amountInWei);

      // Try to wait for the transaction, but handle rate limiting gracefully
      try {
        await tx.wait();
      } catch (waitError) {
        // If we get rate limiting error while waiting, don't fail the whole operation
        if (waitError.message?.includes('rate limit') ||
          waitError.code === -32005 ||
          waitError.message?.includes('could not coalesce error')) {
          console.warn('Rate limiting while waiting for transaction, but transaction was submitted:', tx.hash);
        } else {
          throw waitError;
        }
      }

      return tx;
    } catch (error) {
      console.error('Failed to mint coins:', error);
      throw error;
    }
  }

  async requestBankTransfer(fromBankId, toBankId, amount) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 0);
      const tx = await this.contract.requestBankToBankTransfer(fromBankId, toBankId, amountInWei);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Failed to request bank transfer:', error);
      throw error;
    }
  }

  async approveBankTransfer(bankId, transferId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.approveBankToBankTransfer(bankId, transferId);

      // Try to wait for the transaction, but handle rate limiting gracefully
      try {
        await tx.wait();
      } catch (waitError) {
        // If we get rate limiting error while waiting, don't fail the whole operation
        if (waitError.message?.includes('rate limit') ||
          waitError.code === -32005 ||
          waitError.message?.includes('could not coalesce error')) {
          console.warn('Rate limiting while waiting for transaction, but transaction was submitted:', tx.hash);
        } else {
          throw waitError;
        }
      }

      return tx;
    } catch (error) {
      console.error('Failed to approve bank transfer:', error);
      throw error;
    }
  }

  async rejectBankTransfer(bankId, transferId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.rejectBankToBankTransfer(bankId, transferId);

      // Try to wait for the transaction, but handle rate limiting gracefully
      try {
        await tx.wait();
      } catch (waitError) {
        // If we get rate limiting error while waiting, don't fail the whole operation
        if (waitError.message?.includes('rate limit') ||
          waitError.code === -32005 ||
          waitError.message?.includes('could not coalesce error')) {
          console.warn('Rate limiting while waiting for transaction, but transaction was submitted:', tx.hash);
        } else {
          throw waitError;
        }
      }

      return tx;
    } catch (error) {
      console.error('Failed to reject bank transfer:', error);
      throw error;
    }
  }

  // Event listening
  listenToEvents(eventName, callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    this.contract.on(eventName, callback);
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
const web3Service = new Web3Service();
export default web3Service;