import google.generativeai as genai
from sqlalchemy.orm import Session
from models import Customer, Order, ShopperTwin
from datetime import datetime
import os
import uuid

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def compute_rfm(orders: list) -> dict:
    if not orders:
        return {"recency_days": 999, "frequency": 0, "monetary_value": 0.0}
    sorted_orders = sorted(orders, key=lambda o: o.created_at, reverse=True)
    recency_days = (datetime.utcnow() - sorted_orders[0].created_at).days
    frequency = len(orders)
    monetary_value = round(sum(o.amount for o in orders), 2)
    return {"recency_days": recency_days, "frequency": frequency, "monetary_value": monetary_value}

def get_top_category(orders: list) -> str:
    if not orders:
        return "Unknown"
    counts = {}
    for o in orders:
        counts[o.category] = counts.get(o.category, 0) + 1
    return max(counts, key=counts.get)

def get_price_sensitivity(monetary_value: float, frequency: int) -> str:
    avg = monetary_value / frequency if frequency > 0 else 0
    if avg > 1500: return "low"
    elif avg > 600: return "mid"
    else: return "high"

def get_churn_risk(recency_days: int, frequency: int) -> str:
    if recency_days > 90 and frequency < 3: return "high"
    elif recency_days > 45: return "medium"
    else: return "low"

def get_preferred_channel(monetary_value: float) -> str:
    if monetary_value > 5000: return "whatsapp"
    elif monetary_value > 2000: return "sms"
    else: return "email"

def generate_persona_summary(customer: Customer, rfm: dict, top_category: str, churn_risk: str) -> str:
    prompt = f"""Write a 2-sentence marketing persona for this shopper. Be specific and data-driven.

Name: {customer.name}, City: {customer.city}
Last purchase: {rfm['recency_days']} days ago
Orders: {rfm['frequency']}, Total spent: ₹{rfm['monetary_value']}
Favorite category: {top_category}, Churn risk: {churn_risk}

Return only the 2 sentences, no labels, no extra text."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Shopper in {customer.city} with {rfm['frequency']} orders, primarily in {top_category}. Churn risk is {churn_risk}."

def build_all_twins(db: Session):
    customers = db.query(Customer).all()

    for customer in customers:
        orders = db.query(Order).filter(Order.customer_id == customer.id).all()
        rfm = compute_rfm(orders)
        top_category = get_top_category(orders)
        price_sensitivity = get_price_sensitivity(rfm["monetary_value"], rfm["frequency"])
        churn_risk = get_churn_risk(rfm["recency_days"], rfm["frequency"])
        preferred_channel = get_preferred_channel(rfm["monetary_value"])
        persona_summary = generate_persona_summary(customer, rfm, top_category, churn_risk)

        existing = db.query(ShopperTwin).filter(ShopperTwin.customer_id == customer.id).first()

        if existing:
            existing.recency_days = rfm["recency_days"]
            existing.frequency = rfm["frequency"]
            existing.monetary_value = rfm["monetary_value"]
            existing.top_category = top_category
            existing.price_sensitivity = price_sensitivity
            existing.churn_risk = churn_risk
            existing.preferred_channel = preferred_channel
            existing.persona_summary = persona_summary
            existing.last_computed_at = datetime.utcnow()
        else:
            twin = ShopperTwin(
                id=str(uuid.uuid4()),
                customer_id=customer.id,
                recency_days=rfm["recency_days"],
                frequency=rfm["frequency"],
                monetary_value=rfm["monetary_value"],
                top_category=top_category,
                price_sensitivity=price_sensitivity,
                churn_risk=churn_risk,
                preferred_channel=preferred_channel,
                persona_summary=persona_summary,
            )
            db.add(twin)

    db.commit()
    print(f"Built twins for {len(customers)} customers.")
