import { useState } from "react";

const sandraData = {
  persona: "Sandra Chen",
  role: "Senior Service Officer, Local Government Council",
  pov: "A senior service officer needs a way to maintain visibility of every request from receipt to resolution because the current process — shared inboxes, manual spreadsheets, and email-based handoffs — causes jobs to fall through the gaps, makes the team look incompetent, and leaves her managing paper rather than managing work.",
  painPoints: [
    "Requests arrive with insufficient detail via free-text emails",
    "No automatic resident acknowledgements after submission",
    "Loses visibility once a job is forwarded to field teams",
    "Spreadsheet tracking is error-prone and manual",
    "Communication failures make the team look incompetent even when work is done",
    "Overdue items must be spotted manually",
  ],
  hmw: [
    "How might we make Sandra feel confident that every request has enough detail to act on immediately?",
    "How might we give Sandra real-time visibility of a job's status after she forwards it?",
    "How might we eliminate the manual data entry that drains Sandra's time and morale?",
    "How might we ensure residents receive instant acknowledgement so Sandra isn't fielding complaint calls?",
    "How might we surface overdue items automatically instead of relying on Sandra to spot them?",
    "How might we let Sandra spend more time on complex, human-facing work instead of repetitive admin?",
  ],
};

const marcusData = {
  persona: "Marcus",
  role: "Field Operations Coordinator, Local Government Council",
  pov: "A field operations coordinator needs a way to receive complete, reliable job information and track crew progress in one place because the current system — WhatsApp dispatch, personal spreadsheets, and informal update handoffs — causes rework, missed completions, and an end-of-day admin backlog that keeps him from the hands-on work he values.",
  painPoints: [
    "Incomplete job details cause crews to attend wrong locations",
    "No formal dispatch system — WhatsApp is used instead",
    "Three separate spreadsheets that do not sync with each other",
    "Completion updates fall through during busy periods",
    "Stopped raising improvement ideas after proposals went nowhere",
  ],
  hmw: [
    "How might we ensure field crews always have complete job information before attending a site?",
    "How might we replace WhatsApp dispatch with a system that provides an audit trail?",
    "How might we give Marcus a single source of truth for all open jobs instead of three spreadsheets?",
    "How might we make job completion logging so fast that updates never fall through on busy days?",
    "How might we reduce Marcus's end-of-day admin backlog so he can return to field-facing work?",
    "How might we make Marcus feel that raising improvement ideas is worthwhile again?",
  ],
};

const colors = {
  sandra: {
    accent: "#1B6B5A",
    light: "#E8F4F0",
    border: "#A7D5C8",
    tag: "#1B6B5A",
    tagBg: "#D1EDE5",
  },
  marcus: {
    accent: "#C05A1F",
    light: "#FDF0E8",
    border: "#F0C8A8",
    tag: "#C05A1F",
    tagBg: "#FAE0CC",
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
                  { label: "Need", desc: "A way to maintain visibility and control over service requests" },
                  { label: "Insight", desc: "Current manual processes create gaps, rework, and invisible outcomes" },
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
          <PersonaCard data={sandraData} colorKey="sandra" />
          <PersonaCard data={marcusData} colorKey="marcus" />
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
