"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: "/agent", label: "Agent" },
    { href: "/dashboard", label: "Campaigns" },
    { href: "/twins", label: "Shopper Twins" },
    { href: "/insights", label: "Insights" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-lg tracking-tight text-brand-primary">
            TWICE <span className="text-brand-secondary font-normal">CRM</span>
          </Link>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-1 bg-brand-card border border-brand-border rounded-full px-2 py-1">
          {links.map((l) => {
            const isActive = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#2A2A2D] text-brand-primary font-medium shadow-sm"
                    : "text-brand-secondary hover:text-brand-primary hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="text-brand-secondary hover:text-brand-primary transition-colors">
            <Settings size={18} />
          </button>
          <div className="h-8 w-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-secondary hover:text-brand-primary hover:border-brand-secondary cursor-pointer transition-colors">
            <User size={16} />
          </div>
        </div>
      </div>
    </nav>
  );
}
