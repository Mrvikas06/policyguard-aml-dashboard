// ─────────────────────────────────────────────────────────────────────────────
// API Service — Centralized backend communication
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => request("/auth/me"),
    refresh: () => request("/auth/refresh", { method: "POST" }),
    changePassword: (data) => request("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
  },

  // Transactions
  transactions: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/transactions?${qs}`);
    },
    stats: () => request("/transactions/stats"),
    get: (txnId) => request(`/transactions/${txnId}`),
    create: (data) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  },

  // Threats
  threats: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/threats?${qs}`);
    },
    stats: () => request("/threats/stats"),
    get: (threatId) => request(`/threats/${threatId}`),
    update: (threatId, data) => request(`/threats/${threatId}`, { method: "PATCH", body: JSON.stringify(data) }),
    bulkAction: (data) => request("/threats/bulk-action", { method: "POST", body: JSON.stringify(data) }),
  },

  // Rules
  rules: {
    list: () => request("/rules"),
    flat: () => request("/rules/flat"),
    stats: () => request("/rules/stats"),
    get: (ruleId) => request(`/rules/${ruleId}`),
    create: (data) => request("/rules", { method: "POST", body: JSON.stringify(data) }),
    update: (ruleId, data) => request(`/rules/${ruleId}`, { method: "PATCH", body: JSON.stringify(data) }),
    test: (ruleId) => request(`/rules/${ruleId}/test`, { method: "POST" }),
  },

  // Cases
  cases: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/cases?${qs}`);
    },
    stats: () => request("/cases/stats"),
    get: (caseId) => request(`/cases/${caseId}`),
    create: (data) => request("/cases", { method: "POST", body: JSON.stringify(data) }),
    update: (caseId, data) => request(`/cases/${caseId}`, { method: "PATCH", body: JSON.stringify(data) }),
    addThreats: (caseId, threatIds) => request(`/cases/${caseId}/add-threats`, { method: "POST", body: JSON.stringify({ threat_ids: threatIds }) }),
  },

  // Reports
  reports: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/reports?${qs}`);
    },
    types: () => request("/reports/types"),
    get: (reportId) => request(`/reports/${reportId}`),
    create: (data) => request("/reports", { method: "POST", body: JSON.stringify(data) }),
    regenerate: (reportId) => request(`/reports/${reportId}/regenerate`, { method: "POST" }),
  },

  // Network
  network: {
    graph: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/network/graph?${qs}`);
    },
    highRiskPairs: () => request("/network/high-risk-pairs"),
    account: (accountId) => request(`/network/account/${accountId}`),
    path: (fromId, toId, depth) => request(`/network/path/${fromId}/${toId}?depth=${depth || 3}`),
  },

  // Stats
  stats: {
    overview: () => request("/stats/overview"),
    kpis: () => request("/stats/kpis"),
    complianceScore: () => request("/stats/compliance-score"),
  },

  // Scans
  scans: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/scans?${qs}`);
    },
    get: (jobId) => request(`/scans/${jobId}`),
    start: (data) => request("/scans", { method: "POST", body: JSON.stringify(data) }),
    cancel: (jobId) => request(`/scans/${jobId}/cancel`, { method: "POST" }),
  },

  // Audit
  audit: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/audit?${qs}`);
    },
    stats: () => request("/audit/stats"),
  },

  // Live
  live: {
    transactions: () => request("/live/transactions"),
    threats: () => request("/live/threats"),
  },
};