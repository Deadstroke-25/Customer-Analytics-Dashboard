"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Percent,
  Award,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { apiService, FilterParams } from "../../../services/api";
import MetricCard from "../../../components/MetricCard";
import FilterPanel from "../../../components/FilterPanel";

interface KpiData {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  active_customers: number;
  returning_customers: number;
  returning_percentage: number;
  revenue_growth_pct: number;
  total_clv_estimate: number;
  insights?: {
    highest_category: string;
    top_state: string;
    highest_clv_segment: string;
    subscriber_churn: string;
    most_used_payment: string;
  };
}

interface SegmentSummary {
  segment: string;
  count: number;
  avg_spend: number;
  avg_clv: number;
  total_revenue: number;
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterParams>({});
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<KpiData>({
    total_revenue: 0,
    total_orders: 0,
    avg_order_value: 0,
    active_customers: 0,
    returning_customers: 0,
    returning_percentage: 0,
    revenue_growth_pct: 0,
    total_clv_estimate: 0
  });

  const [salesTrends, setSalesTrends] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [demographics, setDemographics] = useState({ gender: [], age_groups: [] });
  const [paymentStats, setPaymentStats] = useState([]);
  const [regionStats, setRegionStats] = useState([]);
  const [segmentStats, setSegmentStats] = useState<SegmentSummary[]>([]);

  const COLORS = ["#2563eb", "#0d9488", "#4f46e5", "#ea580c", "#c026d3", "#65a30d", "#0284c7", "#475569"];

  const fetchDashboardData = async (activeFilters: FilterParams) => {
    setLoading(true);
    try {
      const [kpiRes, trendsRes, catRes, demoRes, payRes, regRes, segRes] = await Promise.all([
        apiService.getKpis(activeFilters),
        apiService.getSalesTrends(activeFilters),
        apiService.getCategoryPerformance(activeFilters),
        apiService.getDemographics(activeFilters),
        apiService.getPaymentMethods(activeFilters),
        apiService.getRegions(activeFilters),
        apiService.getSegmentSummary(activeFilters)
      ]);
      setKpis(kpiRes);
      setSalesTrends(trendsRes);
      setCategoryStats(catRes);
      setDemographics(demoRes);
      setPaymentStats(payRes);
      setRegionStats(regRes);
      setSegmentStats(segRes);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(filters);
  }, [filters]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">High-level financial KPIs, sales trends, and demographics.</p>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel onFilterChange={(newFilters) => setFilters(newFilters)} />

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 h-28 rounded-xl"></div>
          ))}
        </div>
      ) : (
        /* KPI Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${(kpis.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            change={kpis.revenue_growth_pct}
            description="Sum of all transaction purchase amounts"
          />
          <MetricCard
            title="Total Sales Orders"
            value={kpis.total_orders.toLocaleString()}
            icon={ShoppingBag}
            description="Total transaction count loaded"
          />
          <MetricCard
            title="Avg Order Value (AOV)"
            value={`$${kpis.avg_order_value}`}
            icon={Percent}
            description="Average basket spend per transaction"
          />
          <MetricCard
            title="Customer LTV Estimate"
            value={`$${(kpis.total_clv_estimate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={Award}
            description="Sum of forecasted client lifecycle values"
          />
        </div>
      )}

      {/* Empty State Check */}
      {!loading && kpis.total_orders === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <AlertTriangle className="h-10 w-10 text-slate-450 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800">No Records Found</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            No customer transaction records match your active filters. Try clearing or expanding your filter parameters to explore other segments.
          </p>
        </div>
      ) : (
        <>
          {/* Dashboard Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Sales Trend Line Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs md:col-span-2 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Monthly Sales & Transaction Trend</h3>
                <p className="text-slate-400 text-xs mt-0.5">Tracking revenue and order counts over the timeline</p>
              </div>
              <div className="h-72 w-full">
                {loading ? (
                  <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse"></div>
                ) : salesTrends.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No trend data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Methods Pie Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Payment Methods Distribution</h3>
                <p className="text-slate-400 text-xs mt-0.5">Share of purchase count by payment channel</p>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                {loading ? (
                  <div className="h-44 w-44 bg-slate-50 rounded-full animate-pulse"></div>
                ) : paymentStats.length === 0 ? (
                  <div className="text-slate-400 text-xs">No payment data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStats}
                        dataKey="count"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {paymentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Transactions"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', color: '#64748b' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Performance Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between md:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Category Performance</h3>
                <p className="text-slate-400 text-xs mt-0.5">Product categories ranked by sales contribution</p>
              </div>
              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse"></div>
                ) : categoryStats.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No category data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={18}>
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Gender Distribution Pie Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Gender Distribution</h3>
                <p className="text-slate-400 text-xs mt-0.5">Sales contribution split by gender profile</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {loading ? (
                  <div className="h-40 w-40 bg-slate-50 rounded-full animate-pulse"></div>
                ) : demographics.gender.length === 0 ? (
                  <div className="text-slate-400 text-xs">No demographic data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographics.gender}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {demographics.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Customers"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', color: '#64748b' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Cohorts Sizing Pie Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Customer Cohorts Split</h3>
                <p className="text-slate-400 text-xs mt-0.5">Percentage share of RFM customer segments</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {loading ? (
                  <div className="h-40 w-40 bg-slate-50 rounded-full animate-pulse"></div>
                ) : segmentStats.length === 0 ? (
                  <div className="text-slate-400 text-xs">No segment data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentStats}
                        dataKey="count"
                        nameKey="segment"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                      >
                        {segmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Customers"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '9px', color: '#64748b' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Age Groups Distribution Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Age Demographics Distribution</h3>
                <p className="text-slate-400 text-xs mt-0.5">Customer counts categorized into age groups</p>
              </div>
              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse"></div>
                ) : demographics.age_groups.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No age distribution data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographics.age_groups} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [value, "Customers"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Regional Sales Performance */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top US States by Revenue</h3>
                <p className="text-slate-400 text-xs mt-0.5">Top regional revenue contributions</p>
              </div>
              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full w-full bg-slate-50 rounded-lg animate-pulse"></div>
                ) : regionStats.length === 0 ? (
                  <div className="text-slate-400 text-xs">No regional data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="state" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
