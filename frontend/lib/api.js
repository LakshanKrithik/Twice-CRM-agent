const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runAgent(goal) {
  const res = await fetch(`${BASE_URL}/api/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || "API Error");
  return data;
}

export async function getCampaigns() {
  const res = await fetch(`${BASE_URL}/api/dashboard/campaigns`, { cache: 'no-store' });
  return res.json();
}

export async function getCampaign(id) {
  const res = await fetch(`${BASE_URL}/api/dashboard/campaigns/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getCustomers() {
  const res = await fetch(`${BASE_URL}/api/customers/`, { cache: 'no-store' });
  return res.json();
}

export async function getTwins() {
  const res = await fetch(`${BASE_URL}/api/dashboard/twins`, { cache: 'no-store' });
  return res.json();
}

export async function askAnalytics(question) {
  const res = await fetch(`${BASE_URL}/api/analytics/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || "API Error");
  return data;
}
