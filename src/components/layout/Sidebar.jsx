// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Collapsible navigation with grouped items
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { C, cn } from "../../theme/colors";

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
      className={cn("sidebar-shell", collapsed && "sidebar-collapsed")}
      style={{
        width: collapsed ? 72 : 272,
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        background: C.bgElevated,
        borderRight: `1px solid ${C.border}`,
        transition: `width ${C.normal}, background ${C.normal}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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

      {!collapsed && (
        <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div className="card" style={{ padding: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Workspace</div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginTop: 2 }}>Compliance Command Center</div>
              </div>
              <Badge variant="soft" color={C.brand} size="sm">Live</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              <div className="card" style={{ padding: 10 }}>
                <div style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Active Page</div>
                <div style={{ color: C.text, fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>
                  {navGroups.flatMap(g => g.items).find(i => i.id === page)?.label || "Dashboard"}
                </div>
              </div>
              <div className="card" style={{ padding: 10 }}>
                <div style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Section</div>
                <div style={{ color: C.text, fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>
                  {navGroups.find(g => g.items.some(i => i.id === page))?.label || "Platform"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge variant="soft" color={C.ai} size="sm">Realtime</Badge>
              <Badge variant="soft" color={C.high} size="sm">AML Ops</Badge>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: collapsed ? 12 : 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: collapsed ? 8 : 16 }}>
        {!collapsed && <Separator variant="gradient" />}

        {navGroups.map((group, gIdx) => (
          <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 8px" }}>
                <div style={{ color: C.textMuted, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{group.label}</div>
                <Badge variant="outline" size="xs" style={{ fontSize: 10 }}>{group.items.length}</Badge>
              </div>
            )}
            <div style={{ display: "grid", gap: 4 }}>
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
                      padding: collapsed ? "12px" : "11px 12px",
                      borderRadius: C.radius,
                      background: active ? C.brandSoft : "transparent",
                      color: active ? C.brand : C.textDim,
                      border: "none",
                      cursor: "pointer",
                      transition: `all ${C.fast}`,
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                      overflow: "hidden",
                      fontSize: 13.5,
                      fontWeight: active ? 700 : 500,
                    }}
                    onMouseEnter={() => !collapsed && setHoveredGroup(gIdx)}
                    onMouseLeave={() => setHoveredGroup(null)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, flexShrink: 0, color: active ? C.brand : C.textDim }}>
                      {Icon}
                    </span>
                    {!collapsed && (
                      <span style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: active ? C.text : C.textDim }}>{item.label}</span>
                          {active && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.brand, whiteSpace: "nowrap" }}>Current</span>}
                        </span>
                      </span>
                    )}
                    {active && !collapsed && (
                      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: C.brand, borderRadius: `${C.radiusFull} 0 0 ${C.radiusFull}` }} />
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
            style={{ justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 12 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, flexShrink: 0, color: C.textDim }}>
              {ICONS.settings}
            </span>
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </nav>

      {!collapsed && (
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: C.surfaceAlt, borderRadius: C.radius, border: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.brand}, ${C.accent})`, color: "#fff", fontWeight: 700, fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.text, fontSize: 12.5, fontWeight: 600 }}>Last sync: 2 min ago</div>
              <div style={{ color: C.textDim, fontSize: 11 }}>All systems operational</div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="collapse-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          right: -12,
          top: 120,
          width: 24,
          height: 24,
          borderRadius: C.radiusFull,
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          color: C.textDim,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          transition: `all ${C.fast}`,
          boxShadow: C.shadowSm,
          zIndex: 10,
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = C.brandSoft; e.currentTarget.style.color = C.brand; }}
        onMouseOut={(e) => { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.color = C.textDim; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? <polyline points="9 18 15 12 9 6"></polyline> : <polyline points="15 18 9 12 15 6"></polyline>}
        </svg>
      </button>
    </aside>
  );
}