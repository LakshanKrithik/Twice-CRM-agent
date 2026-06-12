export default function StatsBar({ stats }) {
  const metrics = [
    { label: "Total", value: stats.total, color: "text-gray-300" },
    { label: "Delivered", value: stats.delivered, color: "text-cyan-400" },
    { label: "Opened", value: stats.opened, color: "text-yellow-400" },
    { label: "Read", value: stats.read, color: "text-orange-400" },
    { label: "Clicked", value: stats.clicked, color: "text-green-400" },
    { label: "Converted", value: stats.converted, color: "text-purple-400" },
    { label: "Failed", value: stats.failed, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"
        >
          <p className={`text-xl font-bold ${m.color}`}>{m.value ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">{m.label}</p>
        </div>
      ))}
    </div>
  );
}
