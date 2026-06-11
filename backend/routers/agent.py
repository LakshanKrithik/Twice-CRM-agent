from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from agent.pipeline import run_agent
from pydantic import BaseModel

router = APIRouter(prefix="/api/agent", tags=["agent"])

class GoalRequest(BaseModel):
    goal: str

@router.post("/run")
async def run(req: GoalRequest, db: Session = Depends(get_db)):
    result = await run_agent(req.goal, db)
    return result
