from typing import List, Dict, Any
from web3 import Web3
from web3.exceptions import BlockchainError, TransactionNotFound
import logging

from config.web3_config import get_web3, get_contract, CONTRACT_ADDRESS

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self):
        self.w3 = get_web3()
        self.contract = get_contract()
    
    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        try:
            return self.w3.is_connected()
        except Exception as e:
            logger.error(f"Connection check failed: {e}")
            return False
    
    def get_contract_owner(self) -> str:
        """Get the contract owner address"""
        try:
            return self.contract.functions.owner().call()
        except Exception as e:
            logger.error(f"Failed to get contract owner: {e}")
            raise
    
    def is_owner(self, address: str) -> bool:
        """Check if an address is the contract owner"""
        try:
            owner = self.get_contract_owner()
            return owner.lower() == address.lower()
        except Exception as e:
            logger.error(f"Failed to check ownership: {e}")
            return False
    
    # READ OPERATIONS
    
    def get_pending_requests(self) -> List[Dict[str, Any]]:
        """Get all pending bank requests"""
        try:
            requests = self.contract.functions.getPendingRequests().call()
            
            formatted_requests = []
            for request in requests:
                formatted_requests.append({
                    'bankName': request[0],
                    'currencyName': request[1],
                    'currencySymbol': request[2],
                    'currencyValue': float(request[3]),
                    'submittedBy': request[4],
                    'approved': request[5],
                    'generatedId': request[6]
                })
            
            return formatted_requests
        except Exception as e:
            logger.error(f"Failed to get pending requests: {e}")
            raise
    
    def get_bank_ids(self) -> List[str]:
        """Get all bank IDs"""
        try:
            bank_ids = []
            index = 0
            
            while True:
                try:
                    bank_id = self.contract.functions.bankIds(index).call()
                    if bank_id:
                        bank_ids.append(bank_id)
                        index += 1
                    else:
                        break
                except:
                    # No more bank IDs
                    break
            
            return bank_ids
        except Exception as e:
            logger.error(f"Failed to get bank IDs: {e}")
            raise
    
    def get_bank_details(self, bank_id: str) -> Dict[str, Any]:
        """Get details for a specific bank"""
        try:
            bank = self.contract.functions.banks(bank_id).call()
            
            return {
                'uniqueId': bank[0],
                'bankName': bank[1],
                'currencyName': bank[2],
                'currencySymbol': bank[3],
                'currencyValue': float(bank[4]),
                'createdBy': bank[5],
                'bankAddress': bank[6],
                'mintedSupply': int(bank[7]),
                'availableSupply': int(bank[8]),
                'normalCurrencyBalance': int(bank[9]),
                'foreignCurrencyBalance': int(bank[10])
            }
        except Exception as e:
            logger.error(f"Failed to get bank details for {bank_id}: {e}")
            raise
    
    def get_all_banks(self) -> List[Dict[str, Any]]:
        """Get details for all banks"""
        try:
            bank_ids = self.get_bank_ids()
            banks = []
            
            for bank_id in bank_ids:
                try:
                    bank_details = self.get_bank_details(bank_id)
                    banks.append(bank_details)
                except Exception as e:
                    logger.warning(f"Failed to get details for bank {bank_id}: {e}")
                    continue
            
            return banks
        except Exception as e:
            logger.error(f"Failed to get all banks: {e}")
            raise
    
    def get_pending_transfers(self, bank_id: str) -> List[Dict[str, Any]]:
        """Get pending transfers for a specific bank"""
        try:
            transfers = self.contract.functions.viewPendingTransactions(bank_id).call()
            
            formatted_transfers = []
            for transfer in transfers:
                formatted_transfers.append({
                    'transferId': transfer[0],
                    'fromBankId': transfer[1],
                    'toBankId': transfer[2],
                    'amount': int(transfer[3]),
                    'currencyName': transfer[4],
                    'timestamp': int(transfer[5]) * 1000,  # Convert to milliseconds
                    'approved': transfer[6]
                })
            
            return formatted_transfers
        except Exception as e:
            logger.error(f"Failed to get pending transfers for {bank_id}: {e}")
            raise
    
    def get_transfer_history(self, bank_id: str) -> List[Dict[str, Any]]:
        """Get transfer history for a specific bank"""
        try:
            transfers = self.contract.functions.getBankTransferHistory(bank_id).call()
            
            formatted_transfers = []
            for transfer in transfers:
                formatted_transfers.append({
                    'transferId': transfer[0],
                    'fromBankId': transfer[1],
                    'toBankId': transfer[2],
                    'amount': int(transfer[3]),
                    'currencyName': transfer[4],
                    'timestamp': int(transfer[5]) * 1000,  # Convert to milliseconds
                    'approved': transfer[6]
                })
            
            return formatted_transfers
        except Exception as e:
            logger.error(f"Failed to get transfer history for {bank_id}: {e}")
            raise
    
    def get_all_pending_transfers(self) -> List[Dict[str, Any]]:
        """Get all pending transfers across all banks"""
        try:
            bank_ids = self.get_bank_ids()
            all_transfers = []
            
            for bank_id in bank_ids:
                try:
                    transfers = self.get_pending_transfers(bank_id)
                    all_transfers.extend(transfers)
                except Exception as e:
                    logger.warning(f"Failed to get pending transfers for {bank_id}: {e}")
                    continue
            
            return all_transfers
        except Exception as e:
            logger.error(f"Failed to get all pending transfers: {e}")
            raise
    
    def get_all_transfer_history(self) -> List[Dict[str, Any]]:
        """Get all transfer history across all banks"""
        try:
            bank_ids = self.get_bank_ids()
            all_transfers = []
            transfer_ids = set()  # To avoid duplicates
            
            for bank_id in bank_ids:
                try:
                    transfers = self.get_transfer_history(bank_id)
                    for transfer in transfers:
                        if transfer['transferId'] not in transfer_ids:
                            transfer_ids.add(transfer['transferId'])
                            all_transfers.append(transfer)
                except Exception as e:
                    logger.warning(f"Failed to get transfer history for {bank_id}: {e}")
                    continue
            
            return all_transfers
        except Exception as e:
            logger.error(f"Failed to get all transfer history: {e}")
            raise
    
    # EVENT HANDLING
    
    def get_recent_events(self, event_name: str, from_block: int = 0) -> List[Dict[str, Any]]:
        """Get recent events from the contract"""
        try:
            event_filter = getattr(self.contract.events, event_name).create_filter(
                fromBlock=from_block,
                toBlock='latest'
            )
            
            events = event_filter.get_all_entries()
            
            formatted_events = []
            for event in events:
                formatted_events.append({
                    'event': event_name,
                    'blockNumber': event['blockNumber'],
                    'transactionHash': event['transactionHash'].hex(),
                    'args': dict(event['args'])
                })
            
            return formatted_events
        except Exception as e:
            logger.error(f"Failed to get {event_name} events: {e}")
            raise
    
    # UTILITY METHODS
    
    def get_transaction_receipt(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction receipt"""
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return {
                'transactionHash': receipt['transactionHash'].hex(),
                'blockNumber': receipt['blockNumber'],
                'gasUsed': receipt['gasUsed'],
                'status': receipt['status']
            }
        except TransactionNotFound:
            logger.error(f"Transaction {tx_hash} not found")
            raise
        except Exception as e:
            logger.error(f"Failed to get transaction receipt for {tx_hash}: {e}")
            raise
    
    def validate_address(self, address: str) -> bool:
        """Validate Ethereum address"""
        try:
            return Web3.is_address(address)
        except Exception:
            return False

# Singleton instance
blockchain_service = BlockchainService()