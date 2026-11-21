from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# Auth
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    is_premium: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Trip / Itinerary
class TripCreate(BaseModel):
    prompt: str
    destination: Optional[str] = None
    duration_days: Optional[int] = None
    budget_tier: Optional[str] = "standard"
    budget_amount: Optional[float] = None
    num_people: Optional[int] = 1
    travel_style: Optional[str] = None


class TripOut(BaseModel):
    id: str
    destination: str
    title: str
    duration_days: int
    budget_tier: str
    total_budget: Optional[float]
    itinerary: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


# Chat
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    gemini_error: Optional[str] = None


# Destination
class DestinationOut(BaseModel):
    id: str
    name: str
    country: str
    description: str
    image_url: Optional[str]
    avg_budget_inr: Optional[float]
    tags: Optional[List[str]]
    best_months: Optional[List[int]]

    class Config:
        from_attributes = True
