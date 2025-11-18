from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schemas import LoginRequest, LoginResponse
from backend.auth import verify_password, create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Admin login endpoint
    Returns JWT token for authenticated requests
    """
    if not verify_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token = create_access_token(data={"sub": "admin", "role": "admin"})
    
    return LoginResponse(access_token=access_token)

@router.get("/verify")
async def verify_auth(authorization: Optional[str] = Header(None)):
    """
    Verify if token is valid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    
    return {
        "valid": True,
        "user": payload.get("sub"),
        "role": payload.get("role")
    }
