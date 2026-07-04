"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  TrendingUp, 
  HelpCircle, 
  AlertCircle,
  Activity,
  Sparkles
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { apiService } from "../../../services/api";

interface OutlierData {
  column: string;
  outlier_count: number;
  lower_bound: number;
  upper_bound: number;
  q1: number;
  q3: number;
  median: number;
  min: number;
  max: number;
  total_records: number;
}

export default function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<any[]>([]);
  const [outliers, setOutliers] = useState<OutlierData>({
    column: "purchase_amount",
    outlier_count: 0,
    lower_bound: 0,
    upper_bound: 0,
    q1: 0,
    q3: 0,
    median: 0,
    min: 0,
    max: 0,
    total_records: 0
  });
  const [correlation, setCorrelation] = useState<Record<string, Record<string, number>>>({});

  const fetchMlData = async () => {
    setLoading(true);
    try {
      const [foreRes, outlierRes, corrRes] = await Promise.all([
        apiService.getSalesForecast(),
        apiService.getOutliers("purchase_amount"),
        apiService.getCorrelation()
      ]);
      setForecast(foreRes);
      setOutliers(outlierRes);
      setCorrelation(corrRes);
    } catch (err) {
      console.error("Error loading Advanced Analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMlData();
  }, []);

  const getHeatmapColor = (val: number) => {
    if (val === 1) return "bg-blue-100 text-blue-800 font-bold";
    if (val > 0.3) return "bg-blue-50 text-blue-700";
    if (val < -0.3) return "bg-rose-50 text-rose-700";
    return "bg-slate-50/50 text-slate-500";
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Statistical forecasts, correlation matrices, and database transaction outlier boundaries.</p>
      </div>

      {/* 1. Time Series Sales Forecasting Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              6-Month Sales Forecast Model (Linear Regression)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Demonstration Model
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Fits linear regression estimators on historical aggregates to project monthly sales curves.
          </p>
        </div>
        
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg"></div>
          ) : forecast.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">Insufficient time-series coordinates to fit forecasting model.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Historical Sales (Actual)" 
                  data={forecast.filter(f => f.type === "actual")} 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Projected Trend (Forecast Baseline)" 
                  data={forecast.filter(f => f.type === "forecast" || f.month === forecast.filter(a => a.type === "actual").pop()?.month)} 
                  stroke="#ea580c" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={{ r: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid containing Correlation Heatmap & IQR Outliers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Pearson Correlation Heatmap Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-600" />
              Pearson Numerical Correlation Matrix
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Evaluates strength between demographic profiles and transaction features.</p>
          </div>

          {loading ? (
            <div className="h-56 w-full bg-slate-50 animate-pulse rounded-lg"></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-2">Metric</th>
                    {Object.keys(correlation).map((key) => (
                      <th key={key} className="py-2 px-1 text-center truncate max-w-[80px]" title={key}>
                        {key.replace("_estimate", "").replace("previous_", "prev_")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {Object.entries(correlation).map(([rowKey, colValues]) => (
                    <tr key={rowKey}>
                      <td className="py-2.5 font-bold text-slate-800 uppercase tracking-tight text-[10px]">
                        {rowKey.replace("_estimate", "").replace("previous_", "prev_")}
                      </td>
                      {Object.values(colValues).map((val, index) => (
                        <td 
                          key={index}
                          className={`py-2 px-1 text-center font-medium border border-slate-100 rounded-md ${getHeatmapColor(val)}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Outlier Analysis Card Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Outlier Detection (IQR)
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Calculates transaction dispersion limits dynamically.</p>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="bg-slate-50 h-36 rounded-lg"></div>
              <div className="bg-slate-50 h-28 rounded-lg"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Box Plot Visualizer */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Box & Whisker Plot ({outliers.column})
                </span>
                
                {/* SVG Box Plot */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                    <defs>
                      <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    
                    {(() => {
                      const scaleMin = Math.min(outliers.min, outliers.lower_bound, 0);
                      const scaleMax = Math.max(outliers.max, outliers.upper_bound);
                      const range = scaleMax - scaleMin || 1;
                      
                      // Map values to coordinates inside the 25-375 x-span
                      const getX = (val: number) => 25 + ((val - scaleMin) / range) * 350;
                      
                      const xMin = getX(outliers.min);
                      const xMax = getX(outliers.max);
                      const xQ1 = getX(outliers.q1);
                      const xQ3 = getX(outliers.q3);
                      const xMedian = getX(outliers.median);
                      const xLb = getX(outliers.lower_bound);
                      const xUb = getX(outliers.upper_bound);
                      
                      return (
                        <>
                          {/* Main Axis Line */}
                          <line x1="25" y1="60" x2="375" y2="60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                          
                          {/* Fences / Bounds (Dashed Red Lines) */}
                          <line x1={xLb} y1="15" x2={xLb} y2="105" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                          <line x1={xUb} y1="15" x2={xUb} y2="105" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                          
                          {/* Fence Labels */}
                          <text x={xLb + 5} y="16" fill="#e11d48" fontSize="8" fontWeight="bold" textAnchor="start">Lower Boundary</text>
                          <text x={xUb - 5} y="16" fill="#e11d48" fontSize="8" fontWeight="bold" textAnchor="end">Upper Boundary</text>
                          
                          {/* Whiskers (Range) */}
                          <line x1={xMin} y1="60" x2={xQ1} y2="60" stroke="#64748b" strokeWidth="2" />
                          <line x1={xQ3} y1="60" x2={xMax} y2="60" stroke="#64748b" strokeWidth="2" />
                          
                          {/* Whisker End Caps */}
                          <line x1={xMin} y1="48" x2={xMin} y2="72" stroke="#64748b" strokeWidth="2" />
                          <line x1={xMax} y1="48" x2={xMax} y2="72" stroke="#64748b" strokeWidth="2" />
                          
                          {/* Box (IQR) */}
                          <rect 
                            x={xQ1} 
                            y="40" 
                            width={Math.max(xQ3 - xQ1, 2)} 
                            height="40" 
                            fill="url(#boxGrad)" 
                            stroke="#2563eb" 
                            strokeWidth="2"
                            rx="2"
                          />
                          
                          {/* Median Line */}
                          <line x1={xMedian} y1="40" x2={xMedian} y2="80" stroke="#1d4ed8" strokeWidth="3" />
                          
                          {/* Value Labels under the ticks */}
                          <text x={xMin} y="85" fill="#475569" fontSize="8" textAnchor="middle">${outliers.min}</text>
                          <text x={xMax} y="85" fill="#475569" fontSize="8" textAnchor="middle">${outliers.max}</text>
                          <text x={xQ1} y="34" fill="#2563eb" fontSize="8" fontWeight="semibold" textAnchor="middle">${outliers.q1}</text>
                          <text x={xQ3} y="34" fill="#2563eb" fontSize="8" fontWeight="semibold" textAnchor="middle">${outliers.q3}</text>
                          <text x={xMedian} y="94" fill="#1d4ed8" fontSize="9" fontWeight="bold" textAnchor="middle">${outliers.median}</text>
                          
                          {/* Value Labels for Fences */}
                          <text x={xLb + 5} y="112" fill="#be123c" fontSize="8" textAnchor="start">${outliers.lower_bound}</text>
                          <text x={xUb - 5} y="112" fill="#be123c" fontSize="8" textAnchor="end">${outliers.upper_bound}</text>
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
              
              {/* Detailed Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outliers Detected</span>
                  <span className="block text-sm font-black text-slate-900 mt-0.5">{outliers.outlier_count} records</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">IQR (Dispersion)</span>
                  <span className="block text-sm font-black text-slate-900 mt-0.5">${(outliers.q3 - outliers.q1).toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lower Boundary</span>
                  <span className="block text-sm font-bold text-rose-600 mt-0.5">${outliers.lower_bound}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Upper Boundary</span>
                  <span className="block text-sm font-bold text-rose-600 mt-0.5">${outliers.upper_bound}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
