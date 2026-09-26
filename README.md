# PolicyGuard — AML Intelligence Platform

PolicyGuard is a comprehensive, enterprise-grade Anti-Money Laundering (AML) and compliance intelligence platform. It provides financial analysts and compliance officers with real-time transaction monitoring, interactive network analysis, automated threat detection, and seamless Suspicious Activity Report (SAR) case management.

## 🚀 Key Features

- **Live Operational Monitoring (Sentinel):** Real-time Change Data Capture (CDC) integration for live transaction feeds, system health monitoring, and detection engine latency metrics.
- **Threat Intelligence Registry:** Advanced threat management with dynamic filtering, pagination, confidence scoring, and rule-based evaluation.
- **Network Graph Analysis:** Interactive visualization of transaction flows and high-risk entity connections to uncover sophisticated laundering rings.
- **Case Management Workflow:** End-to-end SAR workflow (New → Investigating → Escalated → Resolved) with integrated analyst notes and automated case summaries.
- **Enterprise Design System:** A highly polished, data-dense, dark-mode UI focused on clean data visualization, precise typography, and optimized performance for an exceptional developer and user experience.

## 🛠️ Technology Stack

**Frontend**
- React 19 + Vite for high-performance rendering and HMR.
- Custom Shadcn-inspired UI components (CSS variables, flex/grid layouts).
- Custom SVG and Canvas implementations for network graphing.

**Backend**
- Node.js & Express.js RESTful API.
- SQLite database for lightweight, local persistence (`better-sqlite3`).
- Zod for strict runtime schema validation and error boundary protection.

## 📁 Project Architecture

```text
policyguard-aml-dashboard/
├── backend/                   # Node.js + Express backend
│   ├── src/
│   │   ├── routes/            # API route handlers (threats, cases, network, etc.)
│   │   ├── middleware/        # Global error handlers and auth logic
│   │   ├── db/                # SQLite connection and schemas
│   │   └── index.js           # Express server entry point
│   └── data/                  # SQLite database file (.db)
├── src/                       # React Frontend
│   ├── components/            # Reusable UI primitives (Button, Card, Badge)
│   ├── views/                 # Top-level page components (Sentinel, Threats, Cases)
│   ├── services/              # API client integration (api.js)
│   ├── theme/                 # Design system tokens (colors.js)
│   └── index.css              # Global styles and theme variables
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mrvikas06/policyguard-aml-dashboard.git
   cd policyguard-aml-dashboard
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on http://localhost:3001
   ```

3. **Start the Frontend Application**
   Open a new terminal window:
   ```bash
   # From the project root
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

## 🔧 Development Notes

- **Data Simulation:** The backend currently seeds mock AML data on initialization to facilitate immediate UI testing.
- **Theming:** All colors, spacing, and typography are controlled via CSS variables in `src/index.css`. Modify this file to alter the global theme.
- **API Error Handling:** The backend uses strict `zod` validation. Ensure API payloads and query parameters strictly match the expected schemas to prevent 400 Validation Errors.

---

*Designed and engineered for modern compliance teams.*
