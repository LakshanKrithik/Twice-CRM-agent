import google.generativeai as genai
import json
import os

from pydantic import BaseModel

class AudienceResponse(BaseModel):
    selected_customer_ids: list[str]
    reasoning: str
    recommended_channel: str

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def select_audience(goal: str, twins_data: list) -> dict:
    twins_summary = json.dumps(twins_data[:40], indent=2)

    prompt = f"""You are an AI growth strategist for a retail brand.

Business Goal: {goal}

Shopper Twins (customer profiles):
{twins_summary}

Tasks:
1. Select the most relevant customer IDs for this campaign goal
2. Explain in 3-4 sentences exactly why you selected this audience
3. Recommend the best channel: whatsapp, sms, or email

Respond ONLY with valid JSON. No markdown, no backticks, no explanation outside the JSON.

{{
  "selected_customer_ids": ["id1", "id2"],
  "reasoning": "explanation here",
  "recommended_channel": "whatsapp"
}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown fences if Gemini adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        validated = AudienceResponse.model_validate(result)

        return validated.model_dump()

    except Exception as e:
        print(f"Audience selection failed: {e}")
        # Safe fallback — return first 10 customers
        return {
            "selected_customer_ids": [t["customer_id"] for t in twins_data[:10]],
            "reasoning": "Fallback selection due to parsing error.",
            "recommended_channel": "email"
        }
