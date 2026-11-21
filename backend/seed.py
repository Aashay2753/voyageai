"""
Run this script to seed the database with destination data.
Usage: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.models import Destination
import uuid

DESTINATIONS = [
    {"name": "Goa", "country": "India", "region": "Western India", "description": "Sun-soaked beaches, vibrant nightlife, Portuguese heritage, and incredible seafood make Goa India's ultimate beach destination.", "latitude": 15.2993, "longitude": 74.1240, "avg_budget_inr": 12000, "best_months": [10, 11, 12, 1, 2, 3], "tags": ["beach", "nightlife", "culture", "seafood", "water sports"], "visa_required_for_indian": False, "language": "Konkani, English", "currency": "INR", "timezone": "Asia/Kolkata"},
    {"name": "Bali", "country": "Indonesia", "region": "Southeast Asia", "description": "Island of the Gods — volcanic mountains, terraced rice paddies, iconic temples, and world-class surf beaches.", "latitude": -8.3405, "longitude": 115.0920, "avg_budget_inr": 40000, "best_months": [4, 5, 6, 7, 8, 9], "tags": ["culture", "temples", "beaches", "surfing", "wellness"], "visa_required_for_indian": True, "language": "Balinese, Indonesian", "currency": "IDR", "timezone": "Asia/Makassar"},
    {"name": "Manali", "country": "India", "region": "Himachal Pradesh", "description": "Snow-capped peaks, adventure sports, and the mystical Rohtang Pass make Manali India's top mountain escape.", "latitude": 32.2432, "longitude": 77.1892, "avg_budget_inr": 12000, "best_months": [5, 6, 9, 10], "tags": ["mountains", "adventure", "trekking", "snow", "scenic"], "visa_required_for_indian": False, "language": "Hindi, Manali dialect", "currency": "INR", "timezone": "Asia/Kolkata"},
    {"name": "Dubai", "country": "UAE", "region": "Middle East", "description": "World records, luxury shopping, desert safaris, and the iconic Burj Khalifa — Dubai delivers spectacle at every turn.", "latitude": 25.2048, "longitude": 55.2708, "avg_budget_inr": 65000, "best_months": [10, 11, 12, 1, 2, 3], "tags": ["luxury", "shopping", "architecture", "desert", "family"], "visa_required_for_indian": True, "language": "Arabic, English", "currency": "AED", "timezone": "Asia/Dubai"},
    {"name": "Paris", "country": "France", "region": "Western Europe", "description": "The City of Light — Eiffel Tower, world-class museums, haute cuisine, and timeless romance on the Seine.", "latitude": 48.8566, "longitude": 2.3522, "avg_budget_inr": 120000, "best_months": [4, 5, 6, 9, 10], "tags": ["romance", "art", "culture", "food", "architecture"], "visa_required_for_indian": True, "language": "French", "currency": "EUR", "timezone": "Europe/Paris"},
    {"name": "Thailand", "country": "Thailand", "region": "Southeast Asia", "description": "Golden temples, tropical islands, street food paradise, and warm smiles — Thailand captivates every sense.", "latitude": 13.7563, "longitude": 100.5018, "avg_budget_inr": 28000, "best_months": [11, 12, 1, 2, 3, 4], "tags": ["temples", "beaches", "street food", "nightlife", "elephants"], "visa_required_for_indian": False, "language": "Thai", "currency": "THB", "timezone": "Asia/Bangkok"},
    {"name": "Ladakh", "country": "India", "region": "Jammu & Kashmir", "description": "The Land of High Passes — surreal landscapes, Buddhist monasteries, and the world's highest motorable roads.", "latitude": 34.1526, "longitude": 77.5771, "avg_budget_inr": 18000, "best_months": [6, 7, 8, 9], "tags": ["mountains", "adventure", "monasteries", "scenic", "motorcycling"], "visa_required_for_indian": False, "language": "Ladakhi, Hindi", "currency": "INR", "timezone": "Asia/Kolkata"},
    {"name": "Singapore", "country": "Singapore", "region": "Southeast Asia", "description": "Garden city meets futuristic skyline — Marina Bay Sands, diverse hawker food, and spotless streets.", "latitude": 1.3521, "longitude": 103.8198, "avg_budget_inr": 55000, "best_months": [2, 3, 7, 8], "tags": ["modern", "food", "family", "shopping", "clean"], "visa_required_for_indian": False, "language": "English, Mandarin, Malay", "currency": "SGD", "timezone": "Asia/Singapore"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Destination).count()
        if existing > 0:
            print(f"✅ Database already has {existing} destinations. Skipping seed.")
            return

        for d in DESTINATIONS:
            dest = Destination(id=str(uuid.uuid4()), **d)
            db.add(dest)

        db.commit()
        print(f"✅ Seeded {len(DESTINATIONS)} destinations successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
