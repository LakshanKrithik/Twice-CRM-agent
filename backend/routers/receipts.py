from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import CampaignRecipient, CommunicationLog, Campaign
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/receipts", tags=["receipts"])

class CallbackPayload(BaseModel):
    recipient_id: str
    event: str

@router.post("/callback")
def handle_callback(payload: CallbackPayload, db: Session = Depends(get_db)):
    recipient = db.query(CampaignRecipient).filter(
        CampaignRecipient.id == payload.recipient_id
    ).first()

    if not recipient:
        return {"error": "recipient not found"}

    # Status hierarchy — never go backwards
    if payload.event == "failed":
        if recipient.status in ["queued", "sent"]:
            recipient.status = "failed"
            recipient.updated_at = datetime.utcnow()
    else:
        status_order = ["queued", "sent", "delivered", "opened", "read", "clicked", "converted"]
        
        current_rank = status_order.index(recipient.status) if recipient.status in status_order else -1
        new_rank = status_order.index(payload.event) if payload.event in status_order else -1

        if new_rank > current_rank:
            recipient.status = payload.event
            recipient.updated_at = datetime.utcnow()

    log = CommunicationLog(
        id=str(uuid.uuid4()),
        campaign_recipient_id=recipient.id,
        event=payload.event,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()

    # Mark campaign as completed if all recipients have settled
    all_recipients = db.query(CampaignRecipient).filter(
        CampaignRecipient.campaign_id == recipient.campaign_id
    ).all()

    settled_statuses = {"delivered", "opened", "read", "clicked", "converted", "failed"}
    all_settled = all(r.status in settled_statuses for r in all_recipients)

    if all_settled:
        campaign = db.query(Campaign).filter(
            Campaign.id == recipient.campaign_id
        ).first()
        if campaign and campaign.status == "running":
            campaign.status = "completed"
            db.commit()

    return {"status": "ok"}
