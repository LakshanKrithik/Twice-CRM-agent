"use client";
import { useState } from "react";
import { askAnalytics } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, BarChart2, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

const RECOMMENDED_QUESTIONS = [
  "Top converting city",
  "Best campaign channel",
  "High risk customers",
  "Next campaign recommendation",
  "Campaign performance summary"
];

function DataViewer({ intent, data }) {
  if (!data || Object.keys(data).length === 0) return null;

  if (intent === "city_conversion_analysis" || intent === "channel_performance") {
    return (
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="bg-brand-card border border-brand-border p-5 rounded-2xl flex flex-col items-start justify-center shadow-sm">
            <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2">{key}</div>
            <div className="text-2xl font-bold text-brand-primary">{typeof val === 'object' ? val.conversion_rate + '%' : val}</div>
          </div>
        ))}
      </div>
    );
  }

  if (intent === "category_performance") {
    return (
      <div className="mt-8 grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="bg-brand-card border border-brand-border p-5 rounded-2xl shadow-sm">
            <div className="text-brand-primary font-medium mb-3">{key}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Conversions</span>
                <span className="text-brand-primary font-medium">{val.conversions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-secondary">Campaigns</span>
                <span className="text-brand-primary font-medium">{val.campaigns}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (intent === "churn_risk_customers" || intent === "top_customers") {
    return (
      <div className="mt-8 overflow-hidden border border-brand-border rounded-2xl bg-brand-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-black/20">
              <th className="px-5 py-3 text-xs font-medium text-brand-secondary uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-xs font-medium text-brand-secondary uppercase tracking-wider">Location</th>
              <th className="px-5 py-3 text-xs font-medium text-brand-secondary uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-xs font-medium text-brand-secondary uppercase tracking-wider text-right">LTV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {data.map((c, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-brand-primary">{c.name}</td>
                <td className="px-5 py-4 text-sm text-brand-secondary">{c.city}</td>
                <td className="px-5 py-4 text-sm text-brand-secondary">{c.category}</td>
                <td className="px-5 py-4 text-sm font-medium text-brand-primary text-right">₹{c.spent.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (intent === "campaign_summary") {
    return (
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2">Campaigns</div>
          <div className="text-2xl font-bold text-brand-primary">{data.campaign_count}</div>
        </div>
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2">Delivery Rate</div>
          <div className="text-2xl font-bold text-brand-primary">{data.delivery_rate}%</div>
        </div>
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl shadow-sm">
          <div className="text-brand-secondary text-xs uppercase tracking-wider mb-2">Open Rate</div>
          <div className="text-2xl font-bold text-brand-primary">{data.open_rate}%</div>
        </div>
        <div className="bg-brand-card border border-brand-success/30 bg-brand-success/5 p-5 rounded-2xl shadow-sm">
          <div className="text-brand-success text-xs uppercase tracking-wider mb-2">Conversion</div>
          <div className="text-2xl font-bold text-brand-success">{data.conversion_rate}%</div>
        </div>
      </div>
    );
  }

  if (intent === "next_campaign_recommendation") {
    return (
      <div className="mt-8 bg-brand-card border border-brand-border p-6 rounded-2xl shadow-sm">
        <h4 className="text-brand-primary font-medium mb-4 flex items-center gap-2">
          <Lightbulb size={18} className="text-brand-secondary" /> Recommended Strategy
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 text-brand-secondary text-sm">Primary Goal</div>
            <div className="col-span-2 text-brand-primary font-medium text-sm">{data.campaign_goal}</div>
          </div>
          <div className="h-px bg-brand-border w-full" />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 text-brand-secondary text-sm">Target Audience</div>
            <div className="col-span-2 text-brand-primary font-medium text-sm">{data.audience}</div>
          </div>
          <div className="h-px bg-brand-border w-full" />
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="col-span-1 text-brand-secondary text-sm">Optimal Channel</div>
            <div className="col-span-2 flex">
              <span className="bg-brand-primary text-brand-bg text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                {data.channel}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  async function handleAsk(q) {
    const text = q || question;
    if (!text.trim()) return;

    setQuestion(text);
    setLoading(true);
    setReport(null);

    try {
      const res = await askAnalytics(text);
      setReport({ text: res.insight, data: res.data, intent: res.intent, question: text });
    } catch (e) {
      setReport({ text: "Sorry, there was an error processing your request. Please try again or check the backend.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      
      {/* Header & Search */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight text-brand-primary">Ask your data anything.</h1>
        <p className="text-brand-secondary text-lg">
          Generate instant, boardroom-ready analyst reports on your CRM data. No SQL required.
        </p>

        <div className="relative group mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-brand-secondary" />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            suppressHydrationWarning
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="e.g. Which city has the highest conversion rate?"
            className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-32 py-4 text-brand-primary placeholder-brand-secondary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 text-base shadow-sm transition-all"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              suppressHydrationWarning
              className="bg-brand-primary hover:bg-white text-brand-bg disabled:bg-brand-card disabled:text-brand-secondary disabled:border disabled:border-brand-border text-sm font-medium px-6 py-2 rounded-xl transition-all h-full"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Analyze"}
            </button>
          </div>
        </div>

        {!report && !loading && (
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {RECOMMENDED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                suppressHydrationWarning
                className="text-xs bg-transparent border border-brand-border hover:border-brand-secondary text-brand-secondary hover:text-brand-primary px-4 py-2 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analyst Report Area */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="h-8 w-8 text-brand-secondary animate-spin" />
            <div className="text-brand-secondary text-sm">Querying CRM database & synthesizing insights...</div>
          </motion.div>
        )}

        {report && !loading && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px bg-brand-border flex-1" />
              <div className="text-xs uppercase tracking-widest text-brand-secondary font-medium">Analyst Report</div>
              <div className="h-px bg-brand-border flex-1" />
            </div>

            <div className="bg-brand-bg">
              <h2 className="text-2xl font-semibold text-brand-primary mb-6 leading-snug">
                "{report.question}"
              </h2>
              
              <div className="text-brand-secondary leading-relaxed text-lg mb-8 whitespace-pre-wrap">
                {report.text}
              </div>

              {!report.error && report.data && (
                <div className="mt-8 border-t border-brand-border pt-8">
                  <div className="flex items-center gap-2 text-brand-primary font-medium mb-4">
                    <BarChart2 size={18} />
                    <h3>Supporting Metrics</h3>
                  </div>
                  <DataViewer intent={report.intent} data={report.data} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
