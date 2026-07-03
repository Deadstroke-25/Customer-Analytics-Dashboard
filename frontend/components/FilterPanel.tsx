import React, { useState } from "react";
import { FilterParams } from "../services/api";
import { Filter, RotateCcw } from "lucide-react";

interface FilterPanelProps {
  onFilterChange: (filters: FilterParams) => void;
}

const CATEGORIES = ["Clothing", "Footwear", "Outerwear", "Accessories"];
const GENDERS = ["Male", "Female"];
const PAYMENTS = ["Venmo", "Cash", "Credit Card", "PayPal", "Debit Card", "Bank Transfer"];
const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", 
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", 
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", 
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", 
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", 
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", 
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", 
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterParams>({
    gender: "",
    category: "",
    location: "",
    payment_method: "",
    min_age: undefined,
    max_age: undefined,
    start_date: "",
    end_date: "",
  });

  const handleChange = (key: keyof FilterParams, value: any) => {
    const updated = { ...filters, [key]: value === "All" || value === "" ? "" : value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const cleared: FilterParams = {
      gender: "",
      category: "",
      location: "",
      payment_method: "",
      min_age: undefined,
      max_age: undefined,
      start_date: "",
      end_date: "",
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold tracking-tight">Active Filters</span>
        </div>
        <button 
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Category</label>
          <select 
            value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
          <select 
            value={filters.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Genders</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Location (State) Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">US State</label>
          <select 
            value={filters.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white scrollbar-thin transition-all cursor-pointer"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Channel</label>
          <select 
            value={filters.payment_method || ""}
            onChange={(e) => handleChange("payment_method", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Channels</option>
            {PAYMENTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Age Bounds Filter */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age Range</label>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              min="18"
              max="100"
              placeholder="Min Age"
              value={filters.min_age === undefined ? "" : filters.min_age}
              onChange={(e) => handleChange("min_age", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input 
              type="number"
              min="18"
              max="100"
              placeholder="Max Age"
              value={filters.max_age === undefined ? "" : filters.max_age}
              onChange={(e) => handleChange("max_age", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purchase Timeline</label>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input 
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
