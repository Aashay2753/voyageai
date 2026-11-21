from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


def gen_uuid():
    return str(uuid.uuid4())


class BudgetTier(str, enum.Enum):
    budget = "budget"
    standard = "standard"
    luxury = "luxury"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    trips = relationship("Trip", back_populates="user", cascade="all, delete")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete")


class Trip(Base):
    __tablename__ = "trips"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destination = Column(String, nullable=False)
    title = Column(String, nullable=False)
    duration_days = Column(Integer, nullable=False)
    budget_tier = Column(Enum(BudgetTier), default=BudgetTier.standard)
    total_budget = Column(Float, nullable=True)
    currency = Column(String, default="INR")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    itinerary = Column(JSON, nullable=True)  # Full AI-generated itinerary
    is_saved = Column(Boolean, default=False)
    is_shared = Column(Boolean, default=False)
    share_token = Column(String, unique=True, nullable=True)
    prompt_used = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="trips")


class Destination(Base):
    __tablename__ = "destinations"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    region = Column(String, nullable=True)
    description = Column(Text)
    image_url = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    avg_budget_inr = Column(Float)
    best_months = Column(JSON)  # List of month numbers
    tags = Column(JSON)  # ["beach", "culture", "nightlife"]
    visa_required_for_indian = Column(Boolean, default=False)
    language = Column(String)
    currency = Column(String)
    timezone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatHistory(Base):
    __tablename__ = "chat_histories"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String, nullable=False, index=True)
    messages = Column(JSON, default=list)  # [{role, content, timestamp}]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="chat_histories")
