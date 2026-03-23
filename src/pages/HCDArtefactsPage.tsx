import { useState } from "react";

const citizenData = {
  persona: "Citizen User",
  role: "Community Member reporting a service issue",
  pov: "A concerned resident needs a way to know their service request is being acted on because once they submit it, they feel completely invisible — with no confirmation, no updates, and no idea if anyone even received it.",
  painPoints: [
    "No confirmation after submitting a request",
    "No visibility into request status without logging back in",
    "Uncertainty about whether the right department received it",
    "Generic or absent communication during delays",
  ],
  hmw: [
    "How might we make a citizen feel heard the moment they submit a request?",
    "How might we reduce the anxiety of waiting without requiring citizens to log back in?",
    "How might we give citizens confidence that their request reached the right person?",
    "How might we make status updates feel personal rather than automated and generic?",
    "How might we help citizens who aren't tech-savvy still successfully submit a request?",
    "How might we let citizens know when something is delayed without making them feel ignored?",
  ],
};

const staffData = {
  persona: "Staff User",
  role: "Government Service Staff managing incoming tickets",
  pov: "A government service staff member needs a way to quickly understand and prioritize incoming requests because they're drowning in unstructured submissions with no context — and every minute spent manually reading and sorting is a minute not spent actually resolving issues.",
  painPoints: [
    "Manual reading and sorting of every incoming request",
    "No clear priority signals on new submissions",
    "High-urgency tickets get buried under low-priority ones",
    "Lack of context when picking up someone else's ticket",
  ],
  hmw: [
    "How might we help staff instantly understand the urgency of a new ticket without reading the full description?",
    "How might we reduce the time between a request coming in and a staff member acting on it?",
    "How might we prevent high-priority tickets from getting buried under low-priority ones?",
    "How might we give staff the context they need to resolve a ticket faster?",
    "How might we alert supervisors automatically before an SLA breach happens — not after?",
    "How might we make the handoff between staff members seamless when a ticket changes hands?",
  ],
};

const colors = {
  citizen: {
    accent: "#2563EB",
    light: "#EFF6FF",
    border: "#BFDBFE",
    tag: "#1D4ED8",
    tagBg: "#DBEAFE",
  },
  staff: {
    accent: "#7C3AED",
    light: "#F5F3FF",
    border: "#DDD6FE",
    tag: "#6D28D9",
    tagBg: "#EDE9FE",
  },
};

function PersonaCard({ data, colorKey }) {
  const [activeTab, setActiveTab] = useState("pov");
  const c = colors[colorKey];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: `1px solid ${c.border}`,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: c.light,
          borderBottom: `1px solid ${c.border}`,
          padding: "24px 28px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: c.accent,
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: c.tag,
            }}
          >
            {data.role}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#111827" }}>
          {data.persona}
        </h2>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #F3F4F6",
          padding: "0 28px",
        }}
      >
        {[
          { id: "pov", label: "POV Statement" },
          { id: "pain", label: "Pain Points" },
          { id: "hmw", label: `HMW Questions (${data.hmw.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 4px",
              marginRight: "24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${c.accent}` : "2px solid transparent",
              color: activeTab === tab.id ? c.accent : "#6B7280",
              fontWeight: activeTab === tab.id ? "600" : "400",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px", flex: 1 }}>
        {activeTab === "pov" && (
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: c.tagBg,
                color: c.tag,
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Point of View
            </div>
            <blockquote
              style={{
                margin: 0,
                padding: "20px 24px",
                background: c.light,
                borderLeft: `4px solid ${c.accent}`,
                borderRadius: "0 10px 10px 0",
                color: "#1F2937",
                fontSize: "15px",
                lineHeight: "1.7",
                fontStyle: "italic",
              }}
            >
              {data.pov}
            </blockquote>
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px", fontWeight: "500" }}>
                FORMULA BREAKDOWN
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "User", desc: data.persona },
                  { label: "Need", desc: "A way to stay informed and feel heard" },
                  { label: "Insight", desc: "Current process creates invisibility after submission" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        background: c.tagBg,
                        color: c.tag,
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        minWidth: "52px",
                        textAlign: "center",
                        marginTop: "1px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.label}
                    </span>
                    <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pain" && (
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#FEF2F2",
                color: "#DC2626",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Key Pain Points
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.painPoints.map((point, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px 16px",
                    background: "#FAFAFA",
                    borderRadius: "10px",
                    border: "1px solid #F3F4F6",
                  }}
                >
                  <span
                    style={{
                      background: "#FEE2E2",
                      color: "#DC2626",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "hmw" && (
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#F0FDF4",
                color: "#16A34A",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              How Might We
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.hmw.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px",
                    background: c.light,
                    border: `1px solid ${c.border}`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      color: c.accent,
                      fontSize: "16px",
                      fontWeight: "700",
                      flexShrink: 0,
                      lineHeight: "1.4",
                    }}
                  >
                    ?
                  </span>
                  <span style={{ fontSize: "14px", color: "#1F2937", lineHeight: "1.6" }}>
                    {q}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HCDArtefactsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#F0FDF4",
              color: "#15803D",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Sprint 1 · HCD Artefacts
          </div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "36px",
              fontWeight: "800",
              color: "#111827",
              lineHeight: "1.2",
            }}
          >
            POV Statements &amp; How Might We
          </h1>
          <p style={{ margin: 0, color: "#6B7280", fontSize: "16px", maxWidth: "600px", lineHeight: "1.6" }}>
            Human-Centered Design artefacts grounding our build decisions in real user needs.
            Each POV is derived from empathy research; each HMW reframes a pain point as an opportunity.
          </p>
        </div>

        {/* Formula Reference */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            POV Formula
          </span>
          {["[User]", "needs a way to", "[verb their need]", "because", "[surprising insight]"].map((part, i) => (
            <span
              key={i}
              style={{
                fontSize: "13px",
                fontWeight: i % 2 === 0 ? "700" : "400",
                color: i % 2 === 0 ? "#111827" : "#6B7280",
                background: i % 2 === 0 ? "#F3F4F6" : "transparent",
                padding: i % 2 === 0 ? "3px 10px" : "3px 0",
                borderRadius: i % 2 === 0 ? "6px" : "0",
              }}
            >
              {part}
            </span>
          ))}
        </div>

        {/* Persona Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "24px",
          }}
        >
          <PersonaCard data={citizenData} colorKey="citizen" />
          <PersonaCard data={staffData} colorKey="staff" />
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: "13px",
            marginTop: "40px",
          }}
        >
          Artefacts authored by Dev 2 (Emily) · Sprint 1 · Civic Service Request Tracker
        </p>
      </div>
    </div>
  );
}
