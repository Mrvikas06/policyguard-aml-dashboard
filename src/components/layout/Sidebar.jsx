// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Collapsible navigation with grouped items
// ─────────────────────────────────────────────────────────────────────────────

import { C, cn } from "../../theme/colors";
import { Badge } from "../ui/Badge";
import { Separator } from "../ui/Separator";
import { BrandMark } from "../ui/BrandMark";

const ICONS = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  "alert-triangle": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  "credit-card": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  "git-branch": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>,
  "file-text": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  briefcase: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect x="2" y="4" width="20" height="14" rx="2" ry="2"></rect></svg>,
  "bar-chart-2": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  brain: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.99.01 4 4 0 0 0-2.52 7.31 3 3 0 0 0 2.94 2.99c.56-2.5 2.94-5.41 4.59-5.9 3.22 1.3 4 2.9 5.66 3.6 1.77-.7 2.55-2.3 4.31-4 3.27 1.55 4.06 3.15 5.66 3.6 1.65.5 4.03 3.4 4.59 5.9a3 3 0 0 0 2.94-2.99 4 4 0 0 0-2.52-7.31 3 3 0 1 0-5.99-.01z"></path></svg>,
  "clipboard-list": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M16 4h-16"></path><path d="M8 10h10"></path><path d="M8 14h10"></path><path d="M8 18h5"></path></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
};

export function Sidebar({ page, setPage, collapsed = false, setCollapsed, navGroups }) {

  return (
    <aside
      className={cn("glass-panel", collapsed && "sidebar-collapsed")}
      style={{
        width: collapsed ? 80 : 280,
        height: "calc(100vh - 32px)",
        margin: "16px 0 16px 16px",
        position: "sticky",
        top: 16,
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        zIndex: C.zSticky,
      }}
    >
      <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <BrandMark size={36} />
        {!collapsed && (
          <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>POLICYGUARD AI</div>
            <div style={{ color: C.textDim, fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>AML Intelligence</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: collapsed ? 12 : 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: collapsed ? 12 : 20 }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 8px" }}>
                <div style={{ color: C.textMuted, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{group.label}</div>
              </div>
            )}
            <div style={{ display: "grid", gap: 6 }}>
              {group.items.map((item) => {
                const active = page === item.id;
                const Icon = ICONS[item.icon] || ICONS.home;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn("nav-item", active && "nav-item-active", collapsed && "nav-item-collapsed")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setPage(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: collapsed ? 0 : 12,
                      width: "100%",
                      padding: collapsed ? "12px" : "11px 16px",
                      borderRadius: "12px",
                      background: active ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      color: active ? "var(--color-brand-light)" : "var(--color-text-dim)",
                      border: "1px solid",
                      borderColor: active ? "rgba(59, 130, 246, 0.3)" : "transparent",
                      cursor: "pointer",
                      transition: "all 200ms ease",
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                      overflow: "hidden",
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      boxShadow: active ? "0 0 10px rgba(59, 130, 246, 0.1)" : "none",
                    }}
                    onMouseOver={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "var(--color-text)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--color-text-dim)";
                      }
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, color: active ? "var(--color-brand-light)" : "var(--color-text-dim)" }}>
                      {Icon}
                    </span>
                    {!collapsed && (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flex: 1, minWidth: 0 }}>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                      </span>
                    )}
                    {active && !collapsed && (
                      <span style={{ position: "absolute", left: -1, top: 8, bottom: 8, width: 4, background: "var(--color-brand-light)", borderRadius: "0 4px 4px 0", boxShadow: "0 0 8px var(--color-brand-light)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <button
            type="button"
            className="nav-item"
            onClick={() => setPage("settings")}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              width: "100%", 
              background: "transparent", 
              border: "none",
              color: "var(--color-text-dim)",
              padding: collapsed ? "12px" : "11px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 200ms ease",
              justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 12 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-text-dim)";
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0 }}>
              {ICONS.settings}
            </span>
            {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Settings</span>}
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          right: -14,
          top: 32,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--color-surface-alt)",
          border: `1px solid var(--color-border-light)`,
          color: "var(--color-text)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          transition: `all 200ms ease`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          zIndex: 10,
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "var(--color-brand)"; e.currentTarget.style.borderColor = "var(--color-brand-light)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "var(--color-surface-alt)"; e.currentTarget.style.borderColor = "var(--color-border-light)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? <polyline points="9 18 15 12 9 6"></polyline> : <polyline points="15 18 9 12 15 6"></polyline>}
        </svg>
      </button>
    </aside>
  );
}