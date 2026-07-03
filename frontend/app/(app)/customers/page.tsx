"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Award,
  DollarSign,
  TrendingUp,
  Search,
  Sparkles
} from "lucide-react";
import { apiService } from "../../../services/api";

interface SegmentSummary {
  segment: string;
  count: number;
  avg_spend: number;
  avg_clv: number;
  total_revenue: number;
}

interface ChurnRiskData {
  high_risk_subscribers: number;
  total_subscribers: number;
  churn_rate_pct: number;
}

interface TopCustomer {
  customer_id: number;
  age: number;
  gender: string;
  location: string;
  total_purchases: number;
  aov: number;
  clv: number;
  segment: string;
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<SegmentSummary[]>([]);
  const [churnRisk, setChurnRisk] = useState<ChurnRiskData>({
    high_risk_subscribers: 0,
    total_subscribers: 0,
    churn_rate_pct: 0
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [segRes, churnRes, topRes] = await Promise.all([
        apiService.getSegmentSummary(),
        apiService.getChurnRisk(),
        apiService.getTopCustomers(50)
      ]);
      setSegments(segRes);
      setChurnRisk(churnRes);
      setTopCustomers(topRes);
    } catch (err) {
      console.error("Error fetching customer page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Filter top customers based on state/location or segment search
  const filteredCustomers = topCustomers.filter(c => 
    c.customer_id.toString().includes(searchQuery) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.segment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">RFM cohort breakdowns, churn alerts, and high-value customer ledger.</p>
      </div>

      {/* Top Cards (Segment & Churn overview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscriber Churn Risk Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribers Churn Risk</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{churnRisk.churn_rate_pct}%</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
              {churnRisk.high_risk_subscribers} At Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Subscribers with no orders in over 60 days
          </p>
        </div>

        {/* Total Subscribers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subscribers</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {churnRisk.total_subscribers.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Loyalty program membership count
          </p>
        </div>

        {/* VIP Ratio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Champions Cohort</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {segments.find(s => s.segment === "Champions")?.count || 0}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              Highest LTV
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            VIP customers with high recency & frequency
          </p>
        </div>
      </div>

      {/* RFM Cohort Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-600" />
          RFM Segment Distribution Analysis
        </h3>
        
        {loading ? (
          <div className="h-40 w-full bg-slate-50 animate-pulse rounded-lg"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-bold">
                  <th className="py-3 px-4">Segment Name</th>
                  <th className="py-3 px-4">Customer Count</th>
                  <th className="py-3 px-4">Avg Basket Spend</th>
                  <th className="py-3 px-4">Avg Lifecycle LTV</th>
                  <th className="py-3 px-4 text-right">Total Contributed Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {segments.map((row) => (
                  <tr key={row.segment} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.segment}</td>
                    <td className="py-3.5 px-4">{row.count} customers</td>
                    <td className="py-3.5 px-4">${row.avg_spend}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">${row.avg_clv}</td>
                    <td className="py-3.5 px-4 text-right font-bold">${row.total_revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Customer Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">VIP Customer Ledger</h3>
            <p className="text-slate-400 text-xs mt-0.5">Top-valued retail customers ranked by estimated CLV</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search segment or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium text-slate-700 outline-hidden transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-60 w-full bg-slate-50 animate-pulse rounded-lg"></div>
        ) : filteredCustomers.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No customer matches found.</div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b border-slate-200 shadow-xs z-10">
                <tr className="text-slate-400 text-xs uppercase font-bold">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">US State</th>
                  <th className="py-3 px-4">Orders count</th>
                  <th className="py-3 px-4">Avg Order Value</th>
                  <th className="py-3 px-4">Customer Segment</th>
                  <th className="py-3 px-4 text-right">LTV Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredCustomers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">#{c.customer_id}</td>
                    <td className="py-3 px-4">{c.age} y/o ({c.gender})</td>
                    <td className="py-3 px-4 font-medium">{c.location}</td>
                    <td className="py-3 px-4">{c.total_purchases} transactions</td>
                    <td className="py-3 px-4">${c.aov}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.segment === "Champions"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : c.segment === "Loyal Customers"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : c.segment === "At Risk"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600">${c.clv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
