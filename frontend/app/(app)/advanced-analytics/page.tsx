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
            <div className="space-y-3 animate-pulse">
              <div className="bg-slate-50 h-16 rounded-lg"></div>
              <div className="bg-slate-50 h-16 rounded-lg"></div>
              <div className="bg-slate-50 h-16 rounded-lg"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outliers Detected</span>
                <span className="block text-xl font-bold text-slate-950 mt-1">{outliers.outlier_count} records</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Purchase records exceeding boundaries</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lower boundary</span>
                <span className="block text-xl font-bold text-slate-950 mt-1">${outliers.lower_bound}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Q1 - (1.5 * IQR)</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upper boundary</span>
                <span className="block text-xl font-bold text-slate-950 mt-1">${outliers.upper_bound}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Q3 + (1.5 * IQR)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
