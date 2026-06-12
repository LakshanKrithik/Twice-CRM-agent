"use client";
import { useEffect, useState } from "react";
import { getTwins } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export default function TwinsPage() {
  const [twins, setTwins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTwin, setSelectedTwin] = useState(null);

  useEffect(() => {
    getTwins().then((data) => {
      setTwins(data);
      setLoading(false);
    });
  }, []);

  const filtered = twins.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.top_category.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col pt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-brand-primary tracking-tight">Shopper Twins</h1>
          <p className="text-brand-secondary text-lg mt-1">
            AI-generated behavioral profiles.
          </p>
        </div>
        <div className="text-brand-secondary text-sm font-medium bg-brand-card border border-brand-border px-3 py-1.5 rounded-full">
          {twins.length} profiles
        </div>
      </div>

      <div className="relative group mb-8 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-brand-secondary" />
        </div>
        <input
          type="text"
          placeholder="Search by name, city, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-brand-primary placeholder-brand-secondary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 text-sm shadow-sm transition-all"
        />
      </div>

      {loading ? (
        <div className="text-brand-secondary py-20 flex items-center justify-center">
          Loading...
        </div>
      ) : twins.length === 0 ? (
        <div className="text-center py-20 border border-brand-border rounded-2xl bg-brand-card">
          <p className="text-brand-secondary">No Shopper Twins generated yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-brand-border rounded-2xl bg-brand-card">
          <p className="text-brand-secondary">No twins found matching "{search}".</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.customer_id}
              onClick={() => setSelectedTwin(t)}
              className="bg-brand-card border border-brand-border hover:border-brand-secondary hover:shadow-md transition-all cursor-pointer rounded-2xl p-5"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-secondary flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-primary font-medium truncate">{t.name}</p>
                  <p className="text-xs text-brand-secondary truncate">{t.city}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-semibold text-brand-primary">₹{Math.round(t.monetary_value).toLocaleString()}</p>
                  <p className="text-[10px] text-brand-secondary uppercase tracking-wider">LTV</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm ${
                  t.churn_risk === 'high' ? 'bg-brand-danger/10 text-brand-danger' : 
                  t.churn_risk === 'medium' ? 'bg-brand-warning/10 text-brand-warning' : 
                  'bg-brand-success/10 text-brand-success'
                }`}>
                  {t.churn_risk} Risk
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm bg-brand-bg border border-brand-border text-brand-secondary truncate">
                  {t.top_category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Panel */}
      <AnimatePresence>
        {selectedTwin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTwin(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-brand-card border-l border-brand-border shadow-2xl z-50 overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary text-xl font-medium">
                      {selectedTwin.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-primary">{selectedTwin.name}</h2>
                      <p className="text-brand-secondary">{selectedTwin.city}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTwin(null)} className="text-brand-secondary hover:text-brand-primary transition-colors p-2 bg-brand-bg rounded-full">
                    <X size={20} />
                  </button>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-brand-primary">₹{Math.round(selectedTwin.monetary_value).toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-wider text-brand-secondary mt-1">LTV</p>
                  </div>
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-brand-primary">{selectedTwin.frequency}</p>
                    <p className="text-[10px] uppercase tracking-wider text-brand-secondary mt-1">Orders</p>
                  </div>
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-brand-primary">{selectedTwin.recency_days}d</p>
                    <p className="text-[10px] uppercase tracking-wider text-brand-secondary mt-1">Recency</p>
                  </div>
                </div>

                {/* Persona Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-primary mb-3 flex items-center gap-2">
                    <User size={16} className="text-brand-secondary" /> Behavior Summary
                  </h3>
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-5 text-sm text-brand-secondary leading-relaxed italic">
                    "{selectedTwin.persona_summary}"
                  </div>
                </div>

                {/* Attributes Table */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-primary mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-secondary" /> Spending Patterns
                  </h3>
                  <div className="border border-brand-border rounded-xl bg-brand-bg divide-y divide-brand-border">
                    <div className="flex justify-between items-center p-4">
                      <span className="text-brand-secondary text-sm">Favorite Category</span>
                      <span className="text-sm font-medium text-brand-primary">{selectedTwin.top_category}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-brand-secondary text-sm">Price Sensitivity</span>
                      <span className="text-sm font-medium text-brand-primary capitalize">{selectedTwin.price_sensitivity}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-brand-secondary text-sm">Best Channel</span>
                      <span className="text-sm font-medium text-brand-primary uppercase bg-[#2A2A2D] px-2 py-0.5 rounded-md">{selectedTwin.preferred_channel}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-brand-secondary text-sm">Churn Risk</span>
                      <span className={`text-sm font-medium capitalize ${
                        selectedTwin.churn_risk === 'high' ? 'text-brand-danger' : 
                        selectedTwin.churn_risk === 'medium' ? 'text-brand-warning' : 
                        'text-brand-success'
                      }`}>{selectedTwin.churn_risk}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
