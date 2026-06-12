"use client";
import { useState, useEffect } from "react";
import { runAgent } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap, Activity } from "lucide-react";

const EXAMPLE_GOALS = [
  "Re-engage customers who haven't purchased in 60 days",
  "Upsell premium merchandise to high-spending buyers",
  "Win back churned customers with a discount offer",
  "Promote new arrivals to highly engaged shoppers",
];

const STEPS = [
  "Building Shopper Twins",
  "Analyzing Customers",
  "Selecting Audience",
  "Generating Messages",
  "Launching Campaign",
  "Monitoring Engagement"
];

function Timeline({ loading, result }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading) {
      setStep(0);
      const interval = setInterval(() => {
        setStep(s => (s < 4 ? s + 1 : s));
      }, 3500);
      return () => clearInterval(interval);
    } else if (result) {
      setStep(5);
    }
  }, [loading, result]);

  if (!loading && !result) {
    return (
      <div className="h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold mb-6">Campaign Preview</h3>
        <div className="space-y-4">
          <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex gap-4 items-start">
            <Target className="text-brand-secondary mt-1" size={20} />
            <div>
              <div className="font-medium text-brand-primary">Smart Targeting</div>
              <div className="text-sm text-brand-secondary mt-1">AI analyzes LTV, churn risk, and RFM metrics to select the perfect audience.</div>
            </div>
          </div>
          <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex gap-4 items-start">
            <Zap className="text-brand-secondary mt-1" size={20} />
            <div>
              <div className="font-medium text-brand-primary">Channel Optimization</div>
              <div className="text-sm text-brand-secondary mt-1">Automatically routes via Email, SMS, or WhatsApp based on past engagement.</div>
            </div>
          </div>
          <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex gap-4 items-start">
            <Activity className="text-brand-secondary mt-1" size={20} />
            <div>
              <div className="font-medium text-brand-primary">Expected Impact</div>
              <div className="text-sm text-brand-secondary mt-1">Maximize conversion rates while minimizing communication fatigue.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center py-8">
      <h3 className="text-xl font-semibold mb-8">{result ? "Execution Complete" : "Executing Pipeline"}</h3>
      <div className="space-y-8 relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-brand-border -z-10" />
        
        {STEPS.map((s, i) => {
          const isCompleted = i < step || result;
          const isActive = i === step && loading;
          const isPending = i > step && !result;

          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${
                isCompleted ? 'bg-brand-primary text-brand-bg shadow-[0_0_10px_rgba(250,250,250,0.5)]' : 
                isActive ? 'bg-brand-bg border-2 border-brand-primary text-brand-primary' : 
                'bg-brand-bg border-2 border-brand-border text-brand-border'
              }`}>
                {isCompleted ? '✓' : isActive ? <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" /> : ''}
              </div>
              <div className={`text-base font-medium ${isPending ? 'text-brand-secondary' : 'text-brand-primary'}`}>
                {s}
              </div>
            </motion.div>
          );
        })}
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-5 bg-brand-card border border-brand-border rounded-2xl"
        >
          <div className="text-sm font-medium text-brand-secondary mb-2">Agent Reasoning</div>
          <div className="text-sm text-brand-primary leading-relaxed">
            {result.reasoning}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-brand-secondary border-t border-brand-border pt-4">
            <div><span className="text-brand-primary font-medium">{result.audience_size}</span> Targeted</div>
            <div>•</div>
            <div className="uppercase"><span className="text-brand-primary font-medium">{result.channel}</span> Channel</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AgentPage() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  async function handleRun() {
    if (!goal.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await runAgent(goal);
      setResult(data);
      toast.success("Campaign launched successfully");
    } catch (e) {
      const msg = e.message || "Agent failed to run. Check backend.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-140px)] flex flex-col md:flex-row gap-12 pt-8">
      
      {/* Left Workspace */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-brand-primary mb-3">Workspace</h1>
            <p className="text-brand-secondary text-lg">
              Command your AI Growth Agent. Define a goal and launch a highly targeted campaign instantly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-brand-primary">Campaign Goal</label>
            </div>
            <textarea
              className="w-full bg-brand-card border border-brand-border rounded-2xl p-5 text-brand-primary placeholder-brand-secondary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 resize-none text-base shadow-sm transition-all"
              rows={4}
              placeholder="e.g. Win back our churned premium users with a VIP offer..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              {EXAMPLE_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  disabled={loading}
                  className="text-xs bg-brand-bg border border-brand-border hover:border-brand-secondary text-brand-secondary hover:text-brand-primary px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12">
          {result ? (
            <button
              onClick={() => router.push(`/campaigns/${result.campaign_id}`)}
              className="w-full bg-brand-primary text-brand-bg hover:bg-white font-medium py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              View Campaign Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={loading || !goal.trim()}
              className="w-full bg-brand-primary text-brand-bg hover:bg-white disabled:bg-brand-card disabled:text-brand-secondary disabled:border disabled:border-brand-border font-medium py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles size={18} className="animate-pulse" /> Executing Pipeline...
                </>
              ) : (
                <>
                  Launch Campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right Preview/Timeline */}
      <div className="flex-1 bg-[#0C0C0E] border border-brand-border rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <Timeline loading={loading} result={result} />
      </div>

    </div>
  );
}
