"use client";

import { cn } from "~/lib/utils";

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "purple" | "green";
}

export function StepCard({ number, icon, title, description, color }: StepCardProps) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200",
    green: "bg-green-100 text-green-600 border-green-200",
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", colors[color])}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
