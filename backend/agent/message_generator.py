import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_message(
    goal: str,
    customer_name: str,
    top_category: str,
    price_sensitivity: str,
    churn_risk: str,
    channel: str
) -> str:
    first_name = customer_name.split()[0]

    prompt = f"""Write a personalized marketing message for this customer.

Campaign Goal: {goal}
Customer First Name: {first_name}
Favorite Category: {top_category}
Price Sensitivity: {price_sensitivity} (high = discount-seeking, low = quality-seeking)
Churn Risk: {churn_risk}
Channel: {channel}

Rules:
- Address them by first name
- Reference their favorite category naturally
- If price_sensitivity is high, include a discount or offer
- If churn_risk is high, create gentle urgency
- Max 60 words for whatsapp/sms, 100 words for email
- Sound warm and human, not robotic
- Return only the message text, nothing else"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Hi {first_name}, we have something special for you in {top_category}. Come back and explore!"
