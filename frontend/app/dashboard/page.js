"use client";
import { useEffect, useState } from "react";
import { getCampaigns } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, BarChart2, MousePointer2, MailOpen, Send, Target } from "lucide-react";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCampaigns() {
    const data = await getCampaigns();
    setCampaigns(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-brand-secondary">
        Loading...
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-brand-border rounded-2xl bg-brand-card py-20 mt-8">
        <h3 className="text-xl font-medium text-brand-primary mb-2">No campaigns yet</h3>
        <p className="text-brand-secondary mb-6">Create your first AI-powered campaign.</p>
        <Link
          href="/agent"
          className="bg-brand-primary text-brand-bg hover:bg-white font-medium px-6 py-2.5 rounded-xl transition-colors inline-block"
        >
          Launch Campaign
        </Link>
      </div>
    );
  }

  // Aggregate stats
  const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.stats?.delivered || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.stats?.opened || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.stats?.clicked || 0), 0);
  const totalConverted = campaigns.reduce((acc, c) => acc + (c.stats?.converted || 0), 0);
  
  const funnelSteps = [
    { label: "Sent", value: totalSent, rate: "100%" },
    { label: "Delivered", value: totalDelivered, rate: totalSent ? Math.round((totalDelivered/totalSent)*100) + "%" : "0%" },
    { label: "Opened", value: totalOpened, rate: totalDelivered ? Math.round((totalOpened/totalDelivered)*100) + "%" : "0%" },
    { label: "Clicked", value: totalClicked, rate: totalOpened ? Math.round((totalClicked/totalOpened)*100) + "%" : "0%" },
    { label: "Converted", value: totalConverted, rate: totalClicked ? Math.round((totalConverted/totalClicked)*100) + "%" : "0%" },
  ];

  return (
    <div className="space-y-12 py-8 min-h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">Dashboard</h1>
          <p className="text-brand-secondary text-lg mt-1">Aggregate performance across all campaigns.</p>
        </div>
        <Link
          href="/agent"
          className="bg-brand-primary text-brand-bg hover:bg-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Create Campaign
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Send size={14} /> Delivered</div>
          <div className="text-3xl font-bold text-brand-primary">{totalDelivered}</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><MailOpen size={14} /> Opened</div>
          <div className="text-3xl font-bold text-brand-primary">{totalOpened}</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><MousePointer2 size={14} /> Clicked</div>
          <div className="text-3xl font-bold text-brand-primary">{totalClicked}</div>
        </div>
        <div className="bg-brand-card border border-brand-success/30 bg-brand-success/5 rounded-2xl p-5 shadow-sm">
          <div className="text-brand-success text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Target size={14} /> Converted</div>
          <div className="text-3xl font-bold text-brand-success">{totalConverted}</div>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2">Total Campaigns</div>
          <div className="text-3xl font-bold text-brand-primary">{campaigns.length}</div>
        </div>
      </div>

      {/* Visual Funnel */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-brand-primary font-medium mb-8 flex items-center gap-2">
          <BarChart2 size={18} className="text-brand-secondary" /> Conversion Funnel
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {funnelSteps.map((step, idx) => (
            <div key={step.label} className="flex-1 w-full flex flex-col items-center relative group">
              <div className="bg-brand-bg border border-brand-border w-full py-6 rounded-2xl text-center shadow-inner relative z-10 group-hover:border-brand-secondary transition-colors">
                <div className="text-2xl font-bold text-brand-primary">{step.value}</div>
                <div className="text-xs text-brand-secondary uppercase tracking-wider mt-1">{step.label}</div>
              </div>
              {idx < funnelSteps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-0 text-brand-secondary items-center justify-center bg-brand-card px-2">
                  <ArrowRight size={20} />
                </div>
              )}
              {idx > 0 && (
                <div className="mt-4 text-xs font-medium text-brand-success bg-brand-success/10 px-2 py-1 rounded-md">
                  {step.rate} from previous
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div>
        <h3 className="text-xl font-medium text-brand-primary mb-4">Recent Campaigns</h3>
        <div className="overflow-hidden border border-brand-border rounded-2xl bg-brand-card shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-black/20">
                <th className="px-6 py-4 text-xs font-medium text-brand-secondary uppercase tracking-wider sticky top-0 bg-brand-bg/80 backdrop-blur-md">Campaign Goal</th>
                <th className="px-6 py-4 text-xs font-medium text-brand-secondary uppercase tracking-wider sticky top-0 bg-brand-bg/80 backdrop-blur-md">Channel</th>
                <th className="px-6 py-4 text-xs font-medium text-brand-secondary uppercase tracking-wider sticky top-0 bg-brand-bg/80 backdrop-blur-md">Targeted</th>
                <th className="px-6 py-4 text-xs font-medium text-brand-secondary uppercase tracking-wider sticky top-0 bg-brand-bg/80 backdrop-blur-md">Conversions</th>
                <th className="px-6 py-4 text-xs font-medium text-brand-secondary uppercase tracking-wider sticky top-0 bg-brand-bg/80 backdrop-blur-md text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => window.location.href = `/campaigns/${c.id}`}>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-brand-primary mb-1">{c.goal}</div>
                    <div className="text-xs text-brand-secondary">{new Date(c.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs bg-brand-bg border border-brand-border px-2 py-1 rounded-md text-brand-primary uppercase font-medium">{c.channel}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-brand-primary font-medium">{c.stats?.total || 0}</td>
                  <td className="px-6 py-5 text-sm text-brand-success font-medium">{c.stats?.converted || 0}</td>
                  <td className="px-6 py-5 text-right">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm ${
                      c.status === 'completed' ? 'bg-brand-success/10 text-brand-success' : 
                      c.status === 'failed' ? 'bg-brand-danger/10 text-brand-danger' : 
                      'bg-brand-warning/10 text-brand-warning'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
