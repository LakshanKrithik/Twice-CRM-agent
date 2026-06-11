from sqlalchemy.orm import Session
from models import Customer, ShopperTwin, Campaign, CampaignRecipient
from agent.twin_builder import build_all_twins
from agent.audience_selector import select_audience
from agent.message_generator import generate_message
import httpx
import os
import uuid
from datetime import datetime

CHANNEL_STUB_URL = os.getenv("CHANNEL_STUB_URL", "http://localhost:8001")
CRM_CALLBACK_URL = os.getenv("CRM_CALLBACK_URL", "http://localhost:8000")

async def run_agent(goal: str, db: Session) -> dict:
    execution_log = []

    # Step 1 — Build Shopper Twins
    build_all_twins(db)
    execution_log.append("Built Shopper Twins for all customers")

    # Step 2 — Load twins
    twins = db.query(ShopperTwin).join(Customer).all()
    twins_data = [{
        "customer_id": t.customer_id,
        "name": t.customer.name,
        "recency_days": t.recency_days,
        "frequency": t.frequency,
        "monetary_value": t.monetary_value,
        "top_category": t.top_category,
        "price_sensitivity": t.price_sensitivity,
        "churn_risk": t.churn_risk,
        "preferred_channel": t.preferred_channel,
        "persona_summary": t.persona_summary
    } for t in twins]
    execution_log.append(f"Loaded {len(twins_data)} Shopper Twins for analysis")

    # Step 3 — Select audience
    audience_result = select_audience(goal, twins_data)
    selected_ids = audience_result["selected_customer_ids"]
    reasoning = audience_result["reasoning"]
    channel = audience_result["recommended_channel"]
    execution_log.append(f"Selected {len(selected_ids)} customers based on goal analysis")
    execution_log.append(f"Recommended channel: {channel.upper()}")

    # Step 4 — Create campaign record
    campaign = Campaign(
        id=str(uuid.uuid4()),
        goal=goal,
        audience_reasoning=reasoning,
        channel=channel,
        status="running",
        created_at=datetime.utcnow()
    )
    db.add(campaign)
    db.commit()
    execution_log.append(f"Campaign created with ID: {campaign.id[:8]}...")

    # Step 5 — Generate personalized messages
    twins_by_id = {t.customer_id: t for t in twins}
    recipients = []

    for cid in selected_ids:
        twin = twins_by_id.get(cid)
        if not twin:
            continue

        message = generate_message(
            goal=goal,
            customer_name=twin.customer.name,
            top_category=twin.top_category,
            price_sensitivity=twin.price_sensitivity,
            churn_risk=twin.churn_risk,
            channel=channel
        )

        recipient = CampaignRecipient(
            id=str(uuid.uuid4()),
            campaign_id=campaign.id,
            customer_id=cid,
            message=message,
            channel=channel,
            status="queued"
        )
        db.add(recipient)
        recipients.append(recipient)

    db.commit()
    execution_log.append(f"Generated {len(recipients)} personalized messages")

    # Step 6 — Fire campaign via channel stub
    failed_count = 0
    async with httpx.AsyncClient() as http:
        for recipient in recipients:
            twin = twins_by_id.get(recipient.customer_id)
            try:
                await http.post(f"{CHANNEL_STUB_URL}/send", json={
                    "recipient_id": recipient.id,
                    "customer_name": twin.customer.name if twin else "",
                    "message": recipient.message,
                    "channel": recipient.channel,
                    "callback_url": f"{CRM_CALLBACK_URL}/api/receipts/callback"
                })
                recipient.status = "sent"
            except Exception as e:
                print(f"Failed to send to {recipient.id}: {e}")
                recipient.status = "failed"
                failed_count += 1

    db.commit()

    if failed_count == 0:
        execution_log.append(f"Launched campaign — {len(recipients)} messages dispatched via {channel.upper()}")
    else:
        execution_log.append(f"Launched campaign — {len(recipients) - failed_count} sent, {failed_count} failed")

    execution_log.append("Monitoring delivery and engagement via channel callbacks...")

    return {
        "campaign_id": campaign.id,
        "goal": goal,
        "audience_size": len(recipients),
        "channel": channel,
        "reasoning": reasoning,
        "status": "running",
        "execution_log": execution_log
    }
