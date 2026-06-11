from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import agent, receipts, dashboard, customers
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TWICE CRM Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent.router)
app.include_router(receipts.router)
app.include_router(dashboard.router)
app.include_router(customers.router)

@app.get("/")
def root():
    return {"status": "TWICE CRM Agent running"}
