"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Module-level cookie reader — accessible from all functions in this component
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export function PocController() {
  const router = useRouter();
  
  const [role, setRole] = useState("guest");
  const [plan, setPlan] = useState("free");
  const [country, setCountry] = useState("US");
  const [loggedIn, setLoggedIn] = useState(false);
  const [anonId, setAnonId] = useState("");

  useEffect(() => {
    setRole(getCookie("gb_role") || "guest");
    setPlan(getCookie("gb_plan") || "free");
    setCountry(getCookie("gb_country") || "US");
    setLoggedIn(getCookie("gb_logged_in") === "true");
    setAnonId(getCookie("gb_anon_id") || "(will be set on first load)");
  }, []);

  const setCookie = (name: string, val: string) => {
    document.cookie = `${name}=${val}; path=/; max-age=31536000`;
  };

  const handleUpdate = (name: string, val: string, setter: (v: any) => void) => {
    setCookie(name, val);
    setter(val);
    // Refresh Next.js page state (RSC re-evaluation)
    router.refresh();
  };

  const resetUserSession = () => {
    // Delete the cookie — the Edge Middleware will generate a fresh gb_anon_id
    // on the very next request (triggered by router.refresh() below).
    document.cookie = "gb_anon_id=; path=/; max-age=0";
    setAnonId("(regenerating...)");
    router.refresh();

    // Poll every 150ms until the middleware has set the new cookie (usually 1–2 polls).
    // Stop after 3 seconds to avoid infinite loops.
    let elapsed = 0;
    const interval = setInterval(() => {
      const newId = getCookie("gb_anon_id");
      if (newId) {
        setAnonId(newId);
        clearInterval(interval);
      }
      elapsed += 150;
      if (elapsed >= 3000) clearInterval(interval);
    }, 150);
  };

  return (
    <div className="glass-card" style={{ border: "1px dashed var(--accent)" }}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        ⚙️ POC Targeting & Experiment Console
      </h3>
      <p style={{ fontSize: "12px", color: "var(--badge-text)", margin: "0 0 16px 0" }}>
        Simulate user properties to test GrowthBook targeting rules and sticky A/B variant assignments.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {/* Country Selector */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>Country (Geo)</label>
          <select 
            value={country} 
            onChange={(e) => handleUpdate("gb_country", e.target.value, setCountry)}
            style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "var(--badge-bg)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
          >
            <option value="US">United States (US)</option>
            <option value="IN">India (IN)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="CA">Canada (CA)</option>
          </select>
        </div>

        {/* Role Selector */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>User Role</label>
          <select 
            value={role} 
            onChange={(e) => handleUpdate("gb_role", e.target.value, setRole)}
            style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "var(--badge-bg)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
          >
            <option value="guest">Guest</option>
            <option value="member">Member</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        {/* Plan Selector */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>Subscription Plan</label>
          <select 
            value={plan} 
            onChange={(e) => handleUpdate("gb_plan", e.target.value, setPlan)}
            style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "var(--badge-bg)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
          >
            <option value="free">Free Tier</option>
            <option value="premium">Premium Tier</option>
            <option value="enterprise">Enterprise Tier</option>
          </select>
        </div>

        {/* Login Status */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>Authentication</label>
          <button 
            onClick={() => handleUpdate("gb_logged_in", loggedIn ? "false" : "true", setLoggedIn)}
            style={{ 
              width: "100%", 
              padding: "6px", 
              borderRadius: "6px", 
              background: loggedIn ? "rgba(16, 185, 129, 0.15)" : "var(--badge-bg)", 
              color: loggedIn ? "var(--success)" : "var(--foreground)",
              border: "1px solid var(--card-border)",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {loggedIn ? "🔓 Logged In" : "🔒 Guest (Logged Out)"}
          </button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ display: "block", fontSize: "10px", color: "var(--badge-text)" }}>Sticky Cookie / User ID:</span>
          <code style={{ fontSize: "11px", color: "var(--accent)" }}>{anonId}</code>
        </div>
        <button 
          onClick={resetUserSession}
          className="btn btn-secondary" 
          style={{ padding: "4px 8px", fontSize: "11px" }}
        >
          🔄 Re-roll User ID
        </button>
      </div>
    </div>
  );
}
