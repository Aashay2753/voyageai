"""
AI Itinerary Generation Service
Uses Google Gemini to generate structured travel itineraries.
Falls back to mock data if Gemini API key is not configured.
"""
import json
import re
from typing import Optional
from app.core.config import settings


SYSTEM_PROMPT = """You are VoyageAI, an expert travel planner with deep knowledge of global destinations, 
hotels, restaurants, and activities. You specialize in Indian travelers.

When given a travel request, generate a COMPLETE, DETAILED itinerary as valid JSON.
Respond ONLY with valid JSON, no markdown, no explanation.

JSON structure:
{
  "destination": "City, Country",
  "title": "Trip title",
  "duration_days": 3,
  "total_budget_inr": 15000,
  "budget_breakdown": {
    "accommodation": 7500,
    "food": 2400,
    "transport": 1600,
    "activities": 3500
  },
  "best_time": "October to March",
  "weather": "28°C, sunny",
  "highlights": ["Beach", "Culture", "Food"],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "theme": "Theme description",
      "activities": [
        {
          "time": "10:00 AM",
          "title": "Activity name",
          "description": "Brief description",
          "type": "hotel|food|activity|transport",
          "duration": "2 hours",
          "cost_inr": 500,
          "location": "Place name",
          "tips": "Insider tip"
        }
      ]
    }
  ],
  "hotels": [
    {"name": "Hotel name", "type": "budget|standard|luxury", "price_per_night_inr": 2500, "rating": 4.2, "area": "Beach area"}
  ],
  "restaurants": [
    {"name": "Restaurant", "cuisine": "Seafood", "avg_cost_inr": 600, "must_try": "Dish name"}
  ],
  "transport": {
    "how_to_reach": "Fly to Goa Airport (GOI)",
    "local_transport": ["Auto-rickshaw", "Bike rental", "Taxi"],
    "avg_local_cost_inr": 400
  },
  "visa_info": "Not required for Indian citizens",
  "packing_tips": ["Sunscreen", "Light cotton clothes"],
  "emergency_contacts": {"police": "100", "ambulance": "108"}
}"""


def extract_destination(prompt: str) -> str:
    prompt_clean = prompt.strip()
    
    # Try looking for patterns like "to [Destination]" or "in [Destination]"
    match_to = re.search(r'\bto\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', prompt)
    if match_to:
        return match_to.group(1)
        
    match_in = re.search(r'\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', prompt)
    if match_in:
        return match_in.group(1)
        
    # Search for common destinations
    common_destinations = [
        "Goa", "Bali", "Dubai", "Manali", "Paris", "Tokyo", "London", 
        "Singapore", "Mumbai", "Delhi", "Bangalore", "Kochi", "Srinagar", 
        "Ladakh", "Jaipur", "Udaipur", "Agra", "Thailand", "Bangkok", 
        "Phuket", "Maldives", "Switzerland"
    ]
    for dest in common_destinations:
        if dest.lower() in prompt.lower():
            return dest
            
    # Check for capitalized words excluding start of sentence or common words
    words = prompt.split()
    for i, word in enumerate(words):
        word_clean = re.sub(r'[^a-zA-Z]', '', word)
        if word_clean and word_clean[0].isupper() and i > 0:
            if word_clean.lower() not in ["the", "day", "days", "budget", "standard", "luxury", "trip", "tour", "travel", "my", "our"]:
                return word_clean
                
    return "Goa"


def extract_duration(prompt: str) -> int:
    match = re.search(r'(\d+)\s*-?\s*days?', prompt, re.IGNORECASE)
    if match:
        return min(max(int(match.group(1)), 1), 7)
    return 3


def extract_budget(prompt: str, budget_tier: str) -> int:
    prompt_clean = prompt.replace(",", "")
    match_k = re.search(r'(\d+)\s*k\b', prompt_clean, re.IGNORECASE)
    if match_k:
        return int(match_k.group(1)) * 1000
    match_num = re.search(r'\b(\d{4,6})\b', prompt_clean)
    if match_num:
        return int(match_num.group(1))
        
    if budget_tier.lower() == "luxury":
        return 75000
    elif budget_tier.lower() == "standard":
        return 25000
    else:
        return 12000


def generate_dynamic_mock_itinerary(prompt: str, budget_tier: str) -> dict:
    dest = extract_destination(prompt)
    days_count = extract_duration(prompt)
    total_budget = extract_budget(prompt, budget_tier)
    
    accom_pct = 0.50
    food_pct = 0.16
    trans_pct = 0.14
    act_pct = 0.20
    
    accommodation_cost = int(total_budget * accom_pct)
    food_cost = int(total_budget * food_pct)
    transport_cost = int(total_budget * trans_pct)
    activities_cost = int(total_budget * act_pct)
    
    dest_lower = dest.lower()
    
    if "manali" in dest_lower:
        best_time = "October to June"
        weather = "15°C, cool and pleasant"
        highlights = ["Snow & Mountains", "Solang Valley Adventure", "Hadimba Temple", "Old Manali Cafes"]
        
        all_activities = [
            [
                {"time": "09:00 AM", "title": "Arrive in Manali", "description": "Check in to hotel/resort", "type": "hotel", "duration": "1.5 hours", "cost_inr": 1500, "location": "Mall Road Area", "tips": "Take a Volvo bus from Delhi/Chandigarh for a comfortable overnight journey"},
                {"time": "01:00 PM", "title": "Lunch at Cafe 1947", "description": "Manali's first music cafe on the banks of Beas river", "type": "food", "duration": "1.5 hours", "cost_inr": 500, "location": "Old Manali", "tips": "Try their wood-fired pizzas and trout fish"},
                {"time": "03:00 PM", "title": "Hadimba Temple & Van Vihar", "description": "Historic wooden temple surrounded by dense cedar forests", "type": "activity", "duration": "2 hours", "cost_inr": 50, "location": "Hadimba Temple Road", "tips": "Watch out for local vendors offering pictures with rabbits/yaks"},
                {"time": "06:00 PM", "title": "Stroll on Mall Road", "description": "Bustling central street for shopping, snacks, and local culture", "type": "activity", "duration": "2 hours", "cost_inr": 100, "location": "Mall Road", "tips": "Try the hot gulab jamuns and softy ice cream"},
            ],
            [
                {"time": "09:00 AM", "title": "Solang Valley Adventure", "description": "Hub for paragliding, zorbing, and cable car rides", "type": "activity", "duration": "4 hours", "cost_inr": 2500, "location": "Solang Valley", "tips": "Book paragliding from government-certified pilots only"},
                {"time": "01:30 PM", "title": "Lunch at Solang Valley", "description": "Local Himachali cuisine at a mountain view restaurant", "type": "food", "duration": "1 hour", "cost_inr": 300, "location": "Solang", "tips": "Try Siddu, a traditional Himachali steamed bread"},
                {"time": "03:00 PM", "title": "Anjani Mahadev Temple Trek", "description": "Short 2km trek to see a natural ice lingam", "type": "activity", "duration": "2 hours", "cost_inr": 0, "location": "Solang", "tips": "Rent snow boots at the valley base if trekking in winter"},
                {"time": "07:00 PM", "title": "Dinner at Il Forno", "description": "Charming Italian restaurant in a rustic heritage building", "type": "food", "duration": "1.5 hours", "cost_inr": 600, "location": "Hadimba Road", "tips": "Great views of the valley from the garden terrace"},
            ],
            [
                {"time": "08:00 AM", "title": "Rohtang Pass & Snow View", "description": "High mountain pass with spectacular glacier views", "type": "activity", "duration": "5 hours", "cost_inr": 1500, "location": "Rohtang Pass", "tips": "Requires a permit. Best to book a local cab a day in advance"},
                {"time": "02:00 PM", "title": "Lunch in Vashisht Village", "description": "Casual lunch near the hot springs", "type": "food", "duration": "1 hour", "cost_inr": 250, "location": "Vashisht", "tips": "Try the fresh hot rajma chawal"},
                {"time": "03:30 PM", "title": "Jogini Waterfall Trek", "description": "Beautiful 3km trek through pine trees and orchards to a cascading waterfall", "type": "activity", "duration": "2.5 hours", "cost_inr": 0, "location": "Vashisht", "tips": "Wear sturdy trekking shoes as the trail can be slippery"},
                {"time": "07:30 PM", "title": "Dinner at Lazy Dog Cafe", "description": "Relaxed vibe with live music and outdoor seating by the river", "type": "food", "duration": "2 hours", "cost_inr": 700, "location": "Old Manali", "tips": "Great collection of local brewed beers"},
            ],
            [
                {"time": "09:00 AM", "title": "Atal Tunnel & Sissu Valley", "description": "Drive through the world's longest highway tunnel above 10,000 feet to Lahaul Valley", "type": "activity", "duration": "4 hours", "cost_inr": 1200, "location": "Sissu, Lahaul", "tips": "Stop near the Sissu waterfall for amazing photos"},
                {"time": "01:30 PM", "title": "Lunch at Sissu", "description": "Hot local Maggie and tea with a view of snow peaks", "type": "food", "duration": "1 hour", "cost_inr": 150, "location": "Sissu", "tips": "Simple but delicious food"},
                {"time": "03:30 PM", "title": "Tibetan Monastery Visit", "description": "Peaceful Buddhist monastery with beautiful paintings and prayer wheels", "type": "activity", "duration": "1.5 hours", "cost_inr": 0, "location": "Manali Town", "tips": "Perfect place for meditation"},
                {"time": "07:00 PM", "title": "Dinner at Johnson's Cafe", "description": "Elegant restaurant known for its exquisite wood-fired trout fish", "type": "food", "duration": "2 hours", "cost_inr": 800, "location": "Johnson Lodge", "tips": "Try their apple crumble dessert"},
            ],
            [
                {"time": "09:00 AM", "title": "Naggar Castle Exploration", "description": "Stunning wooden castle from the 15th century with panoramic views of the Kullu Valley", "type": "activity", "duration": "2.5 hours", "cost_inr": 100, "location": "Naggar", "tips": "Watch the movie shooting locations"},
                {"time": "12:00 PM", "title": "Lunch at Naggar Castle Restaurant", "description": "Dine like royalty inside the castle courtyard", "type": "food", "duration": "1.5 hours", "cost_inr": 450, "location": "Naggar", "tips": "Order the traditional Himachali thali"},
                {"time": "03:00 PM", "title": "Souvenir Shopping at Manu Market", "description": "Buy Kullu shawls, wooden crafts, and local honey", "type": "activity", "duration": "2 hours", "cost_inr": 500, "location": "Manu Market", "tips": "Bargain at least 20-30% on woolen products"},
                {"time": "06:00 PM", "title": "Departure from Manali", "description": "Board the evening Volvo bus back home", "type": "transport", "duration": "1 hour", "cost_inr": 1000, "location": "Private Bus Stand", "tips": "Keep water and motion sickness pills handy for the winding roads"},
            ]
        ]
        
        hotels = [
            {"name": "Span Resort & Spa", "type": "luxury", "price_per_night_inr": 14000, "rating": 4.8, "area": "Kullu-Manali Highway"},
            {"name": "The Johnson Lodge", "type": "standard", "price_per_night_inr": 4500, "rating": 4.3, "area": "Near Mall Road"},
            {"name": "Zostel Manali", "type": "budget", "price_per_night_inr": 1200, "rating": 4.1, "area": "Old Manali"},
        ]
        restaurants = [
            {"name": "Cafe 1947", "cuisine": "Italian, Cafe", "avg_cost_inr": 600, "must_try": "Wood-Fired Pizza"},
            {"name": "Johnson's Cafe", "cuisine": "Continental, Local Trout", "avg_cost_inr": 800, "must_try": "Grilled Trout"},
            {"name": "Il Forno", "cuisine": "Italian", "avg_cost_inr": 700, "must_try": "Lasagna"},
        ]
        transport = {
            "how_to_reach": "Fly to Bhuntar Airport (UUU) or take an overnight Volvo bus from Delhi (14 hours)",
            "local_transport": ["Auto-rickshaw", "Local Cab", "Scooter Rental (₹500/day)"],
            "avg_local_cost_inr": 500
        }
        visa_info = "Not required for Indian citizens"
        packing_tips = ["Heavy woolens in winter, light jacket in summer", "Trekking shoes", "Sunscreen & Sunglasses", "Thermals"]
        emergency_contacts = {"police": "112", "hospital": "102", "tourism_office": "01902-252175"}

    elif "bali" in dest_lower:
        best_time = "April to October"
        weather = "27°C, tropical and sunny"
        highlights = ["Ubud Temples", "Seminyak Beaches", "Uluwatu Sunset", "Rice Terraces"]
        
        all_activities = [
            [
                {"time": "10:00 AM", "title": "Arrive at Ngurah Rai Airport", "description": "Clear immigration and meet driver", "type": "transport", "duration": "1.5 hours", "cost_inr": 1200, "location": "Denpasar", "tips": "Apply for Visa on Arrival online in advance to skip the queue"},
                {"time": "01:00 PM", "title": "Check in to Ubud Villa", "description": "Settle in a beautiful villa with jungle views", "type": "hotel", "duration": "1.5 hours", "cost_inr": 3500, "location": "Ubud", "tips": "Request a villa with a private plunge pool for the best experience"},
                {"time": "03:30 PM", "title": "Ubud Monkey Forest", "description": "Sanctuary for long-tailed macaques and ancient temples", "type": "activity", "duration": "2 hours", "cost_inr": 450, "location": "Ubud Center", "tips": "Do not wear loose jewelry or carry food in your hands"},
                {"time": "06:30 PM", "title": "Dinner at Bebek Bengil", "description": "Famous Balinese crispy duck set in lush rice fields", "type": "food", "duration": "1.5 hours", "cost_inr": 800, "location": "Ubud", "tips": "Try the Bebek Bengil (Crispy Duck) with sambal"},
            ],
            [
                {"time": "09:00 AM", "title": "Tegallalang Rice Terraces", "description": "Iconic terraced hillside paddy fields with swings", "type": "activity", "duration": "3 hours", "cost_inr": 250, "location": "Tegallalang", "tips": "Go early before 10 AM to avoid the midday tropical heat"},
                {"time": "01:00 PM", "title": "Lunch at Green Kubu", "description": "Outdoor cafe overlooking ponds and rice fields", "type": "food", "duration": "1.5 hours", "cost_inr": 400, "location": "Tegallalang", "tips": "Try their Nasi Goreng and fresh coconut water"},
                {"time": "03:00 PM", "title": "Tirta Empul Holy Water Temple", "description": "Hindu temple famous for its ritual purification pools", "type": "activity", "duration": "2 hours", "cost_inr": 300, "location": "Tampaksiring", "tips": "You will need to wear a sarong, which is provided at the entrance"},
                {"time": "07:00 PM", "title": "Dinner at Locavore To Go", "description": "Casual gourmet eatery focusing on local ingredients", "type": "food", "duration": "1.5 hours", "cost_inr": 1200, "location": "Ubud Town", "tips": "Book in advance as tables are limited"},
            ],
            [
                {"time": "09:00 AM", "title": "Travel to Seminyak & Shopping", "description": "Drive from Ubud to Bali's trendy coastal town", "type": "transport", "duration": "2 hours", "cost_inr": 800, "location": "Seminyak", "tips": "Hire a private driver for hassle-free baggage transit"},
                {"time": "01:00 PM", "title": "Lunch at Sisterfields Cafe", "description": "Modern Australian cafe with an amazing brunch menu", "type": "food", "duration": "1.5 hours", "cost_inr": 600, "location": "Seminyak", "tips": "Order the acai bowls or dirty burger"},
                {"time": "04:30 PM", "title": "Uluwatu Cliff Temple & Kecak Dance", "description": "Clifftop temple with dramatic ocean sunset views and fire dance show", "type": "activity", "duration": "3.5 hours", "cost_inr": 800, "location": "Uluwatu Cliffs", "tips": "Buy tickets for the Kecak dance online in advance to secure seats"},
                {"time": "09:00 PM", "title": "Jimbaran Bay Seafood Dinner", "description": "Romantic candle-lit dinner directly on the sandy beach", "type": "food", "duration": "2 hours", "cost_inr": 1500, "location": "Jimbaran Beach", "tips": "Choose live seafood from the tanks; prices are per kg"},
            ],
            [
                {"time": "07:00 AM", "title": "Nusa Penida Island Tour", "description": "Fast boat trip to explore cliffs and pristine beaches", "type": "activity", "duration": "8 hours", "cost_inr": 3500, "location": "Nusa Penida", "tips": "Take motion sickness pills before boarding the speed boat"},
                {"time": "01:00 PM", "title": "Lunch at Nusa Penida Local Cafe", "description": "Dine with views of the crystal clear bay", "type": "food", "duration": "1 hour", "cost_inr": 350, "location": "Nusa Penida", "tips": "Fresh local fish is highly recommended"},
                {"time": "02:00 PM", "title": "Kelingking Beach Viewpoint", "description": "Famous T-Rex shaped cliff and turquoise water view", "type": "activity", "duration": "2 hours", "cost_inr": 100, "location": "Kelingking", "tips": "The climb down the cliff is steep and dangerous, view from top is best"},
                {"time": "08:00 PM", "title": "Dinner at Motel Mexicola", "description": "Vibrant Mexican restaurant with retro decor and upbeat music", "type": "food", "duration": "2 hours", "cost_inr": 900, "location": "Seminyak", "tips": "Be ready to dance; it becomes a party venue after 9 PM"},
            ],
            [
                {"time": "09:00 AM", "title": "Seminyak Beach & Surf Lesson", "description": "Relax on the beach or take a beginner surf lesson", "type": "activity", "duration": "3 hours", "cost_inr": 1000, "location": "Seminyak Beach", "tips": "Rent a sunbed with umbrella for around IDR 50k (₹270)"},
                {"time": "01:00 PM", "title": "Lunch at Naughty Nuri's", "description": "Famous street-side grill known for legendary pork ribs", "type": "food", "duration": "1.5 hours", "cost_inr": 800, "location": "Seminyak", "tips": "Order the ribs and their signature shaker martini"},
                {"time": "03:00 PM", "title": "Spa Session at Bodyworks", "description": "Rejuvenating traditional Balinese full-body massage", "type": "activity", "duration": "2 hours", "cost_inr": 1500, "location": "Seminyak", "tips": "Book weeks in advance for this highly-rated spa"},
                {"time": "06:00 PM", "title": "Head to Airport", "description": "Transfer to Denpasar Airport for flight back", "type": "transport", "duration": "1 hour", "cost_inr": 500, "location": "Denpasar Airport", "tips": "Arrive 3 hours early as international departures can be busy"},
            ]
        ]

        hotels = [
            {"name": "Maya Ubud Resort & Spa", "type": "luxury", "price_per_night_inr": 16000, "rating": 4.9, "area": "Ubud Highlands"},
            {"name": "Alila Seminyak", "type": "standard", "price_per_night_inr": 8000, "rating": 4.6, "area": "Seminyak Beachfront"},
            {"name": "Cara Cara Inn", "type": "budget", "price_per_night_inr": 2000, "rating": 4.0, "area": "Kuta"},
        ]
        restaurants = [
            {"name": "Bebek Bengil", "cuisine": "Balinese Duck", "avg_cost_inr": 800, "must_try": "Crispy Duck"},
            {"name": "Jimbaran Seafood", "cuisine": "Fresh Seafood BBQ", "avg_cost_inr": 1500, "must_try": "Grilled Snapper"},
            {"name": "Motel Mexicola", "cuisine": "Mexican", "avg_cost_inr": 900, "must_try": "Fish Tacos"},
        ]
        transport = {
            "how_to_reach": "Fly to Ngurah Rai International Airport (DPS) in Denpasar",
            "local_transport": ["Scooter Rental (₹400/day)", "Grab/Gojek Apps", "Private Day Driver (₹2500/day)"],
            "avg_local_cost_inr": 600
        }
        visa_info = "Visa on Arrival (VoA) available for Indian citizens ($35 USD, valid 30 days)"
        packing_tips = ["Swimwear", "Insect repellent", "Sarong for temple visits", "Light summer clothes", "US Dollars or Local IDR cash"]
        emergency_contacts = {"police": "110", "ambulance": "118", "tourist_police": "+62-361-224111"}

    elif "dubai" in dest_lower:
        best_time = "November to March"
        weather = "25°C, warm and sunny"
        highlights = ["Burj Khalifa", "Desert Safari", "Dubai Mall", "Jumeirah Marina"]
        
        all_activities = [
            [
                {"time": "09:00 AM", "title": "Arrive at Dubai Airport", "description": "Transfer to hotel in Downtown/Marina", "type": "transport", "duration": "1.5 hours", "cost_inr": 1500, "location": "DXB Airport", "tips": "Buy a local NOL card at the airport for cheap Metro travel"},
                {"time": "12:30 PM", "title": "Lunch at Dubai Mall", "description": "Casual lunch at the food court or waterfront restaurants", "type": "food", "duration": "1.5 hours", "cost_inr": 600, "location": "Dubai Mall", "tips": "Sit near the glass window for indoor aquarium views"},
                {"time": "03:00 PM", "title": "At The Top - Burj Khalifa", "description": "Ride the world's fastest elevator to the 124th floor observation deck", "type": "activity", "duration": "2.5 hours", "cost_inr": 4200, "location": "Downtown Dubai", "tips": "Pre-book tickets online to get your preferred sunset slot"},
                {"time": "06:30 PM", "title": "Dubai Fountain Show", "description": "Mesmerizing light, water, and music show at the base of Burj Khalifa", "type": "activity", "duration": "1.5 hours", "cost_inr": 0, "location": "Burj Lake", "tips": "Shows start every 30 mins. Standing on the Souk Al Bahar bridge offers best views"},
            ],
            [
                {"time": "09:30 AM", "title": "Dubai Frame Sightseeing", "description": "150m tall structure offering views of Old and New Dubai", "type": "activity", "duration": "2 hours", "cost_inr": 1100, "location": "Zabeel Park", "tips": "Walk on the clear glass floor at the top bridge if you dare"},
                {"time": "01:00 PM", "title": "Lunch at Ravi Restaurant", "description": "Famous Pakistani diner known for legendary curries and kebabs", "type": "food", "duration": "1 hour", "cost_inr": 400, "location": "Satwa", "tips": "Order the mutton peshawari and hot butter naan"},
                {"time": "03:00 PM", "title": "Desert Safari Tour", "description": "4x4 dune bashing, camel riding, sandboarding, and belly dance BBQ dinner", "type": "activity", "duration": "6 hours", "cost_inr": 3000, "location": "Lahbab Desert", "tips": "Avoid eating heavy foods immediately before dune bashing"},
            ],
            [
                {"time": "10:00 AM", "title": "Dubai Marina Yacht Sightseeing", "description": "Guided cruise around the Marina, Palm Jumeirah, and Atlantis", "type": "activity", "duration": "2.5 hours", "cost_inr": 2500, "location": "Dubai Marina", "tips": "Bring sunscreen and shades; morning cruise is cooler"},
                {"time": "01:00 PM", "title": "Lunch at Pier 7", "description": "Dine at one of the 7 restaurants with panoramic harbor views", "type": "food", "duration": "1.5 hours", "cost_inr": 1200, "location": "Marina Yacht Club", "tips": "Book Cargo or Atelier M for amazing lunch deals"},
                {"time": "03:30 PM", "title": "The Lost Chambers Aquarium", "description": "Explore underwater tunnels containing 65,000 marine animals", "type": "activity", "duration": "2 hours", "cost_inr": 2800, "location": "Atlantis The Palm", "tips": "Combine with Aquaventure Waterpark for savings"},
                {"time": "07:00 PM", "title": "Dinner at Souk Madinat Jumeirah", "description": "Bazaar with traditional style, waterways, and views of Burj Al Arab", "type": "food", "duration": "2 hours", "cost_inr": 1800, "location": "Jumeirah", "tips": "The outdoor terrace seats offer prime Burj Al Arab pictures"},
            ],
            [
                {"time": "09:30 AM", "title": "Miracle Garden", "description": "World's largest natural flower garden with 150 million blooms", "type": "activity", "duration": "3 hours", "cost_inr": 1500, "location": "Al Barsha South", "tips": "Open only from Nov to April. Great photo opportunities"},
                {"time": "01:00 PM", "title": "Lunch at Mall of the Emirates", "description": "Quick lunch near the Ski Dubai viewing deck", "type": "food", "duration": "1 hour", "cost_inr": 500, "location": "MOE", "tips": "Try the famous Shawarma at the food court"},
                {"time": "03:00 PM", "title": "Global Village Tour", "description": "Huge cultural festival park with pavilions representing 75+ countries", "type": "activity", "duration": "5 hours", "cost_inr": 600, "location": "Sheikh Mohamed Bin Zayed Road", "tips": "Opens at 4 PM. Best to go on weekdays to avoid crowds"},
            ],
            [
                {"time": "09:30 AM", "title": "Al Fahidi Historical Neighborhood", "description": "Old Dubai wind-tower architecture and narrow lanes", "type": "activity", "duration": "2 hours", "cost_inr": 200, "location": "Bur Dubai", "tips": "Visit the Dubai Museum nearby (small entry fee)"},
                {"time": "12:00 PM", "title": "Abra Boat Ride & Gold Souk", "description": "Traditional wooden boat ride across Dubai Creek to shop gold, and spices", "type": "activity", "duration": "2.5 hours", "cost_inr": 500, "location": "Deira", "tips": "The Abra ride costs just 1 AED (₹22) cash"},
                {"time": "03:00 PM", "title": "Head to Airport", "description": "Transfer to DXB Airport for departure", "type": "transport", "duration": "1 hour", "cost_inr": 800, "location": "Airport Road", "tips": "Allow time for duty-free shopping at Terminal 3"},
            ]
        ]

        hotels = [
            {"name": "Atlantis The Palm", "type": "luxury", "price_per_night_inr": 35000, "rating": 4.9, "area": "Palm Jumeirah"},
            {"name": "Rove Downtown", "type": "standard", "price_per_night_inr": 8000, "rating": 4.5, "area": "Downtown Dubai"},
            {"name": "Citymax Hotel Bur Dubai", "type": "budget", "price_per_night_inr": 3500, "rating": 3.9, "area": "Bur Dubai"},
        ]
        restaurants = [
            {"name": "Ravi Restaurant", "cuisine": "Pakistani / Mughlai", "avg_cost_inr": 450, "must_try": "Chicken Peshawari"},
            {"name": "Logma", "cuisine": "Emirati Fusion", "avg_cost_inr": 900, "must_try": "Chebab (Emirati Pancakes)"},
            {"name": "Pier 7", "cuisine": "International", "avg_cost_inr": 1800, "must_try": "Seared Salmon"},
        ]
        transport = {
            "how_to_reach": "Fly directly to Dubai International Airport (DXB) or Sharjah (SHJ)",
            "local_transport": ["Dubai Metro (NOL card)", "RTA Cabs (Careem App)", "Hop-on Hop-off Bus"],
            "avg_local_cost_inr": 800
        }
        visa_info = "Pre-arranged 30-day tourist visa required (processed online in 3 days, ~₹8,000)"
        packing_tips = ["Light summer clothing", "Modest outfits for historic area/mosques", "Comfortable walking shoes", "Sunscreen & Sunglasses"]
        emergency_contacts = {"police": "999", "ambulance": "998", "fire": "997"}

    elif "goa" in dest_lower:
        best_time = "October to March"
        weather = "28°C, sunny and breezy"
        highlights = ["Beaches", "Portuguese Culture", "Nightlife", "Seafood"]
        
        all_activities = [
            [
                {"time": "10:00 AM", "title": "Arrive at Goa Airport", "description": "Check into hotel in Calangute area", "type": "hotel", "duration": "1.5 hours", "cost_inr": 2500, "location": "Calangute", "tips": "Book Ola/Uber from airport — cheaper than prepaid taxis"},
                {"time": "01:00 PM", "title": "Lunch at Fisherman's Wharf", "description": "Iconic Goan seafood restaurant with river views", "type": "food", "duration": "1.5 hours", "cost_inr": 600, "location": "Fisherman's Wharf", "tips": "Try the crab xacuti and sol kadhi"},
                {"time": "03:00 PM", "title": "Calangute Beach & Water Sports", "description": "Parasailing, jet ski, and banana boat rides", "type": "activity", "duration": "3 hours", "cost_inr": 400, "location": "Calangute Beach", "tips": "Negotiate prices — standard parasailing is ₹400"},
                {"time": "07:00 PM", "title": "Anjuna Flea Market", "description": "Wednesday flea market with local crafts and souvenirs", "type": "activity", "duration": "2 hours", "cost_inr": 300, "location": "Anjuna", "tips": "Haggle hard; start at 50% of the quoted price"},
                {"time": "09:00 PM", "title": "Dinner at Britto's", "description": "Iconic beach shack offering a perfect Goan dinner experience", "type": "food", "duration": "2 hours", "cost_inr": 800, "location": "Baga Beach", "tips": "Try their fresh seafood platter and serradura for dessert"},
            ],
            [
                {"time": "09:00 AM", "title": "Basilica of Bom Jesus", "description": "UNESCO World Heritage site containing the mortal remains of St. Francis Xavier", "type": "activity", "duration": "1.5 hours", "cost_inr": 200, "location": "Old Goa", "tips": "Dress modestly as it is a place of worship"},
                {"time": "12:00 PM", "title": "Local Goan Thali", "description": "Authentic thali with 12 items including fish curry, rice, and local side dishes", "type": "food", "duration": "1 hour", "cost_inr": 300, "location": "Panaji", "tips": "Go to Ritz Classic or Kokni Kanteen for the best experience"},
                {"time": "02:30 PM", "title": "Dudhsagar Falls Jeep Safari", "description": "Exhilarating ride through the forest to see India's 5th highest waterfall", "type": "activity", "duration": "4 hours", "cost_inr": 1800, "location": "Mollem National Park", "tips": "Life jackets are mandatory and provided at the base"},
                {"time": "07:30 PM", "title": "Casino Cruise", "description": "Evening on the Mandovi River with dinner, drinks, and games on a floating casino", "type": "activity", "duration": "3 hours", "cost_inr": 2000, "location": "Mandovi River, Panaji", "tips": "Pre-book online for better package deals and entry discounts"},
            ],
            [
                {"time": "08:00 AM", "title": "Sunrise at Palolem Beach", "description": "One of India's most beautiful, crescent-shaped beaches with calm waters", "type": "activity", "duration": "2 hours", "cost_inr": 0, "location": "South Goa", "tips": "Perfect for a morning walk or kayak session"},
                {"time": "11:00 AM", "title": "Colva Beach Relaxation", "description": "Long, clean beach stretch with powdery white sand", "type": "activity", "duration": "2 hours", "cost_inr": 0, "location": "Colva", "tips": "Try the local coconut water sold by beachside vendors"},
                {"time": "01:30 PM", "title": "Lunch at Martin's Corner", "description": "Legendary Goan restaurant famous for its seafood and vibrant atmosphere", "type": "food", "duration": "1.5 hours", "cost_inr": 700, "location": "Betalbatim", "tips": "Their pork vindaloo and butter garlic prawns are highly recommended"},
                {"time": "03:30 PM", "title": "Shopping at Mapusa Market", "description": "Local market filled with Goan spices, homemade cashews, feni, and traditional arts", "type": "activity", "duration": "2 hours", "cost_inr": 500, "location": "Mapusa", "tips": "Buy seedless tamarind and local spices in bulk"},
                {"time": "05:30 PM", "title": "Head to Airport", "description": "Cab ride back to Goa Airport for departure flight", "type": "transport", "duration": "1.5 hours", "cost_inr": 600, "location": "Dabolim / Mopa", "tips": "Leave early as traffic can build up near Zuari bridge"},
            ]
        ]
        
        hotels = [
            {"name": "Taj Exotica Resort & Spa", "type": "luxury", "price_per_night_inr": 18000, "rating": 4.9, "area": "Benaulim Beach"},
            {"name": "Novotel Goa Resort & Spa", "type": "standard", "price_per_night_inr": 6500, "rating": 4.4, "area": "Candolim"},
            {"name": "Zostel Goa", "type": "budget", "price_per_night_inr": 1200, "rating": 4.2, "area": "Morjim"},
        ]
        restaurants = [
            {"name": "Fisherman's Wharf", "cuisine": "Goan Seafood, Continental", "avg_cost_inr": 800, "must_try": "Crab Xacuti & Butter Garlic Prawns"},
            {"name": "Martin's Corner", "cuisine": "Goan Traditional, Seafood", "avg_cost_inr": 700, "must_try": "Pork Vindaloo & Fish Curry"},
            {"name": "Britto's", "cuisine": "Multi-cuisine, Seafood", "avg_cost_inr": 900, "must_try": "Baked Crabs & Seafood Platter"},
        ]
        transport = {
            "how_to_reach": "Fly to Manohar International Airport (MGO) or Dabolim Airport (GOI)",
            "local_transport": ["Scooter Rental (₹400/day)", "Self-Drive Car (₹1500/day)", "Goa Miles App Cabs"],
            "avg_local_cost_inr": 500
        }
        visa_info = "Not required for Indian citizens"
        packing_tips = ["Swimwear & beach clothing", "Sunscreen (SPF 50+)", "Sunglasses & Hat", "Flip flops", "Light cotton clothes"]
        emergency_contacts = {"police": "112", "ambulance": "108", "tourist_helpline": "1363"}

    else:
        # Default Generic Destination (Dynamic according to dest name)
        best_time = "September to May"
        weather = "22°C, pleasant and clear"
        highlights = ["Local Landmarks", "Cultural Experiences", "Regional Cuisine", "Sightseeing Highlights"]
        
        all_activities = [
            [
                {"time": "10:00 AM", "title": f"Arrive at {dest}", "description": f"Transfer and check into your accommodation in {dest}", "type": "hotel", "duration": "1.5 hours", "cost_inr": 2000, "location": f"{dest} Center", "tips": "Coordinate your pickup in advance for a smooth transition"},
                {"time": "01:00 PM", "title": f"Welcome Lunch in {dest}", "description": f"Taste the highly recommended traditional dishes of this area at a popular local diner in {dest}", "type": "food", "duration": "1.5 hours", "cost_inr": 500, "location": f"{dest} Center", "tips": "Ask the staff for their chef special recipes"},
                {"time": "03:00 PM", "title": f"{dest} City Landmarks Tour", "description": f"Stroll and photograph the iconic monuments and central landmarks of {dest}", "type": "activity", "duration": "3.5 hours", "cost_inr": 400, "location": f"{dest} Old Town", "tips": "Wear comfortable walking shoes"},
                {"time": "07:30 PM", "title": f"Dinner in {dest}", "description": f"Indulge in a fine dining experience featuring regional recipes of {dest}", "type": "food", "duration": "2 hours", "cost_inr": 700, "location": f"{dest}", "tips": "Try the signature local desserts"},
            ],
            [
                {"time": "09:00 AM", "title": f"Cultural Discovery of {dest}", "description": f"Visit the principal museum or heritage center of {dest}", "type": "activity", "duration": "2.5 hours", "cost_inr": 300, "location": f"{dest}", "tips": "Audio guides are highly recommended"},
                {"time": "12:00 PM", "title": f"Traditional Market Visit in {dest}", "description": "Explore the bustling markets and try local street foods", "type": "activity", "duration": "2 hours", "cost_inr": 200, "location": f"{dest} Market", "tips": "Haggling is common at street stalls"},
                {"time": "03:00 PM", "title": f"{dest} Scenic Viewpoint", "description": "Head to a popular hilltop, tower, or balcony overlooking the city skyline", "type": "activity", "duration": "2.5 hours", "cost_inr": 500, "location": f"{dest} Vista", "tips": "Perfect slot for sunset photography"},
                {"time": "07:00 PM", "title": f"Evening Show in {dest}", "description": "Enjoy a traditional performance or live entertainment show in the evening", "type": "activity", "duration": "2 hours", "cost_inr": 1000, "location": f"{dest} Theatre", "tips": "Book tickets in advance"},
            ],
            [
                {"time": "08:00 AM", "title": f"Morning Park Walk in {dest}", "description": "Breathe in the fresh air at a famous public park or nature trail", "type": "activity", "duration": "2 hours", "cost_inr": 0, "location": f"{dest} Park", "tips": "Rent a bicycle for easier transit"},
                {"time": "11:00 AM", "title": "Souvenir & Art Shopping", "description": f"Pick up authentic crafts, local spices, or items unique to {dest}", "type": "activity", "duration": "2 hours", "cost_inr": 500, "location": f"{dest} Bazaar", "tips": "Compare prices across multiple stalls"},
                {"time": "01:30 PM", "title": "Farewell Lunch", "description": "A delightful last lunch to wrap up your visit", "type": "food", "duration": "1.5 hours", "cost_inr": 600, "location": f"{dest}", "tips": "Order a local drink to toast your trip"},
                {"time": "05:00 PM", "title": f"Departure from {dest}", "description": "Check out and head to the airport/station for your journey home", "type": "transport", "duration": "1 hour", "cost_inr": 500, "location": f"{dest} Station", "tips": "Keep your ticket documents ready"},
            ]
        ]
        
        hotels = [
            {"name": f"Taj {dest} Resort", "type": "luxury", "price_per_night_inr": 12000, "rating": 4.8, "area": "City Center / Scenic Area"},
            {"name": f"Grand {dest} Hotel", "type": "standard", "price_per_night_inr": 4500, "rating": 4.2, "area": "Town Central"},
            {"name": f"Hotel {dest} Inn", "type": "budget", "price_per_night_inr": 1600, "rating": 3.9, "area": "Near Transit Hub"},
        ]
        restaurants = [
            {"name": f"The {dest} Grill", "cuisine": "Local & Multi-cuisine", "avg_cost_inr": 1000, "must_try": "Chef's Signature Platter"},
            {"name": "Traditional Kitchen", "cuisine": "Authentic Regional", "avg_cost_inr": 600, "must_try": "Special Regional Curry"},
        ]
        transport = {
            "how_to_reach": f"Fly to the nearest airport or take an express train to {dest}",
            "local_transport": ["Taxi/Auto-rickshaw", "Public Bus/Metro", "Scooter/Car Rental"],
            "avg_local_cost_inr": 400
        }
        visa_info = f"Check domestic/international travel rules for {dest} depending on your passport nationality."
        packing_tips = ["Comfortable shoes", "Weather-appropriate clothing", "Sunscreen & Sunglasses", "Camera", "Power bank"]
        emergency_contacts = {"police": "112", "ambulance": "108"}

    
    days_data = []
    for d_idx in range(days_count):
        day_activities = all_activities[d_idx % len(all_activities)]
        days_data.append({
            "day": d_idx + 1,
            "title": f"Day {d_idx + 1}: " + ("Explore Highlights" if d_idx > 0 else "Arrival & Settle In"),
            "theme": f"Experience the best of {dest}",
            "activities": day_activities
        })
        
    return {
        "destination": f"{dest}, India" if "india" not in dest.lower() and dest.lower() not in ["bali", "dubai", "paris"] else dest,
        "title": f"{days_count}-Day {dest} Getaway",
        "duration_days": days_count,
        "total_budget_inr": total_budget,
        "budget_breakdown": {
            "accommodation": accommodation_cost,
            "food": food_cost,
            "transport": transport_cost,
            "activities": activities_cost
        },
        "best_time": best_time,
        "weather": weather,
        "highlights": highlights,
        "days": days_data,
        "hotels": hotels,
        "restaurants": restaurants,
        "transport": transport,
        "visa_info": visa_info,
        "packing_tips": packing_tips,
        "emergency_contacts": emergency_contacts
    }


def get_mock_chat_response(message: str) -> str:
    msg_lower = message.lower()
    if "goa" in msg_lower or "beach" in msg_lower:
        return "🌊 Goa is magical! Best time: October to March. Budget ₹8,000-15,000 for 3 days. North Goa for parties, South Goa for peace. Shall I plan your complete trip?"
    elif "bali" in msg_lower:
        return "🏯 Bali is stunning! Budget ₹30,000-60,000 for 5 days. Seminyak for nightlife, Ubud for culture, Uluwatu for cliffs. Visa on arrival for Indians ($35). Want a full Bali itinerary?"
    elif "visa" in msg_lower or "dubai" in msg_lower:
        return "🛂 Dubai tourist visa for Indians: Apply online through GDRFA or Emirates. Cost: ~₹8,000. Processing: 3-4 days. Requires 6-month valid passport + confirmed hotel. Need help planning Dubai?"
    elif "manali" in msg_lower or "snow" in msg_lower or "mountain" in msg_lower:
        return "🏔️ Manali is wonderful! Best time: October to June. Budget ₹10,000-20,000 for 4 days. You can experience snow at Rohtang Pass, paragliding at Solang Valley, and cafes in Old Manali. Should we build an itinerary?"
    elif "budget" in msg_lower or "cheap" in msg_lower:
        return "💰 Budget-friendly trips from India: Goa (₹8K for 3 days), Manali (₹10K for 4 days), Coorg (₹6K for 2 days), Pondicherry (₹7K for 3 days). Which one interests you?"
    else:
        return "I'm your AI travel assistant! I can help you plan trips, find hotels, check visa requirements, suggest activities, and optimize budgets. Where would you like to travel?"


async def generate_itinerary(prompt: str, budget_tier: str = "standard") -> tuple[dict, Optional[str]]:
    """Generate a travel itinerary using AI or fallback to mock data."""
    if not settings.GEMINI_API_KEY:
        return generate_dynamic_mock_itinerary(prompt, budget_tier), "Gemini API key is not configured. Running in offline/mock mode."

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        full_prompt = f"{SYSTEM_PROMPT}\n\nBudget tier: {budget_tier}\n\nTrip request: {prompt}"

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=full_prompt,
            config={
                "temperature": 0.7,
                "max_output_tokens": 4000,
                "response_mime_type": "application/json",
            },
        )

        content = response.text
        return json.loads(content), None

    except Exception as e:
        print(f"Gemini error: {e}. Returning dynamic mock data.")
        err_msg = str(e)
        return generate_dynamic_mock_itinerary(prompt, budget_tier), f"Gemini API Error: {err_msg}"


async def chat_with_assistant(message: str, history: list) -> tuple[str, Optional[str]]:
    """Chat with the AI travel assistant."""
    if not settings.GEMINI_API_KEY:
        return get_mock_chat_response(message), "Gemini API key is not configured. Running in offline/mock mode."

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build conversation history as a single prompt
        system_msg = "You are VoyageAI, a helpful travel assistant specializing in trips for Indian travelers. Be concise, helpful, and enthusiastic about travel. Use emojis appropriately."
        conversation = system_msg + "\n\n"
        for msg in history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            conversation += f"{role}: {msg.get('content', '')}\n"
        conversation += f"User: {message}\nAssistant:"

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=conversation,
            config={
                "temperature": 0.8,
                "max_output_tokens": 500,
            },
        )
        return response.text, None

    except Exception as e:
        mock_reply = get_mock_chat_response(message)
        error_msg = str(e)
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            warning = "\n\n*(Note: Running in offline mode because your Gemini API Key exceeded its free quota limit: 429 RESOURCE_EXHAUSTED. Please verify your billing details or rate limits in Google AI Studio.)*"
        else:
            warning = f"\n\n*(Note: Running in offline mode due to API Error: {error_msg[:60]}...)*"
        return f"{mock_reply}{warning}", f"Gemini API Error: {error_msg}"
