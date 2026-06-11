from database import SessionLocal
from models import Customer, Order
from datetime import datetime, timedelta
import random
import uuid

CATEGORIES = ["Coffee", "Bakery", "Merchandise", "Beverages", "Snacks"]
CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"]


def random_date(days_back_max=365):
    return datetime.utcnow() - timedelta(
        days=random.randint(1, days_back_max)
    )


def seed():
    db = SessionLocal()

    # Clear old data
    db.query(Order).delete()
    db.query(Customer).delete()
    db.commit()

    customers = []

    for i in range(60):
        customer = Customer(
            id=str(uuid.uuid4()),
            name=f"Customer {i+1}",
            email=f"customer{i+1}@example.com",
            phone=f"+91{''.join([str(random.randint(0,9)) for _ in range(10)])}",
            city=random.choice(CITIES)
        )

        customers.append(customer)
        db.add(customer)

    db.commit()

    for customer in customers:
        num_orders = random.randint(1, 10)

        for _ in range(num_orders):
            order = Order(
                id=str(uuid.uuid4()),
                customer_id=customer.id,
                amount=round(random.uniform(150, 3000), 2),
                category=random.choice(CATEGORIES),
                created_at=random_date()
            )

            db.add(order)

    db.commit()
    db.close()

    print("Seeded 60 customers with orders.")


if __name__ == "__main__":
    seed()
