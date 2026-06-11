from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Customer, Order

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("/")
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    result = []
    for c in customers:
        orders = db.query(Order).filter(Order.customer_id == c.id).all()
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "city": c.city,
            "order_count": len(orders),
            "total_spent": round(sum(o.amount for o in orders), 2)
        })
    return result

@router.get("/{customer_id}")
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return {"error": "customer not found"}
    orders = db.query(Order).filter(Order.customer_id == customer_id).all()
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "city": customer.city,
        "orders": [{
            "id": o.id,
            "amount": o.amount,
            "category": o.category,
            "created_at": o.created_at
        } for o in orders]
    }
