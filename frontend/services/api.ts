const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FilterParams {
  gender?: string;
  category?: string;
  location?: string;
  payment_method?: string;
  min_age?: number;
  max_age?: number;
  start_date?: string;
  end_date?: string;
}

function buildQueryString(filters: FilterParams & { format?: string } = {}): string {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, String(val));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

export const apiService = {
  // KPI Dashboard data
  async getKpis(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/kpis${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch KPIs");
    return res.json();
  },

  // Chart data endpoints
  async getSalesTrends(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/charts/sales-trends${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch sales trends");
    return res.json();
  },

  async getCategoryPerformance(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/charts/category-performance${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch category performance");
    return res.json();
  },

  async getDemographics(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/charts/demographics${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch demographics");
    return res.json();
  },

  async getPaymentMethods(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/charts/payment-methods${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch payment methods");
    return res.json();
  },

  async getRegions(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/charts/regions${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch regions");
    return res.json();
  },

  // Customer Segmentation and Churn
  async getSegmentSummary(filters: FilterParams = {}) {
    const res = await fetch(`${API_BASE_URL}/api/segments/summary${buildQueryString(filters)}`);
    if (!res.ok) throw new Error("Failed to fetch segment summary");
    return res.json();
  },

  async getTopCustomers(limit?: number) {
    const query = limit ? `?limit=${limit}` : "";
    const res = await fetch(`${API_BASE_URL}/api/segments/top-customers${query}`);
    if (!res.ok) throw new Error("Failed to fetch top customers");
    return res.json();
  },

  async getChurnRisk() {
    const res = await fetch(`${API_BASE_URL}/api/segments/churn-risk`);
    if (!res.ok) throw new Error("Failed to fetch churn risk");
    return res.json();
  },

  // Advanced Analytics endpoints
  async getSalesForecast() {
    const res = await fetch(`${API_BASE_URL}/api/ml/forecast`);
    if (!res.ok) throw new Error("Failed to fetch sales forecast");
    return res.json();
  },

  async getCorrelation() {
    const res = await fetch(`${API_BASE_URL}/api/ml/correlation`);
    if (!res.ok) throw new Error("Failed to fetch correlation matrix");
    return res.json();
  },

  async getOutliers(column: string = "purchase_amount") {
    const res = await fetch(`${API_BASE_URL}/api/ml/outliers?column=${column}`);
    if (!res.ok) throw new Error("Failed to fetch outliers");
    return res.json();
  }
};
