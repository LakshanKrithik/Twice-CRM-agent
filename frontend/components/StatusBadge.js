const colors = {
  queued: "bg-gray-700 text-gray-300",
  sent: "bg-blue-900 text-blue-300",
  delivered: "bg-cyan-900 text-cyan-300",
  opened: "bg-yellow-900 text-yellow-300",
  read: "bg-orange-900 text-orange-300",
  clicked: "bg-green-900 text-green-300",
  converted: "bg-purple-900 text-purple-300",
  failed: "bg-red-900 text-red-300",
  running: "bg-yellow-900 text-yellow-300",
  completed: "bg-green-900 text-green-300",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        colors[status] || "bg-gray-700 text-gray-300"
      }`}
    >
      {status}
    </span>
  );
}
