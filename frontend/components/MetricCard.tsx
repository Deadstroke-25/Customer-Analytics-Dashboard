import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  change?: number;
  changeSuffix?: string;
  description?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  changeSuffix = "% MoM",
  description
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        {change !== undefined && (
          <span 
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
              isPositive 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-rose-600" />
            )}
            {Math.abs(change)}% {changeSuffix}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 font-medium mt-1">{description}</p>
      )}
    </div>
  );
}
