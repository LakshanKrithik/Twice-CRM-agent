from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import asyncio
import random
import httpx

app = FastAPI(title="Channel Stub Simulator")

async def simulate_delivery(recipient_id: str, callback_url: str):
    await asyncio.sleep(random.uniform(2, 6))

    events = []

    if random.random() < 0.9:
        events.append("delivered")
        await asyncio.sleep(random.uniform(1, 3))

        if random.random() < 0.6:
            events.append("opened")
            await asyncio.sleep(random.uniform(1, 2))

            if random.random() < 0.5:
                events.append("read")
                await asyncio.sleep(random.uniform(1, 2))

                if random.random() < 0.3:
                    events.append("clicked")
                    await asyncio.sleep(random.uniform(1, 2))

                    if random.random() < 0.2:
                        events.append("converted")
    else:
        events.append("failed")

    async with httpx.AsyncClient() as client:
        for event in events:
            try:
                await client.post(callback_url, json={
                    "recipient_id": recipient_id,
                    "event": event
                })
                await asyncio.sleep(random.uniform(0.5, 1.5))
            except Exception as e:
                print(f"Callback failed: {e}")

class SendRequest(BaseModel):
    recipient_id: str
    customer_name: str
    message: str
    channel: str
    callback_url: str

@app.post("/send")
async def send_message(req: SendRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(simulate_delivery, req.recipient_id, req.callback_url)
    return {"status": "queued"}
