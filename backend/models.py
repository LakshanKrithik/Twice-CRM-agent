from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


def gen_id():
    return str(uuid.uuid4())


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    city = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship(
        "Order",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    twin = relationship(
        "ShopperTwin",
        back_populates="customer",
        uselist=False,
        cascade="all, delete-orphan"
    )


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=gen_id)

    customer_id = Column(
        String,
        ForeignKey("customers.id")
    )

    amount = Column(Float)
    category = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    customer = relationship(
        "Customer",
        back_populates="orders"
    )


class ShopperTwin(Base):
    __tablename__ = "shopper_twins"

    id = Column(String, primary_key=True, default=gen_id)

    customer_id = Column(
        String,
        ForeignKey("customers.id"),
        unique=True
    )

    recency_days = Column(Integer)
    frequency = Column(Integer)
    monetary_value = Column(Float)

    top_category = Column(String)

    price_sensitivity = Column(String)
    preferred_channel = Column(String)
    churn_risk = Column(String)

    persona_summary = Column(Text)

    last_computed_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    customer = relationship(
        "Customer",
        back_populates="twin"
    )


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=gen_id)

    goal = Column(Text)

    audience_reasoning = Column(Text)

    channel = Column(String)

    status = Column(
        String,
        default="draft"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    recipients = relationship(
        "CampaignRecipient",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )


class CampaignRecipient(Base):
    __tablename__ = "campaign_recipients"

    id = Column(String, primary_key=True, default=gen_id)

    campaign_id = Column(
        String,
        ForeignKey("campaigns.id")
    )

    customer_id = Column(
        String,
        ForeignKey("customers.id")
    )

    message = Column(Text)

    channel = Column(String)

    status = Column(
        String,
        default="queued"
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    campaign = relationship(
        "Campaign",
        back_populates="recipients"
    )

    logs = relationship(
        "CommunicationLog",
        back_populates="recipient",
        cascade="all, delete-orphan"
    )


class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    id = Column(String, primary_key=True, default=gen_id)

    campaign_recipient_id = Column(
        String,
        ForeignKey("campaign_recipients.id")
    )

    event = Column(String)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )

    recipient = relationship(
        "CampaignRecipient",
        back_populates="logs"
    )
