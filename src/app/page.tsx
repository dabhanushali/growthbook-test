"use client";

import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { useState, useEffect } from "react";
import { PocController } from "@/components/PocController";
import posthog from "posthog-js";

export default function Home() {
  // 1. Evaluate ON/OFF Feature Flags
  const isNewHomepage = useFeatureIsOn("new-homepage");
  const isDarkMode = useFeatureIsOn("dark-mode");
  const isAiAssistantEnabled = useFeatureIsOn("ai-assistant");
  const isNewCheckoutEnabled = useFeatureIsOn("new-checkout");

  // 2. Evaluate Experiment Values (with defaults)
  const heroVariant = useFeatureValue("homepage-hero", "control"); // "control" vs "variant"
  const ctaColor = useFeatureValue("cta-button", "blue"); // "blue" vs "green"

  // 3. UI states
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "ai", text: "Hello! How can I help you check out our GrowthBook features today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = idle, 1 = plan selected, 2 = complete

  // 4. Analytics tracking helper
  const trackCTA = (action: string) => {
    console.log(`PostHog Event: CTA Clicked - Action: ${action}`);
    posthog.capture("CTA Clicked", {
      action,
      heroVariant,
      ctaColor,
      isNewHomepage,
    });
  };

  const startSignup = () => {
    console.log("PostHog Event: Signup Started");
    posthog.capture("Signup Started", {
      isNewCheckoutEnabled,
    });
    setCheckoutStep(1);
  };

  const completeSignup = () => {
    console.log("PostHog Event: Signup Completed");
    posthog.capture("Signup Completed", {
      isNewCheckoutEnabled,
    });
    setCheckoutStep(2);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: "ai", 
        text: `You sent: "${userMsg}". Since this is a POC mock, I can confirm your GrowthBook profile attributes are actively evaluated in our Edge Middleware!` 
      }]);
    }, 800);
  };

  // 5. Apply Dark Mode class to page wrapper dynamically based on flag
  return (
    <div className={`page-container ${isDarkMode ? "dark-mode" : ""}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Banner */}
      <header style={{ borderBottom: "1px solid var(--card-border)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>Experimentation POC</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`badge ${isDarkMode ? "badge-active" : ""}`}>
            Dark Mode: {isDarkMode ? "ON" : "OFF"}
          </span>
          <span className={`badge ${isNewHomepage ? "badge-active" : ""}`}>
            New Home: {isNewHomepage ? "ON" : "OFF"}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px 24px", maxWidth: "1200px", width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
        
        {/* Left Hand Render Panel (Demonstrates Flags) */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Feature 1: New Homepage vs Classic Homepage rendering */}
          {isNewHomepage ? (
            /* Variant New Homepage View */
            <div className="glass-card" style={{ background: "linear-gradient(135deg, var(--card-bg), rgba(99, 102, 241, 0.05))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="badge badge-active" style={{ marginBottom: "12px" }}>✨ New Homepage Enabled</span>
                <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "bold" }}>Feature Flag (new-homepage)</span>
              </div>
              
              {/* Feature 5: A/B Testing Hero Experiment */}
              {heroVariant === "variant" ? (
                <div style={{ margin: "16px 0" }}>
                  <h1 style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.1, marginBottom: "12px", background: "linear-gradient(to right, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Experience the Future of Personalization at the Edge!
                  </h1>
                  <p style={{ fontSize: "16px", color: "var(--badge-text)", maxWidth: "600px", lineHeight: "24px" }}>
                    Welcome to the variant hero section. Flags are fetched, and rules are evaluated locally in microseconds with absolute stability.
                  </p>
                </div>
              ) : (
                <div style={{ margin: "16px 0" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
                    Next.js Edge Experimentation & Flags
                  </h1>
                  <p style={{ fontSize: "15px", color: "var(--badge-text)", maxWidth: "550px" }}>
                    Welcome to the control hero section. Check out the targeting widgets on the right to trigger other variations.
                  </p>
                </div>
              )}

              {/* Action Buttons & CTA Experiment */}
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                {isNewCheckoutEnabled ? (
                  /* Feature 4: New Checkout Wizard vs Traditional button */
                  <div style={{ width: "100%", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "16px", background: "var(--background)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>Wizard Checkout Flow (new-checkout = ON)</span>
                      <span className="badge badge-active">Advanced</span>
                    </div>

                    {checkoutStep === 0 && (
                      <div>
                        <p style={{ fontSize: "13px", marginBottom: "12px" }}>Select your subscription plan to get started instantly.</p>
                        <button 
                          onClick={startSignup}
                          className="btn" 
                          style={{ 
                            background: ctaColor === "green" ? "var(--success)" : "var(--primary)", 
                            color: "white" 
                          }}
                        >
                          Unlock Plan Now
                        </button>
                      </div>
                    )}

                    {checkoutStep === 1 && (
                      <div>
                        <p style={{ fontSize: "13px", marginBottom: "12px", color: "var(--accent)" }}>✓ Plan selected! Complete authorization setup below.</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={completeSignup} className="btn btn-primary" style={{ flex: 1 }}>Confirm Signup</button>
                          <button onClick={() => setCheckoutStep(0)} className="btn btn-secondary">Cancel</button>
                        </div>
                      </div>
                    )}

                    {checkoutStep === 2 && (
                      <div style={{ textAlign: "center", padding: "12px 0" }}>
                        <h4 style={{ color: "var(--success)", margin: "0 0 4px 0" }}>🎉 Signup Completed!</h4>
                        <p style={{ fontSize: "12px", margin: 0 }}>Check your dashboard event stream in PostHog for conversions.</p>
                        <button onClick={() => setCheckoutStep(0)} className="btn btn-secondary" style={{ marginTop: "8px", padding: "4px 8px", fontSize: "11px" }}>Reset</button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Button (New Checkout Disabled) */
                  <button 
                    onClick={() => { trackCTA("Standard Sign Up"); startSignup(); }}
                    className="btn" 
                    style={{ 
                      background: ctaColor === "green" ? "var(--success)" : "var(--primary)", 
                      color: "white" 
                    }}
                  >
                    Get Started (CTA Color: {ctaColor.toUpperCase()})
                  </button>
                )}
                
                <button 
                  onClick={() => trackCTA("Learn More")}
                  className="btn btn-secondary"
                >
                  Learn More
                </button>
              </div>

              {/* Secondary features Grid */}
              <div style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: "16px", marginTop: "24px" }}>
                <div style={{ border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>⚡ Speed</h4>
                  <p style={{ fontSize: "12px", color: "var(--badge-text)", margin: 0 }}>Flags are fully static-analyzable and streamed via SSE for millisecond updates.</p>
                </div>
                <div style={{ border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>🎯 Targeting</h4>
                  <p style={{ fontSize: "12px", color: "var(--badge-text)", margin: 0 }}>Middleware evaluates geolocation and attributes before request rendering.</p>
                </div>
              </div>

            </div>
          ) : (
            /* Classic Homepage View */
            <div className="glass-card" style={{ border: "2px solid var(--card-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge">Classic Design</span>
                <span style={{ fontSize: "11px", color: "var(--badge-text)" }}>Feature Flag (new-homepage = OFF)</span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 8px 0" }}>
                GrowthBook Classic Homepage
              </h1>
              <p style={{ fontSize: "14px", color: "var(--badge-text)", marginBottom: "16px" }}>
                This is the fallback classic interface. You can enable the "new-homepage" feature flag in the GrowthBook dashboard to show the new interactive grid dashboard.
              </p>
              
              <button 
                onClick={() => trackCTA("Classic Sign Up")}
                className="btn btn-primary"
              >
                Sign Up Classic
              </button>
            </div>
          )}

          {/* Explanation panel for user */}
          <div className="glass-card">
            <h4 style={{ margin: "0 0 12px 0" }}>💡 Feature Flag & Experiment Guide</h4>
            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <th style={{ padding: "8px 0" }}>Feature Flag</th>
                  <th style={{ padding: "8px 0" }}>Status</th>
                  <th style={{ padding: "8px 0" }}>Target/Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "8px 0" }}><code>new-homepage</code></td>
                  <td>{isNewHomepage ? <span style={{ color: "var(--success)" }}>ON</span> : "OFF"}</td>
                  <td>Renders layout variant A vs B</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "8px 0" }}><code>dark-mode</code></td>
                  <td>{isDarkMode ? <span style={{ color: "var(--success)" }}>ON</span> : "OFF"}</td>
                  <td>Overrides stylesheet colors</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "8px 0" }}><code>ai-assistant</code></td>
                  <td>{isAiAssistantEnabled ? <span style={{ color: "var(--success)" }}>ON</span> : "OFF"}</td>
                  <td>Renders chatbot (premium users only)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "8px 0" }}><code>new-checkout</code></td>
                  <td>{isNewCheckoutEnabled ? <span style={{ color: "var(--success)" }}>ON</span> : "OFF"}</td>
                  <td>Renders Multi-step signup form wizard</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={{ padding: "8px 0" }}><code>homepage-hero</code></td>
                  <td style={{ color: "var(--accent)" }}>{heroVariant.toUpperCase()}</td>
                  <td>A/B testing variant rule</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0" }}><code>cta-button</code></td>
                  <td style={{ color: "var(--accent)" }}>{ctaColor.toUpperCase()}</td>
                  <td>CTA color experiment (blue/green)</td>
                </tr>
              </tbody>
            </table>
          </div>

        </section>

        {/* Right Hand Sidebar (Controller Panel) */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Interactive mock user controller */}
          <PocController />

          {/* Quick Stats Panel */}
          <div className="glass-card" style={{ fontSize: "13px" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>📊 Active Experiment States</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--badge-text)" }}>Exposure Trigger:</span>
                <code>$experiment_started</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--badge-text)" }}>PostHog Host:</span>
                <span style={{ fontSize: "11px", wordBreak: "break-all" }}>{process.env.NEXT_PUBLIC_POSTHOG_HOST}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--badge-text)" }}>GrowthBook host:</span>
                <span>{process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST}</span>
              </div>
            </div>
          </div>

        </aside>
      </main>

      {/* Feature 3: Floating AI Chat Assistant Widget (if enabled) */}
      {isAiAssistantEnabled && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
          {showAiChat ? (
            <div className="glass-card" style={{ width: "320px", height: "400px", display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--primary)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🤖</span>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>AI Assistant (Active)</span>
                </div>
                <button onClick={() => setShowAiChat(false)} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "var(--foreground)" }}>×</button>
              </div>

              {/* Chat Message Window */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "8px" }}>
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    style={{ 
                      alignSelf: msg.sender === "ai" ? "flex-start" : "flex-end",
                      background: msg.sender === "ai" ? "var(--badge-bg)" : "var(--primary)",
                      color: msg.sender === "ai" ? "var(--foreground)" : "white",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      maxWidth: "80%"
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Send Box */}
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid var(--card-border)", fontSize: "12px", background: "var(--background)", color: "var(--foreground)" }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "8px 12px" }}>Send</button>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => { setShowAiChat(true); trackCTA("AI Chat Opened"); }}
              className="btn btn-primary" 
              style={{ 
                borderRadius: "50%", 
                width: "56px", 
                height: "56px", 
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                fontSize: "24px"
              }}
            >
              💬
            </button>
          )}
        </div>
      )}
    </div>
  );
}
