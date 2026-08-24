// ─────────────────────────────────────────────────────────────────────────────
// Settings View — User and system preferences
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { C, cn } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Separator } from "../components/ui/Separator";
import { SectionHeading } from "../components/shared";
import { useAuth } from "../contexts/AuthContext";

export function SettingsView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [notifications] = useState({
    criticalThreats: true,
    highSeverity: true,
    dailySummary: false,
    weeklyReport: true,
    scanComplete: true,
    maintenance: true,
    email: true,
    push: true,
  });
  const [preferences, setPreferences] = useState({
    theme: "system",
    density: "comfortable",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
  });
  const [security, setSecurity] = useState({
    twoFA: false,
    sessionTimeout: 30,
    apiAccess: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionHeading eyebrow="System" title="Settings" description="Manage your profile, notifications, preferences and security settings." />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Sidebar tabs */}
        <Card style={{ height: "fit-content", position: "sticky", top: 100 }}>
          <CardContent style={{ padding: 8, display: "grid", gap: 4 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: C.radius,
                  border: "none",
                  background: activeTab === tab.id ? C.brandSoft : "transparent",
                  color: activeTab === tab.id ? C.brand : C.textDim,
                  fontSize: 13.5,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: `all ${C.fast}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Content panels */}
        <div style={{ minWidth: 0 }}>
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information and display settings</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 20, maxWidth: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Avatar name={user?.name || "User"} size="xl" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{user?.name || "User"}</div>
                    <div style={{ color: C.textDim, marginTop: 2 }}>{user?.email}</div>
                    <Badge variant="soft" color={C.brand} size="sm" style={{ marginTop: 8 }}>{user?.role?.replace("_", " ") || "Analyst"}</Badge>
                  </div>
                </div>
                <Separator />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Full Name</label>
                    <Input defaultValue={user?.name || ""} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Email</label>
                    <Input type="email" defaultValue={user?.email || ""} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Phone</label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Department</label>
                    <Select defaultValue="Compliance" style={{ width: "100%" }}>
                      <option>Compliance</option>
                      <option>Risk Management</option>
                      <option>Investigations</option>
                      <option>IT Security</option>
                      <option>Executive</option>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Button variant="outline" tone="slate" onClick={() => handleSave("profile")} loading={saving}>Cancel</Button>
                  <Button tone="accent" onClick={() => handleSave("profile")} loading={saving}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how and when you receive alerts</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Delivery Channels</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { label: "Email notifications", key: "email", desc: "Receive alerts via email" },
                      { label: "Push notifications", key: "push", desc: "Browser push notifications" },
                      { label: "In-app notifications", key: "inapp", desc: "Show in notification center" },
                    ].map((item) => (
                      <label key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius, cursor: "pointer" }}>
                        <div>
                          <div style={{ fontWeight: 500, color: C.text }}>{item.label}</div>
                          <div style={{ fontSize: 12, color: C.textDim }}>{item.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked={notifications[item.key] || true} style={{ width: 20, height: 20, accentColor: C.brand }} />
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Alert Types</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { label: "Critical threat alerts", key: "criticalThreats", desc: "Immediate notification for critical severity threats" },
                      { label: "High severity alerts", key: "highSeverity", desc: "Notification for high severity threats" },
                      { label: "Daily compliance summary", key: "dailySummary", desc: "End-of-day summary email" },
                      { label: "Weekly model performance report", key: "weeklyReport", desc: "Weekly AI model metrics" },
                      { label: "Scan completion notifications", key: "scanComplete", desc: "When AML scans finish" },
                      { label: "System maintenance windows", key: "maintenance", desc: "Scheduled downtime alerts" },
                    ].map((item) => (
                      <label key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius, cursor: "pointer" }}>
                        <div>
                          <div style={{ fontWeight: 500, color: C.text }}>{item.label}</div>
                          <div style={{ fontSize: 12, color: C.textDim }}>{item.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked={notifications[item.key]} style={{ width: 20, height: 20, accentColor: C.brand }} />
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Button variant="outline" tone="slate" onClick={() => handleSave("notifications")} loading={saving}>Cancel</Button>
                  <Button tone="accent" onClick={() => handleSave("notifications")} loading={saving}>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your dashboard experience</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 20, maxWidth: 600 }}>
                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 16 }}>Appearance</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Theme</label>
                      <Select defaultValue={preferences.theme} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, theme: e.target.value }))}>
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Density</label>
                      <Select defaultValue={preferences.density} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, density: e.target.value }))}>
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="spacious">Spacious</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 16 }}>Localization</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Language</label>
                      <Select defaultValue={preferences.language} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))}>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Timezone</label>
                      <Select defaultValue={preferences.timezone} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, timezone: e.target.value }))}>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern (ET)</option>
                        <option value="America/Chicago">Central (CT)</option>
                        <option value="America/Denver">Mountain (MT)</option>
                        <option value="America/Los_Angeles">Pacific (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Date Format</label>
                      <Select defaultValue={preferences.dateFormat} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, dateFormat: e.target.value }))}>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Currency</label>
                      <Select defaultValue={preferences.currency} style={{ width: "100%" }} onChange={(e) => setPreferences(p => ({ ...p, currency: e.target.value }))}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Button variant="outline" tone="slate" onClick={() => handleSave("preferences")} loading={saving}>Cancel</Button>
                  <Button tone="accent" onClick={() => handleSave("preferences")} loading={saving}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage authentication and access controls</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 20, maxWidth: 600 }}>
                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Two-Factor Authentication</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: C.text }}>Authenticator App</div>
                      <div style={{ fontSize: 12, color: C.textDim }}>Use Google Authenticator, Authy, or similar</div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked={security.twoFA} style={{ width: 24, height: 24, accentColor: C.brand }} />
                      <span style={{ fontSize: 13, color: C.text }}>{security.twoFA ? "Enabled" : "Disabled"}</span>
                    </label>
                  </div>
                  {!security.twoFA && (
                    <Button variant="outline" tone="slate" size="sm" style={{ marginTop: 12 }}>Set up 2FA</Button>
                  )}
                </div>

                <Separator />

                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Change Password</div>
                  <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button variant="outline" tone="slate" style={{ marginTop: 8 }}>Update Password</Button>
                </div>

                <Separator />

                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Session Management</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Session Timeout (minutes)</label>
                      <Select defaultValue={String(security.sessionTimeout)} style={{ width: "100%" }} onChange={(e) => setSecurity(s => ({ ...s, sessionTimeout: parseInt(e.target.value) }))}>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="60">60</option>
                        <option value="120">120</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 4 }}>Concurrent Sessions</label>
                      <Select defaultValue="3" style={{ width: "100%" }}>
                        <option>1</option>
                        <option>3</option>
                        <option>5</option>
                        <option>10</option>
                      </Select>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Button variant="outline" tone="slate" size="sm">Revoke All Other Sessions</Button>
                  </div>
                </div>

                <Separator />

                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>API Access</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: C.text }}>API Key Access</div>
                      <div style={{ fontSize: 12, color: C.textDim }}>Allow programmatic access via API keys</div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked={security.apiAccess} style={{ width: 24, height: 24, accentColor: C.brand }} />
                      <span style={{ fontSize: 13, color: C.text }}>{security.apiAccess ? "Enabled" : "Disabled"}</span>
                    </label>
                  </div>
                  {security.apiAccess && (
                    <Button variant="outline" tone="slate" size="sm" style={{ marginTop: 12 }}>Manage API Keys</Button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Button variant="outline" tone="slate" onClick={() => handleSave("security")} loading={saving}>Cancel</Button>
                  <Button tone="accent" onClick={() => handleSave("security")} loading={saving}>Save Security Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Manage external system connections and API keys</CardDescription>
              </CardHeader>
              <CardContent style={{ display: "grid", gap: 16 }}>
                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>Connected Systems</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      { name: "Core Banking API", status: "connected", lastSync: "2 min ago", endpoint: "https://api.bank.internal/v1" },
                      { name: "SWIFT Network", status: "connected", lastSync: "5 min ago", endpoint: "swift.alliance.com" },
                      { name: "FinCEN BSA E-Filing", status: "connected", lastSync: "1 hour ago", endpoint: "bsaefiling.fincen.gov" },
                      { name: "World-Check Screening", status: "warning", lastSync: "30 min ago", endpoint: "api.refinitiv.com" },
                      { name: "Internal Case Management", status: "disconnected", lastSync: "Never", endpoint: "jira.internal.company.com" },
                    ].map((sys, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: sys.status === "connected" ? C.resolved : sys.status === "warning" ? C.high : C.textMuted }} />
                          <div>
                            <div style={{ fontWeight: 600, color: C.text }}>{sys.name}</div>
                            <div style={{ fontSize: 12, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{sys.endpoint}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Badge variant="soft" color={sys.status === "connected" ? C.resolved : sys.status === "warning" ? C.high : C.textMuted} size="xs">{sys.status}</Badge>
                          <span style={{ fontSize: 12, color: C.textDim }}>{sys.lastSync}</span>
                          <Button variant="ghost" size="xs" tone="slate">Configure</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 12 }}>API Keys</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.text }}>Production API Key</div>
                        <div style={{ fontSize: 12, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>pk_live_••••••••••••••••abcd</div>
                      </div>
                      <Button variant="ghost" size="sm" tone="slate">Regenerate</Button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.text }}>Development API Key</div>
                        <div style={{ fontSize: 12, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>pk_test_••••••••••••••••efgh</div>
                      </div>
                      <Button variant="ghost" size="sm" tone="slate">Regenerate</Button>
                    </div>
                    <Button variant="outline" tone="slate" size="sm">Create New Key</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}