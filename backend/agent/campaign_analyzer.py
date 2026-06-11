import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_campaign(goal: str, stats: dict) -> str:
    prompt = f"""Analyze this marketing campaign and give actionable recommendations.

Campaign Goal: {goal}

Results:
- Total recipients: {stats['total']}
- Delivered: {stats['delivered']}
- Opened: {stats['opened']}
- Clicked: {stats['clicked']}
- Failed: {stats['failed']}

Delivery rate: {round(stats['delivered']/stats['total']*100 if stats['total'] else 0, 1)}%
Open rate: {round(stats['opened']/stats['delivered']*100 if stats['delivered'] else 0, 1)}%
Click rate: {round(stats['clicked']/stats['opened']*100 if stats['opened'] else 0, 1)}%

Write 3-4 sentences: what worked, what didn't, and one specific recommendation for the next campaign.
Be direct and data-driven. Return only the analysis, no labels."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return "Campaign completed. Review the stats above to plan your next campaign."
