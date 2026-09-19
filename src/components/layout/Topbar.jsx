// ─────────────────────────────────────────────────────────────────────────────
// Topbar — Premium header with search, notifications, user menu
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { C } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarGroup } from "../ui/Avatar";

const ICONS = {
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  help: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
};

export function Topbar({
  search,
  setSearch,
  dateFilter,
  setDateFilter,
  timeLabel,
  onMenuClick,
  user,
  onLogout,
  notifications = 0,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, type: "threat", message: "Critical threat V-0042 detected", time: "2m ago", unread: true },
    { id: 2, type: "case", message: "Case CASE-1047 assigned to you", time: "15m ago", unread: true },
    { id: 3, type: "scan", message: "AML scan completed: 12 violations found", time: "1h ago", unread: false },
    { id: 4, type: "system", message: "Model retrained with 99.2% precision", time: "3h ago", unread: false },
  ];

  return (
    <header className="glass-panel" style={{ 
      position: "sticky", 
      top: 16, 
      zIndex: C.zSticky,
      margin: "16px 16px 0 16px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "12px 24px",
    }}>
      <Button variant="ghost" onClick={onMenuClick} aria-label="Open navigation" style={{ display: "none" }} className="mobile-only">
        {ICONS.menu}
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, flexShrink: 1 }}>
        <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 0, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ color: "var(--color-text-dim)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Production Workspace</div>
            <Badge color={C.brand} size="xs">Live</Badge>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions, accounts, threats..."
            leftIcon={ICONS.search}
            style={{ width: "100%", maxWidth: 620 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginLeft: "auto" }}>
        <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: 156 }} aria-label="Date filter">
          <option>Last 24 hours</option>
          <option>Today</option>
          <option>7 days</option>
          <option>30 days</option>
          <option>90 days</option>
          <option>Custom</option>
        </Select>

        <Badge color={C.ai} style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px" }}>
          {ICONS.clock} {timeLabel}
        </Badge>

        <div style={{ position: "relative" }} ref={notifRef}>
          <Button
            variant="ghost"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={notifications ? `${notifications} notifications` : "Notifications"}
            aria-expanded={notifOpen}
            style={{ width: 40, height: 40, padding: 0, borderRadius: "50%" }}
          >
            {ICONS.bell}
            {notifications > 0 && (
              <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: "50%", background: "var(--color-critical)", color: "#fff", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px", border: `2px solid var(--color-bg-elevated)` }}>
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="glass-panel animate-fade-in" style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              width: 360,
              maxHeight: 400,
              overflow: "hidden",
              zIndex: C.zPopover,
              background: "var(--color-bg-elevated)",
              backdropFilter: "none",
            }}>
              <div style={{ padding: "16px", borderBottom: `1px solid var(--color-border)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--color-text)" }}>Notifications</div>
                <Button variant="ghost" size="xs" onClick={() => {}}>Mark all read</Button>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {mockNotifications.map((n) => (
                  <div key={n.id} style={{ padding: "14px 16px", borderBottom: `1px solid var(--color-border)`, background: n.unread ? "var(--color-brand-soft)" : "transparent", transition: "background 150ms" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ color: "var(--color-text)", fontSize: 13, fontWeight: n.unread ? 600 : 500 }}>{n.message}</div>
                      <div style={{ color: "var(--color-text-dim)", fontSize: 11.5, whiteSpace: "nowrap" }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid var(--color-border)`, textAlign: "center" }}>
                <Button variant="ghost" style={{ width: "100%" }} onClick={() => {}}>View all notifications</Button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 32, background: "var(--color-border)" }} />

        <div style={{ position: "relative" }} ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "24px",
              transition: "background 150ms",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-alt)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Avatar user={user} size="sm" status="online" />
            <div style={{ display: "grid", textAlign: "left", flex: 1, minWidth: 0 }}>
              <span style={{ color: "var(--color-text)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Vikas Kumar Singh"}</span>
              <span style={{ color: "var(--color-text-dim)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Compliance Lead</span>
            </div>
            <span style={{ color: "var(--color-text-dim)" }}>{ICONS.chevron}</span>
          </button>

          {userMenuOpen && (
            <div className="glass-panel animate-fade-in" style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              width: 240,
              zIndex: C.zPopover,
              background: "var(--color-bg-elevated)",
              backdropFilter: "none",
            }}>
              <div style={{ padding: 16, borderBottom: `1px solid var(--color-border)` }}>
                <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{user?.name || "Vikas Kumar Singh"}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-dim)" }}>{user?.email || "vikas@policyguard.ai"}</div>
              </div>
              <div style={{ padding: 8, display: "grid", gap: 2 }}>
                <Button variant="ghost" style={{ justifyContent: "flex-start", width: "100%" }}>{ICONS.user} Profile</Button>
                <Button variant="ghost" style={{ justifyContent: "flex-start", width: "100%" }}>{ICONS.settings} Preferences</Button>
                <Button variant="ghost" style={{ justifyContent: "flex-start", width: "100%" }}>{ICONS.help} Help & Support</Button>
              </div>
              <div style={{ padding: 8, borderTop: `1px solid var(--color-border)` }}>
                <Button variant="ghost" style={{ justifyContent: "flex-start", width: "100%", color: "var(--color-critical)" }} onClick={onLogout}>
                  {ICONS.logout} Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}