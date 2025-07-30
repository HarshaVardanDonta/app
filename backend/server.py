from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

# Import blockchain service
from services.blockchain_service import blockchain_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

# Create the main app without a prefix
app = FastAPI(title="Bank Manager API", description="API for managing blockchain banks", lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class BankRequest(BaseModel):
    bankName: str
    currencyName: str
    currencySymbol: str
    currencyValue: float
    submittedBy: str
    approved: bool
    generatedId: str

class Bank(BaseModel):
    uniqueId: str
    bankName: str
    currencyName: str
    currencySymbol: str
    currencyValue: float
    createdBy: str
    bankAddress: str
    mintedSupply: int
    availableSupply: int
    normalCurrencyBalance: int
    foreignCurrencyBalance: int

class Transfer(BaseModel):
    transferId: str
    fromBankId: str
    toBankId: str
    amount: int
    currencyName: str
    timestamp: int
    approved: bool

class OwnershipCheck(BaseModel):
    address: str

class OwnershipResponse(BaseModel):
    address: str
    isOwner: bool
    contractOwner: str

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Bank Manager API", "status": "connected", "blockchain_connected": blockchain_service.is_connected()}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Blockchain Routes

# Contract info
@api_router.get("/contract/owner")
async def get_contract_owner():
    """Get the contract owner address"""
    try:
        owner = blockchain_service.get_contract_owner()
        return {"owner": owner}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/contract/check-ownership", response_model=OwnershipResponse)
async def check_ownership(request: OwnershipCheck):
    """Check if an address is the contract owner"""
    try:
        is_owner = blockchain_service.is_owner(request.address)
        contract_owner = blockchain_service.get_contract_owner()
        
        return OwnershipResponse(
            address=request.address,
            isOwner=is_owner,
            contractOwner=contract_owner
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Bank requests
@api_router.get("/banks/requests/pending", response_model=List[BankRequest])
async def get_pending_requests():
    """Get all pending bank requests"""
    try:
        requests = blockchain_service.get_pending_requests()
        return [BankRequest(**request) for request in requests]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Banks
@api_router.get("/banks", response_model=List[Bank])
async def get_all_banks():
    """Get all banks"""
    try:
        banks = blockchain_service.get_all_banks()
        return [Bank(**bank) for bank in banks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/banks/ids")
async def get_bank_ids():
    """Get all bank IDs"""
    try:
        bank_ids = blockchain_service.get_bank_ids()
        return {"bankIds": bank_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/banks/{bank_id}", response_model=Bank)
async def get_bank_details(bank_id: str):
    """Get details for a specific bank"""
    try:
        bank = blockchain_service.get_bank_details(bank_id)
        return Bank(**bank)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Transfers
@api_router.get("/transfers/pending", response_model=List[Transfer])
async def get_all_pending_transfers():
    """Get all pending transfers"""
    try:
        transfers = blockchain_service.get_all_pending_transfers()
        return [Transfer(**transfer) for transfer in transfers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/transfers/history", response_model=List[Transfer])
async def get_all_transfer_history():
    """Get all transfer history"""
    try:
        transfers = blockchain_service.get_all_transfer_history()
        return [Transfer(**transfer) for transfer in transfers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/banks/{bank_id}/transfers/pending", response_model=List[Transfer])
async def get_bank_pending_transfers(bank_id: str):
    """Get pending transfers for a specific bank"""
    try:
        transfers = blockchain_service.get_pending_transfers(bank_id)
        return [Transfer(**transfer) for transfer in transfers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/banks/{bank_id}/transfers/history", response_model=List[Transfer])
async def get_bank_transfer_history(bank_id: str):
    """Get transfer history for a specific bank"""
    try:
        transfers = blockchain_service.get_transfer_history(bank_id)
        return [Transfer(**transfer) for transfer in transfers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Events
@api_router.get("/events/{event_name}")
async def get_recent_events(event_name: str, from_block: int = 0):
    """Get recent events from the contract"""
    try:
        events = blockchain_service.get_recent_events(event_name, from_block)
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Utility
@api_router.get("/transaction/{tx_hash}")
async def get_transaction_receipt(tx_hash: str):
    """Get transaction receipt"""
    try:
        receipt = blockchain_service.get_transaction_receipt(tx_hash)
        return receipt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/validate-address/{address}")
async def validate_address(address: str):
    """Validate Ethereum address"""
    try:
        is_valid = blockchain_service.validate_address(address)
        return {"address": address, "isValid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        blockchain_connected = blockchain_service.is_connected()
        return {
            "status": "healthy",
            "blockchain_connected": blockchain_connected,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
