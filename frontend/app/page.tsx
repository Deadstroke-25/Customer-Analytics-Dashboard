"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  TrendingUp, 
  ArrowRight, 
  Users, 
  Database, 
  LineChart,
  ShieldCheck,
  Brain,
  Award,
  ChevronRight,
  Maximize2,
  X,
  Monitor,
  GitPullRequest,
  ExternalLink
} from "lucide-react";

// Feature Card list definitions
const FEATURES = [
  { icon: Users, title: "Customer Cohort Segmentation", desc: "Segment clients into distinct cohorts (Champions, At Risk) using Recency, Frequency, and Monetary parameters." },
  { icon: Award, title: "RFM Metric Engine", desc: "Quantify customer lifecycle value by computing statistical Recency, Frequency, and Monetary scores." },
  { icon: LineChart, title: "Sales Forecasting", desc: "Project future monthly transaction sizes and revenue values using continuous linear regression models." },
  { icon: Monitor, title: "Interactive Dashboard", desc: "Clean filter panel for Gender, Category, Location, Payment Method, and Age groups." },
  { icon: Brain, title: "Advanced Analytics", desc: "Evaluates variables matrix correlations, and calculates transaction outlier boundaries using IQR." },
  { icon: ShieldCheck, title: "Database Integrity", desc: "Verify schema constraints, type bounds, and primary key indexes mapped via SQLAlchemy." },
  { icon: GitPullRequest, title: "Responsive Design", desc: "Fully responsive layouts optimized for desktops, tablets, and mobile layouts." }
];

const TECH_STACK = [
  { name: "Python", desc: "Pandas & Numpy pipelines, forecasting models" },
  { name: "FastAPI", desc: "High-performance asynchronous REST endpoints" },
  { name: "PostgreSQL", desc: "Neon Cloud Postgres relational database connection" },
  { name: "SQLAlchemy", desc: "Python Object Relational Mapper (ORM)" },
  { name: "Next.js", desc: "React Framework & App Router frontend" },
  { name: "TypeScript", desc: "Strict static typing across frontend components" },
  { name: "Tailwind CSS", desc: "Clean utilities styling layout system" },
  { name: "Scikit-Learn", desc: "Linear Regression forecasting models" },
  { name: "Pandas", desc: "DataFrames cleaning and processing libraries" },
  { name: "NumPy", desc: "Numeric vector calculations and operations" },
  { name: "Recharts", desc: "SVG-based interactive dashboard visual charts" },
  { name: "Docker", desc: "Containerized deployment configurations" }
];

const WORKFLOW = [
  { step: 1, title: "Customer Database", desc: "Access the preloaded relational SQL database containing raw shopping records." },
  { step: 2, title: "Data Processing", desc: "Clean transaction timelines and perform feature validation checks." },
  { step: 3, title: "RFM Analysis", desc: "Calculate statistical Recency, Frequency, and Monetary parameters for segment calculations." },
  { step: 4, title: "Sales Forecasting", desc: "Project sales trajectories using mathematical Linear Regression models." },
  { step: 5, title: "FastAPI REST APIs", desc: "Deliver JSON payloads via FastAPI endpoints to feed dashboard graphics." },
  { step: 6, title: "Interactive Dashboard", desc: "Visualize key indicators, category analysis, and cohort groups on a responsive UI." }
];

const WHY_US = [
  "Real-time KPI Dashboard",
  "Customer Lifetime Value",
  "RFM Segmentation",
  "Advanced Analytics",
  "Sales Forecasting",
  "CSV & Excel Export"
];



export default function LandingPage() {
  const [activeImg, setActiveImg] = useState<string | null>(null);

  const swaggerUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900 tracking-tight">CustomerPulse</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#tech" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Tech Stack</a>
            <a href="#workflow" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Workflow</a>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all gap-1.5"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col gap-6 text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Customer Analytics Dashboard
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              End-to-end analytics platform built using Python, SQL, FastAPI, PostgreSQL, and Next.js for customer segmentation, sales forecasting, and business intelligence.
            </p>
            
            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 mt-1">
              {["Python", "FastAPI", "PostgreSQL", "SQL", "Next.js", "Tailwind CSS", "Scikit-Learn", "Recharts"].map((badge) => (
                <span 
                  key={badge} 
                  className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all gap-1.5"
              >
                Explore Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/advanced-analytics"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                View Analytics
              </Link>
            </div>
          </div>
          
          {/* Actual Dashboard Preview Screenshot */}
          <div className="md:col-span-5 relative group cursor-pointer" onClick={() => setActiveImg("/dashboard_actual.png")}>
            <div className="bg-slate-100 border border-slate-200/85 rounded-xl p-2.5 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 border border-slate-200">
                <Image 
                  src="/dashboard_actual.png" 
                  alt="Dashboard Snapshot Preview" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                  className="object-cover object-top" 
                />
                <div className="absolute inset-0 bg-slate-900/10 hover:bg-slate-900/0 flex items-center justify-center transition-all">
                  <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-3.5 w-3.5" /> Zoom Screenshot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-12 bg-slate-100 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="block text-2xl md:text-3xl font-black text-slate-900 tracking-tight">3,900</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction logs</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="block text-2xl md:text-3xl font-black text-slate-900 tracking-tight">50</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">US States tracked</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="block text-2xl md:text-3xl font-black text-slate-900 tracking-tight">5+</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">RFM Cohorts mapped</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="block text-2xl md:text-3xl font-black text-slate-900 tracking-tight">&lt; 10ms</span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">REST API latency</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Platform Core Capabilities</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">Production-ready features engineered for transactional retail business intelligence analytics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-4 p-5 border border-slate-200 rounded-xl hover:border-slate-350 hover:bg-slate-50/50 hover:shadow-2xs transition-all text-left">
                  <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg h-fit shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{f.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section id="tech" className="py-16 md:py-24 border-b border-slate-200/60 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Full-Stack Data Engineering Stack</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">Lightweight, modern components containerized and built for standard high performance.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-12">
            {TECH_STACK.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between text-left hover:border-slate-300 transition-all">
                <span className="text-xs font-black text-slate-900 tracking-tight">{t.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-normal">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connection Node Workflow Chart */}
      <section id="workflow" className="py-16 md:py-24 border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Automated Processing Pipeline</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">The data pipeline connecting our database schema directly to interactive visual analytics dashboards.</p>
          </div>
          
          {/* Static Workflow chart nodes */}
          <div className="hidden lg:flex items-center justify-center gap-3 mt-12 bg-slate-50/50 border border-slate-200/70 p-6 rounded-2xl max-w-5xl mx-auto shadow-3xs">
            {["Customer Database", "Data Processing", "RFM Analysis", "Sales Forecasting", "FastAPI REST APIs", "Interactive Dashboard"].map((node, i, arr) => (
              <React.Fragment key={node}>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-2xs font-semibold text-xs text-slate-800 hover:border-blue-500 transition-colors">
                  {node}
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-slate-350 animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto text-left">
            {WORKFLOW.map((w) => (
              <div key={w.step} className="p-5 bg-slate-50/30 border border-slate-200 rounded-xl relative overflow-hidden flex gap-4">
                <span className="text-3xl font-black text-slate-150 absolute right-3 -bottom-1">
                  0{w.step}
                </span>
                <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                  {w.step}
                </div>
                <div className="space-y-1 z-10">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{w.title}</h5>
                  <p className="text-slate-500 text-xs leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Floating Screenshot Lightbox Modal Overlay */}
      {activeImg && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setActiveImg(null)}
        >
          <div className="relative max-w-5xl w-full bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xl animate-in zoom-in-95 duration-150">
            <button 
              className="absolute right-4 top-4 p-1.5 rounded-full bg-white/90 border border-slate-200 hover:bg-slate-100 shadow-md text-slate-700 z-10 cursor-pointer"
              onClick={() => setActiveImg(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100">
              <Image 
                src={activeImg} 
                alt="Enlarged Preview" 
                fill 
                className="object-contain" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg text-slate-900 tracking-tight">CustomerPulse</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Customer Analytics Platform for customer segmentation, sales analysis, forecasting, and business intelligence.
            </p>
            <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
              Built with Next.js, FastAPI, PostgreSQL, SQL, Python, and Tailwind CSS.
            </p>
          </div>
          <div>
            <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</h6>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 transition-colors">• Overview Dashboard</Link>
              <Link href="/customers" className="text-slate-500 hover:text-blue-600 transition-colors">• Customer Segments</Link>
              <Link href="/advanced-analytics" className="text-slate-500 hover:text-blue-600 transition-colors">• Advanced Analytics</Link>
            </div>
          </div>
          <div>
            <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core Technology Stack</h6>
            <div className="flex flex-col gap-1.5 text-xs text-slate-500">
              <span>• Next.js 15</span>
              <span>• FastAPI</span>
              <span>• PostgreSQL</span>
              <span>• SQLAlchemy</span>
              <span>• Tailwind CSS</span>
            </div>
          </div>
          <div>
            <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Platform Status</h6>
            <div className="flex flex-col gap-2 text-xs">
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                Backend Online
              </span>
              <a href={swaggerUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                API Documentation
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>&copy; 2026 CustomerPulse &bull; Made by Suprojeet Sonar</span>
        </div>
      </footer>
    </div>
  );
}
