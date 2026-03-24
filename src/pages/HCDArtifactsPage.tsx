import { useState } from "react";

const sandraData = {
  persona: "Sandra Chen",
  role: "Senior Service Officer, Local Government Council",
  pov: "A senior service officer needs a way to maintain visibility of every request from receipt to resolution because the current process — shared inboxes, manual spreadsheets, and email-based handoffs — causes jobs to fall through the gaps, makes the team look incompetent, and leaves her managing paper rather than managing work.",
  painPoints: [
    "Requests arrive with insufficient detail via free-text emails",
    "No automatic resident acknowledgments after submission",
    "Loses visibility once a job is forwarded to field teams",
    "Spreadsheet tracking is error-prone and manual",
    "Communication failures make the team look incompetent even when work is done",
    "Overdue items must be spotted manually",
  ],
  hmw: [
    "How might we make Sandra feel confident that every request has enough detail to act on immediately?",
    "How might we give Sandra real-time visibility of a job's status after she forwards it?",
    "How might we eliminate the manual data entry that drains Sandra's time and morale?",
    "How might we ensure residents receive instant acknowledgment so Sandra isn't fielding complaint calls?",
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

const mariaData = {
  persona: "Maria Santos",
  role: "Retired School Administrator, Citizen",
  pov: "A retired resident needs a way to report neighborhood issues and receive confirmation that her report was received because the current process provides no acknowledgment, no tracking, and no closure — leaving her feeling invisible and causing her to give up on reporting entirely.",
  painPoints: [
    "Called the city twice; second representative had no record of her first report",
    "No confirmation of receipt — form feels like a black hole",
    "Silence is the default during waiting — no status, no timeline, no contact",
    "Case number was lost, forcing her to re-explain from scratch",
    "Feels invisible when reports disappear with no acknowledgment",
    "Gave up on reporting after repeated failures eroded her trust",
  ],
  hmw: [
    "How might we ensure every citizen receives instant confirmation so no one wonders whether their report was received?",
    "How might we eliminate the silence during the waiting period that causes citizens to assume their report was lost?",
    "How might we prevent citizens from having to re-explain their issue when they follow up with a different staff member?",
    "How might we rebuild trust with citizens like Maria who have already given up on the reporting process?",
    "How might we design a submission experience simple enough that citizens who prefer phone calls still feel confident using it?",
    "How might we make the system's response feel personal rather than automated, so citizens feel acknowledged as people?",
  ],
};

const darnellData = {
  persona: "Darnell Washington",
  role: "Small Business Owner, Citizen",
  pov: "A tech-savvy business owner needs a way to submit a civic issue report and track its status in real time because the current system creates duplicate tickets, provides no status updates, and forces him to self-solve infrastructure problems while waiting — wasting his time and eroding his confidence in the city.",
  painPoints: [
    "Resubmitted the same form twice because there was no confirmation it went through",
    "Found out his streetlight was fixed from a customer, not the city",
    "Duplicate tickets were created with no notification or deduplication",
    "Self-solved while waiting (installed own lighting outside business)",
    "No way to track status — had to call or resubmit to check progress",
    "Citizen effort feels completely wasted at the follow-up stage",
  ],
  hmw: [
    "How might we give citizens a trackable ticket number immediately so they never need to resubmit?",
    "How might we proactively notify citizens when their issue is resolved instead of relying on word of mouth?",
    "How might we detect and prevent duplicate submissions so neither citizens nor staff waste effort?",
    "How might we provide real-time status updates so citizens never need to call for a progress check?",
    "How might we make the system reliable enough that citizens stop self-solving problems the city should handle?",
    "How might we turn the follow-up stage from the lowest trust point into a moment that reinforces confidence?",
  ],
};

const graceData = {
  persona: "Grace Okafor",
  role: "Retired Long-Term Resident (34 years), Citizen",
  pov: "A long-term community resident needs a way to report civic issues through an official channel that demonstrably follows through because the current system rewards personal connections over fairness, excludes neighbors without digital literacy or language access, and has eroded her trust to the point where she routes everything through her council representative as a workaround.",
  painPoints: [
    "Stopped using the general city number after a dangerous tree report went unanswered for weeks",
    "Routes all requests through her council rep — a workaround not available to everyone",
    "Worries that neighbors without connections or language skills are completely left out",
    "The system rewards persistence and personal contacts over fairness",
    "Won't recommend a tool unless it demonstrably follows through",
    "Skeptical about future reporting — will only re-engage if the process proves reliable",
  ],
  hmw: [
    "How might we make the official reporting channel more reliable than personal workarounds like calling a council rep?",
    "How might we ensure citizens without digital literacy or English proficiency can access the same reporting system?",
    "How might we design the system so that equity is built in — not dependent on who you know?",
    "How might we demonstrate follow-through convincingly enough that skeptical long-term residents re-engage?",
    "How might we turn satisfied citizens into advocates who help their neighbors access the system?",
    "How might we close the loop on every report so no citizen ever feels their issue disappeared into a void?",
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
  maria: {
    accent: "#1D4ED8",
    light: "#EFF6FF",
    border: "#BFDBFE",
    tag: "#1D4ED8",
    tagBg: "#DBEAFE",
  },
  darnell: {
    accent: "#6D28D9",
    light: "#F5F3FF",
    border: "#DDD6FE",
    tag: "#6D28D9",
    tagBg: "#EDE9FE",
  },
  grace: {
    accent: "#BE123C",
    light: "#FFF1F2",
    border: "#FECDD3",
    tag: "#BE123C",
    tagBg: "#FFE4E6",
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

export default function HCDArtifactsPage() {
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
            Sprint 1 · HCD Artifacts
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
            Human-Centered Design artifacts grounding our build decisions in real user needs.
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

        {/* Future Opportunities */}
        <div style={{ marginTop: "48px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: "800", color: "#111827" }}>
              Future Opportunities
            </h2>
            <p style={{ margin: 0, color: "#6B7280", fontSize: "14px", lineHeight: "1.6", maxWidth: "620px" }}>
              Ideas identified during HCD research that are out of scope for v1.0 but worth revisiting.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                label: "Personalized Status Language",
                description:
                  'Instead of generic labels like "In Review", generate citizen-facing status messages that reference their specific issue.',
                hmw: "How might we make status updates feel personal rather than automated and generic?",
              },
              {
                label: "Accessibility-First Submission Flow",
                description:
                  "Offer a simplified, high-contrast, large-text submission mode for citizens who aren't tech-savvy or have accessibility needs.",
                hmw: "How might we help citizens who aren't tech-savvy still successfully submit a request?",
              },
              {
                label: "Proactive SLA Warnings to Staff",
                description:
                  "Alert staff when a ticket is approaching its SLA threshold, giving them time to act before escalation fires.",
                hmw: "How might we alert supervisors automatically before an SLA breach happens — not after?",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "22px 26px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                  {item.label}
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>
                  {item.description}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#F3F4F6",
                    color: "#6B7280",
                    borderRadius: "6px",
                    padding: "5px 12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "1.4",
                  }}
                >
                  <span style={{ fontWeight: "600", color: "#374151" }}>HMW:</span> {item.hmw}
                </div>
              </div>
            ))}
          </div>
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
          Artifacts authored by Dev 2 (Emily) · Sprint 1 · Civic Service Request Tracker
        </p>
      </div>
    </div>
  );
}
