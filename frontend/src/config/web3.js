import { ethers } from 'ethers';

// Contract Configuration
export const CONTRACT_ADDRESS = '0x232393ab02f826E0FF2803a24a5dE1AFbd28c1bd';
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
export const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/JDzB8rN_botMO-8TUoj5kSoUUe8736-x';

// Contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      }
    ],
    "name": "approveBankToBankTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "uniqueId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankAddress",
        "type": "string"
      }
    ],
    "name": "BankApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "submittedBy",
        "type": "address"
      }
    ],
    "name": "BankRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      }
    ],
    "name": "BankTransferApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      }
    ],
    "name": "BankTransferRejected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "CoinsMinted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "inputId",
        "type": "string"
      }
    ],
    "name": "generateBank",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mintCoins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fromBankId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "toBankId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PendingBankTransfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      }
    ],
    "name": "rejectBankToBankTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_bankName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_currencyName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_currencySymbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_currencyValue",
        "type": "uint256"
      }
    ],
    "name": "requestBank",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "fromBankId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "toBankId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "requestBankToBankTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bankIds",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "banks",
    "outputs": [
      {
        "internalType": "string",
        "name": "uniqueId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "currencyName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "currencySymbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "currencyValue",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "createdBy",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "bankAddress",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "mintedSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "availableSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "normalCurrencyBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "foreignCurrencyBalance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "bankSerialCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bankTransferHistory",
    "outputs": [
      {
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fromBankId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "toBankId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "currencyName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      }
    ],
    "name": "getBankTransferHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "transferId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fromBankId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "toBankId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currencyName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "internalType": "struct BankRequests.BankTransferRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingRequests",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "bankName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currencyName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currencySymbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "currencyValue",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "submittedBy",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "generatedId",
            "type": "string"
          }
        ],
        "internalType": "struct BankRequests.BankRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pendingBankTransfers",
    "outputs": [
      {
        "internalType": "string",
        "name": "transferId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fromBankId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "toBankId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "currencyName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pendingRequests",
    "outputs": [
      {
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "currencyName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "currencySymbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "currencyValue",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "submittedBy",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "generatedId",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankId",
        "type": "string"
      }
    ],
    "name": "viewPendingTransactions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "transferId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fromBankId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "toBankId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currencyName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "internalType": "struct BankRequests.BankTransferRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Web3 Provider
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to read-only provider
  return new ethers.JsonRpcProvider(RPC_URL);
};

// Get contract instance
export const getContract = async (provider, withSigner = false) => {
  if (withSigner && provider.getSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Network helper
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SepoliaETH',
    decimals: 18,
  },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};