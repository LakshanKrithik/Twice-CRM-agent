from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Campaign, CampaignRecipient, Customer, ShopperTwin
from agent.campaign_analyzer import analyze_campaign

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def compute_stats(recipients: list) -> dict:
    return {
        "total": len(recipients),
        "sent": sum(1 for r in recipients if r.status in ["sent", "delivered", "opened", "read", "clicked", "converted"]),
        "delivered": sum(1 for r in recipients if r.status in ["delivered", "opened", "read", "clicked", "converted"]),
        "opened": sum(1 for r in recipients if r.status in ["opened", "read", "clicked", "converted"]),
        "read": sum(1 for r in recipients if r.status in ["read", "clicked", "converted"]),
        "clicked": sum(1 for r in recipients if r.status in ["clicked", "converted"]),
        "converted": sum(1 for r in recipients if r.status == "converted"),
        "failed": sum(1 for r in recipients if r.status == "failed"),
    }

@router.get("/campaigns")
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    result = []
    for c in campaigns:
        recipients = db.query(CampaignRecipient).filter(
            CampaignRecipient.campaign_id == c.id
        ).all()
        result.append({
            "id": c.id,
            "goal": c.goal,
            "channel": c.channel,
            "status": c.status,
            "created_at": c.created_at,
            "reasoning": c.audience_reasoning,
            "stats": compute_stats(recipients)
        })
    return result

@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

    if not campaign:
        return {"error": "campaign not found"}

    recipients = db.query(CampaignRecipient).filter(
        CampaignRecipient.campaign_id == campaign_id
    ).all()

    stats = compute_stats(recipients)
    analysis = analyze_campaign(campaign.goal, stats)

    return {
        "campaign": {
            "id": campaign.id,
            "goal": campaign.goal,
            "channel": campaign.channel,
            "reasoning": campaign.audience_reasoning,
            "status": campaign.status,
            "created_at": campaign.created_at,
        },
        "stats": stats,
        "analysis": analysis,
        "recipients": [{
            "id": r.id,
            "customer_id": r.customer_id,
            "message": r.message,
            "channel": r.channel,
            "status": r.status,
            "updated_at": r.updated_at
        } for r in recipients]
    }

@router.get("/twins")
def list_twins(db: Session = Depends(get_db)):
    twins = db.query(ShopperTwin).join(Customer).all()
    return [{
        "customer_id": t.customer_id,
        "name": t.customer.name,
        "city": t.customer.city,
        "recency_days": t.recency_days,
        "frequency": t.frequency,
        "monetary_value": t.monetary_value,
        "top_category": t.top_category,
        "price_sensitivity": t.price_sensitivity,
        "churn_risk": t.churn_risk,
        "preferred_channel": t.preferred_channel,
        "persona_summary": t.persona_summary
    } for t in twins]
