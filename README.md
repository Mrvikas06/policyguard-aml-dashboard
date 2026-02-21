<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# PolicyGuard.AI — AML Threat Intelligence Dashboard
### Team Intellium · HackFest 2.0 · IBM AML Dataset

---

## 📁 Project Structure

```
src/
│
├── App.jsx                         # Root component — wires all views & state
│
├── data/
│   └── violations.js               # IBM AML dataset: violations, rules, monthly trend,
│                                   # live txns, high-risk pairs, DB table metadata
│
├── theme/
│   └── colors.js                   # Design tokens (C), SEVER/STATUS maps,
│                                   # shared style factories (btn, inp, btnOutline),
│                                   # GLOBAL_CSS string (keyframes, scrollbar, hover)
│
├── components/
│   ├── canvas/
│   │   ├── HexGrid.jsx             # Animated hex grid background (hero section)
│   │   ├── ParticleNet.jsx         # Floating particle network canvas (Sentinel tab)
│   │   └── LayerGraph.jsx          # SVG transaction layering network graph
│   │
│   ├── ui/
│   │   ├── Badge.jsx               # Glowing pill badge (severity, status, category)
│   │   ├── CountUp.jsx             # Animated number counter
│   │   ├── SparkBar.jsx            # Mini bar sparkline (KPI cards)
│   │   ├── Donut.jsx               # Animated SVG compliance score donut
│   │   └── Toast.jsx               # Slide-in action notification
│   │
│   └── layout/
│       └── Topbar.jsx              # Logo + nav tabs + live CDC chip + live txn ticker
│
└── views/
    ├── OverviewView.jsx            # Hero + 6 KPI cards + donut/bar/graph + active threats
    ├── ThreatsView.jsx             # Full violation registry with expandable detail cards
    ├── PoliciesView.jsx            # PDF ingestion pipeline + 25 AML rule groups
    ├── ScannerView.jsx             # MySQL scan terminal with progress + DB table cards
    ├── NetworkView.jsx             # Layering SVG graphs + high-risk account pairs table
    ├── SentinelView.jsx            # Debezium CDC toggle + particle network + Kafka feed
    └── ReportsView.jsx             # SAR/CTR filing tracker + KPI summary + export buttons
```

---

## 🚀 Quick Start

```bash
# 1. Create a React project (Vite recommended)
npm create vite@latest aml-dashboard -- --template react
cd aml-dashboard

# 2. Replace src/ with the provided src/ folder

# 3. Install & run
npm install
npm run dev
```

No extra dependencies needed — uses only React hooks and canvas APIs.

---

## 🎨 Design System

| Token | Value | Purpose |
|-------|-------|---------|
| `C.void` | `#01040a` | Page background |
| `C.card` | `#070d1c` | Card surface |
| `C.teal` | `#00d4c8` | Primary accent, links |
| `C.amber`| `#f59e0b` | Warning, amounts |
| `C.red`  | `#ff3333` | Critical severity |
| `C.orange`| `#ff6b00`| High severity |

**Fonts:** `Bebas Neue` (headers) · `JetBrains Mono` (all data/body text)

---

## 📊 IBM AML Dataset

- **Source:** IBM Transactions for Anti-Money Laundering (Kaggle)
- **License:** CDLA-Sharing-1.0
- **Records:** 487,312 synthetic transactions
- **Key field:** `is_laundering` (ground truth: 1 = violation)
- **Simulated recall:** 80% · Precision: 80%

---

## 🔒 25 AML Rules Enforced

| Category | Rules | Regulatory Basis |
|----------|-------|-----------------|
| CTR Threshold | R-001, R-002, R-003 | BSA §5313 |
| Velocity | R-008, R-009, R-010 | FATF R.20 |
| Network/Layering | R-013, R-014, R-015 | FATF R.16 |
| Payment Type | R-016, R-018, R-019 | FinCEN SAR |

---

*Intellium · PolicyGuard.AI · HackFest 2.0 — GDG Cloud New Delhi × Turgon*
>>>>>>> 6d3f2f02ff7283d353a13a4948855b98116ecc50
