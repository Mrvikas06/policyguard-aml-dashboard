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
    <header className="topbar-shell" style={{ position: "sticky", top: 0, zIndex: C.zSticky }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        maxWidth: "100%",
        margin: "0 auto",
        background: "rgba(17,26,46,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Button variant="ghost" size="sm" onClick={onMenuClick} aria-label="Open navigation" className="mobile-only">
          {ICONS.menu}
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, flexShrink: 1 }}>
          <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 0, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ color: C.textDim, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Production Workspace</div>
              <Badge variant="soft" color={C.brand} size="xs">Live</Badge>
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

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
          <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: 156 }} aria-label="Date filter">
            <option>Last 24 hours</option>
            <option>Today</option>
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
            <option>Custom</option>
          </Select>

          <Badge variant="soft" color={C.ai} style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px" }}>
            {ICONS.clock} {timeLabel}
          </Badge>

          <div style={{ position: "relative" }}>
            <Button
              ref={notifRef}
              variant="ghost"
              size="sm"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label={notifications ? `${notifications} notifications` : "Notifications"}
              aria-expanded={notifOpen}
            >
              {ICONS.bell}
              {notifications > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, borderRadius: C.radiusFull, background: C.critical, color: "#fff", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px", border: `2px solid ${C.bg}` }}>
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 360,
                maxHeight: 400,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: C.radiusLg,
                boxShadow: C.shadowLg,
                overflow: "hidden",
                zIndex: C.zPopover,
                animation: "slideDown 0.2s ease",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, color: C.text }}>Notifications</div>
                  <Button variant="ghost" size="xs" onClick={() => {}}>Mark all read</Button>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {mockNotifications.map((n) => (
                    <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: n.unread ? C.brandSoft : "transparent", transition: `background ${C.fast}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: n.unread ? 600 : 500 }}>{n.message}</div>
                        <div style={{ color: C.textDim, fontSize: 11.5, whiteSpace: "nowrap" }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                  <Button variant="ghost" size="sm" block onClick={() => {}}>View all notifications</Button>
                </div>
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" aria-label="Help">
            {ICONS.help}
          </Button>

          <div style={{ position: "relative" }}>
            <button
              ref={userMenuRef}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px 6px 6px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: C.radiusFull,
                cursor: "pointer",
                transition: `all ${C.fast}`,
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.borderColor = C.borderLight; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.border; }}
            >
              <Avatar name={user?.name || "User"} size="sm" status="online" />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{user?.name || "User"}</span>
              {ICONS.chevron}
            </button>

            {userMenuOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 240,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: C.radiusLg,
                boxShadow: C.shadowLg,
                overflow: "hidden",
                zIndex: C.zPopover,
                animation: "slideDown 0.2s ease",
              }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 700, color: C.text }}>{user?.name || "User"}</div>
                  <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                  <div style={{ color: C.brand, fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>{user?.role?.replace("_", " ") || "Analyst"}</div>
                </div>
                <div style={{ padding: 4 }}>
                  {[
                    { label: "Profile", icon: ICONS.user, action: () => {} },
                    { label: "Settings", icon: ICONS.settings, action: () => {} },
                    { label: "Sign out", icon: ICONS.logout, action: onLogout, danger: true },
                  ].map((item, i) => (
                    <button key={i} onClick={() => { item.action(); setUserMenuOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "10px 12px", background: "transparent", border: "none",
                      borderRadius: C.radius, color: item.danger ? C.critical : C.text,
                      fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
                      transition: `background ${C.fast}`,
                    }} onMouseOver={(e) => e.currentTarget.style.background = item.danger ? C.criticalSoft : C.surfaceAlt}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}