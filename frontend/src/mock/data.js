// Mock data for frontend development
export const MOCK_CONTRACT_OWNER = "0x1234567890123456789012345678901234567890";
export const MOCK_USER_ADDRESS = "0x9876543210987654321098765432109876543210";

export const MOCK_PENDING_REQUESTS = [
  {
    bankName: "First National Bank",
    currencyName: "US Dollar",
    currencySymbol: "USD",
    currencyValue: 1,
    submittedBy: "0x9876543210987654321098765432109876543210",
    approved: false,
    generatedId: "BNK-USD-001"
  },
  {
    bankName: "Euro Central Bank",
    currencyName: "Euro",
    currencySymbol: "EUR",
    currencyValue: 1.08,
    submittedBy: "0x1111222233334444555566667777888899990000",
    approved: false,
    generatedId: "BNK-EUR-001"
  }
];

export const MOCK_BANKS = [
  {
    uniqueId: "BNK-GBP-001",
    bankName: "Sterling Bank",
    currencyName: "British Pound",
    currencySymbol: "GBP",
    currencyValue: 1.27,
    createdBy: MOCK_CONTRACT_OWNER,
    bankAddress: "ADDR-BNK-GBP-001-1234567890",
    mintedSupply: 1000000,
    availableSupply: 850000,
    normalCurrencyBalance: 500000,
    foreignCurrencyBalance: 350000
  },
  {
    uniqueId: "BNK-JPY-001",
    bankName: "Tokyo Financial",
    currencyName: "Japanese Yen",
    currencySymbol: "JPY",
    currencyValue: 0.0067,
    createdBy: MOCK_CONTRACT_OWNER,
    bankAddress: "ADDR-BNK-JPY-001-1234567891",
    mintedSupply: 500000000,
    availableSupply: 425000000,
    normalCurrencyBalance: 300000000,
    foreignCurrencyBalance: 125000000
  }
];

export const MOCK_PENDING_TRANSFERS = [
  {
    transferId: "TRX-BNK-GBP-001-BNK-JPY-001-1234567892",
    fromBankId: "BNK-GBP-001",
    toBankId: "BNK-JPY-001",
    amount: 50000,
    currencyName: "British Pound",
    timestamp: Date.now() - 3600000,
    approved: false
  }
];

export const MOCK_TRANSFER_HISTORY = [
  {
    transferId: "TRX-BNK-JPY-001-BNK-GBP-001-1234567890",
    fromBankId: "BNK-JPY-001",
    toBankId: "BNK-GBP-001",
    amount: 1000000,
    currencyName: "Japanese Yen",
    timestamp: Date.now() - 86400000,
    approved: true
  },
  {
    transferId: "TRX-BNK-GBP-001-BNK-JPY-001-1234567891",
    fromBankId: "BNK-GBP-001",
    toBankId: "BNK-JPY-001",
    amount: 25000,
    currencyName: "British Pound",
    timestamp: Date.now() - 172800000,
    approved: true
  }
];

// Mock MetaMask connection
export const mockConnectWallet = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        address: MOCK_USER_ADDRESS,
        isOwner: false
      });
    }, 1000);
  });
};

export const mockConnectOwnerWallet = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        address: MOCK_CONTRACT_OWNER,
        isOwner: true
      });
    }, 1000);
  });
};

// Mock contract interactions
export const mockRequestBank = (bankData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock: Bank requested", bankData);
      resolve({ success: true, transactionHash: "0xmockhash123" });
    }, 2000);
  });
};

export const mockApproveBank = (bankId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock: Bank approved", bankId);
      resolve({ success: true, transactionHash: "0xmockhash456" });
    }, 2000);
  });
};

export const mockMintCoins = (bankId, amount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock: Coins minted", { bankId, amount });
      resolve({ success: true, transactionHash: "0xmockhash789" });
    }, 2000);
  });
};