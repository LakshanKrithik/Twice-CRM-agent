"use client";
import { useEffect, useState } from "react";

export default function ExecutionLog({ logs }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    setVisible([]);
    let timeouts = [];
    logs.forEach((log, i) => {
      const t = setTimeout(() => {
        setVisible((prev) => [...prev, log]);
      }, i * 400);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [logs]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
        Agent Execution Log
      </p>
      {visible.map((log, i) => (
        <div key={i} className="flex items-start gap-3 animate-fade-in">
          <span className="text-purple-400 mt-0.5">▸</span>
          <span className="text-sm text-gray-300">{log}</span>
        </div>
      ))}
    </div>
  );
}
