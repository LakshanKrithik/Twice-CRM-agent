"use client";
import { useEffect, useState } from "react";
import { getCampaign } from "@/lib/api";
import StatsBar from "@/components/StatsBar";
import StatusBadge from "@/components/StatusBadge";
import { useParams } from "next/navigation";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout;
    async function fetchCampaign() {
      const result = await getCampaign(id);
      setData(result);
      setLoading(false);
      
      if (result?.campaign?.status !== "completed") {
        timeout = setTimeout(fetchCampaign, 5000);
      }
    }
    
    fetchCampaign();
    return () => clearTimeout(timeout);
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-20">Loading campaign...</div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="text-center text-red-400 py-20">Campaign not found.</div>
    );
  }

  const { campaign, stats, analysis, recipients } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.goal}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(campaign.created_at).toLocaleString()} ·{" "}
            <span className="uppercase">{campaign.channel}</span>
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Agent Reasoning */}
      <div className="bg-gray-900 border border-purple-900 rounded-xl p-4">
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">
          Agent Reasoning
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          {campaign.reasoning}
        </p>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-gray-900 border border-green-900 rounded-xl p-4">
          <p className="text-xs text-green-400 uppercase tracking-widest mb-2">
            AI Campaign Analysis
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">{analysis}</p>
        </div>
      )}

      {/* Recipients table */}
      <div>
        <p className="text-sm text-gray-400 mb-3">
          Recipients ({recipients.length})
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Customer
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Channel
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">
                  Message
                </th>
                <th className="px-4 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-800 last:border-0 ${
                    i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {r.customer_id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-gray-400 uppercase text-xs">
                    {r.channel}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                    {r.message}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
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
