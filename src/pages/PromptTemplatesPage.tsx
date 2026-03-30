import { useState } from "react";
import HcdDropdown from "@/components/HcdDropdown";

// ─── PROMPT TEMPLATE DATA ────────────────────────────────────────────────────

const templates = [
  {
    id: "triage",
    feature: "F2",
    label: "AI Request Triage",
    sprint: "Used in Sprint 2 · S2-03",
    version: "v1.0",
    author: "Dev 2 (Emily)",
    purpose:
      "Classifies each incoming citizen request by type and priority, and generates a plain-English summary for staff.",
    inputs: ["submission_text", "submission_type", "location"],
    outputs: ["request_type", "priority", "summary"],
    color: { accent: "#7C3AED", light: "#F5F3FF", border: "#DDD6FE", tag: "#6D28D9", tagBg: "#EDE9FE" },
    systemPrompt: `You are an AI triage assistant for a government civic service request portal. Your job is to classify incoming citizen service requests accurately and consistently.

You will be given a citizen's submission text, their selected request type, and their location. Use all three to make your classification decisions.

Always respond with valid JSON only. Do not include any explanation or text outside the JSON object.`,
    userPrompt: `Classify the following civic service request and return a JSON object.

Submission Text: {{submission_text}}
Selected Type: {{submission_type}}
Location: {{location}}

Return this exact JSON structure:
{
  "request_type": "one of: Road & Infrastructure | Waste & Sanitation | Parks & Recreation | Water & Drainage | Lighting & Electrical | Noise & Disturbance | Other",
  "priority": "one of: Low | Medium | High | Critical",
  "summary": "A 1–2 sentence plain-English summary written for a staff member, describing the issue and why it matters",
  "confidence": "one of: High | Medium | Low"
}

Priority guidelines:
- Critical: safety hazard, road blocked, flooding, exposed wiring
- High: service outage affecting multiple residents, broken traffic signal
- Medium: non-urgent infrastructure issue, park damage, graffiti
- Low: general inquiry, minor cosmetic issue, low-impact complaint`,
    sampleInput: {
      submission_text: "There's a massive pothole on Elm Street near the school crossing. A car already hit it this morning and it's getting worse.",
      submission_type: "Road & Infrastructure",
      location: "Elm Street, near Lincoln Elementary"
    },
    sampleOutput: {
      request_type: "Road & Infrastructure",
      priority: "High",
      summary: "A large pothole on Elm Street near a school crossing is causing vehicle damage and poses a safety risk to pedestrians and commuters. Immediate inspection recommended.",
      confidence: "High"
    }
  },
  {
    id: "escalation",
    feature: "F12",
    label: "Escalation Alert",
    sprint: "Used in Sprint 3 · S3-07",
    version: "v1.0",
    author: "Dev 2 (Emily)",
    purpose:
      "Generates a supervisor alert message when a ticket has breached its SLA threshold (48 hours unresolved).",
    inputs: ["ticket_id", "request_type", "priority", "summary", "submitted_at", "hours_open", "assigned_to"],
    outputs: ["alert_subject", "alert_body", "recommended_action"],
    color: { accent: "#DC2626", light: "#FEF2F2", border: "#FECACA", tag: "#B91C1C", tagBg: "#FEE2E2" },
    systemPrompt: `You are an automated escalation assistant for a government civic service portal. You generate professional supervisor alert messages when service requests have exceeded their SLA resolution threshold.

Your messages must be clear, factual, and professional. Do not use alarmist language. Focus on the facts: what the issue is, how long it has been open, and what action is recommended.

Always respond with valid JSON only. Do not include any explanation or text outside the JSON object.`,
    userPrompt: `Generate a supervisor escalation alert for the following overdue service request.

Ticket ID: {{ticket_id}}
Request Type: {{request_type}}
Priority: {{priority}}
Summary: {{summary}}
Submitted At: {{submitted_at}}
Hours Open: {{hours_open}}
Assigned To: {{assigned_to}}

Return this exact JSON structure:
{
  "alert_subject": "A short email subject line, e.g. 'SLA Breach – [Type] Ticket #[ID]'",
  "alert_body": "A 3–4 sentence professional alert message for a supervisor. Include: ticket ID, issue type, how long it has been open, who it is assigned to, and a clear call to action.",
  "recommended_action": "one of: Reassign | Escalate to Manager | Request Status Update | Schedule Site Visit | Close as Duplicate"
}`,
    sampleInput: {
      ticket_id: "TKT-00482",
      request_type: "Lighting & Electrical",
      priority: "High",
      summary: "Street light outage on Main St affecting pedestrian safety at night.",
      submitted_at: "2026-03-21 09:14 AM",
      hours_open: "52",
      assigned_to: "James Carter"
    },
    sampleOutput: {
      alert_subject: "SLA Breach – Lighting & Electrical Ticket #TKT-00482",
      alert_body: "Ticket #TKT-00482 (Lighting & Electrical – High Priority) has been open for 52 hours without resolution, exceeding the 48-hour SLA threshold. The issue involves a street light outage on Main Street posing a pedestrian safety risk. This ticket is currently assigned to James Carter. Please review and ensure immediate action is taken.",
      recommended_action: "Request Status Update"
    }
  },
  {
    id: "survey",
    feature: "F15",
    label: "Satisfaction Survey",
    sprint: "Used in Sprint 3 · S3-09",
    version: "v1.0",
    author: "Dev 2 (Emily)",
    purpose:
      "Generates 3–5 personalised post-resolution survey questions tailored to the specific request type and resolution outcome.",
    inputs: ["ticket_id", "request_type", "resolution_notes", "citizen_name"],
    outputs: ["survey_intro", "questions"],
    color: { accent: "#059669", light: "#F0FDF4", border: "#A7F3D0", tag: "#047857", tagBg: "#D1FAE5" },
    systemPrompt: `You are a citizen experience assistant for a government civic service portal. Your job is to generate short, friendly, and relevant post-resolution satisfaction survey questions.

Questions should feel personal and specific to the type of service request resolved — not generic. Use a warm, approachable tone appropriate for a government service context.

Always respond with valid JSON only. Do not include any explanation or text outside the JSON object.`,
    userPrompt: `Generate a post-resolution satisfaction survey for the following resolved service request.

Ticket ID: {{ticket_id}}
Request Type: {{request_type}}
Resolution Notes: {{resolution_notes}}
Citizen Name: {{citizen_name}}

Return this exact JSON structure:
{
  "survey_intro": "A 1–2 sentence friendly intro addressed to the citizen by first name, acknowledging their request was resolved",
  "questions": [
    {
      "id": "q1",
      "text": "Survey question text",
      "type": "one of: rating_1_5 | yes_no | open_text"
    }
  ]
}

Rules:
- Generate exactly 4 questions
- Include at least one rating question, one yes/no, and one open_text
- Make at least 2 questions specific to the request_type and resolution_notes
- Keep all question text under 20 words
- Do not ask about personal information`,
    sampleInput: {
      ticket_id: "TKT-00391",
      request_type: "Road & Infrastructure",
      resolution_notes: "Pothole on Elm Street filled and road surface patched by public works crew on March 22.",
      citizen_name: "Maria"
    },
    sampleOutput: {
      survey_intro: "Hi Maria, your pothole repair request on Elm Street has been resolved. We'd love to hear how we did!",
      questions: [
        { id: "q1", text: "How satisfied are you with how quickly the pothole was repaired?", type: "rating_1_5" },
        { id: "q2", text: "Was the repaired road surface in acceptable condition when you last saw it?", type: "yes_no" },
        { id: "q3", text: "Did our team communicate clearly about the status of your request?", type: "rating_1_5" },
        { id: "q4", text: "Is there anything else you'd like to share about your experience?", type: "open_text" }
      ]
    }
  }
];

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color: color,
      borderRadius: "6px", padding: "3px 10px",
      fontSize: "11px", fontWeight: "600",
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function CodeBlock({ content, language = "json" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(
      typeof content === "string" ? content : JSON.stringify(content, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  return (
    <div style={{ position: "relative" }}>
      <pre style={{
        background: "#0F172A", color: "#E2E8F0",
        borderRadius: "10px", padding: "18px 20px",
        fontSize: "12.5px", lineHeight: "1.7",
        overflowX: "auto", margin: 0,
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
      }}>
        <code>{text}</code>
      </pre>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute", top: "10px", right: "10px",
          background: copied ? "#16A34A" : "#334155",
          color: "#fff", border: "none", borderRadius: "6px",
          padding: "5px 12px", fontSize: "11px", fontWeight: "600",
          cursor: "pointer", transition: "background 0.2s",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function IOPill({ label, items, color }) {
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map(item => (
          <span key={item} style={{
            background: color.tagBg, color: color.tag,
            borderRadius: "6px", padding: "3px 10px",
            fontSize: "12px", fontWeight: "500",
            fontFamily: "'Fira Code', monospace",
          }}>
            {`{{${item}}}`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── TEMPLATE CARD ───────────────────────────────────────────────────────────

function TemplateCard({ template }) {
  const [tab, setTab] = useState("system");
  const c = template.color;
  const tabs = [
    { id: "system", label: "System Prompt" },
    { id: "user", label: "User Prompt" },
    { id: "sample", label: "Sample I/O" },
  ];

  return (
    <div style={{
      background: "#fff", borderRadius: "16px",
      border: `1px solid ${c.border}`,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ background: c.light, borderBottom: `1px solid ${c.border}`, padding: "22px 26px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge color={c.tag} bg={c.tagBg}>{template.feature}</Badge>
            <Badge color="#374151" bg="#F3F4F6">{template.version}</Badge>
          </div>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{template.sprint}</span>
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "700", color: "#111827" }}>
          {template.label}
        </h2>
        <p style={{ margin: 0, fontSize: "13.5px", color: "#6B7280", lineHeight: "1.5" }}>
          {template.purpose}
        </p>
      </div>

      {/* I/O Summary */}
      <div style={{
        padding: "18px 26px",
        borderBottom: `1px solid #F3F4F6`,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
      }}>
        <IOPill label="Inputs" items={template.inputs} color={c} />
        <IOPill label="Outputs" items={template.outputs} color={c} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 26px", borderBottom: "1px solid #F3F4F6" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 4px", marginRight: "20px",
            background: "none", border: "none",
            borderBottom: tab === t.id ? `2px solid ${c.accent}` : "2px solid transparent",
            color: tab === t.id ? c.accent : "#6B7280",
            fontWeight: tab === t.id ? "600" : "400",
            fontSize: "13px", cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "22px 26px" }}>
        {tab === "system" && (
          <div>
            <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#9CA3AF", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              System Prompt — sets the AI's role and rules
            </p>
            <CodeBlock content={template.systemPrompt} language="text" />
          </div>
        )}
        {tab === "user" && (
          <div>
            <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#9CA3AF", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              User Prompt — injected per request with live variable substitution
            </p>
            <CodeBlock content={template.userPrompt} language="text" />
          </div>
        )}
        {tab === "sample" && (
          <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(400px, 1fr) minmax(400px, 1fr)", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#9CA3AF", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Sample Input
              </p>
              <CodeBlock content={template.sampleInput} />
            </div>
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#9CA3AF", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Expected Output
              </p>
              <CodeBlock content={template.sampleOutput} />
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function PromptTemplatesPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#F9FAFB",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "44px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#FEF3C7", color: "#B45309",
            borderRadius: "8px", padding: "6px 14px",
            fontSize: "12px", fontWeight: "600",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Sprint 1 · S1-10 · Prompt Engineering
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "34px", fontWeight: "800", color: "#111827", lineHeight: "1.2" }}>
            AI Prompt Templates
          </h1>
          <p style={{ margin: "0 0 20px", color: "#6B7280", fontSize: "15px", maxWidth: "620px", lineHeight: "1.6" }}>
            Three versioned prompt templates powering the AI automation layer of the Civic Service Request Tracker.
            Each template is used directly by n8n workflows in Sprint 2 and Sprint 3.
          </p>
          {/* Stats row */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Templates", value: "3" },
              { label: "Features Covered", value: "F2, F12, F15" },
              { label: "Version", value: "v1.0" },
              { label: "Author", value: "Dev 2 · Emily" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: "10px", padding: "10px 18px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{s.value}</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Template Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {templates.map(t => <TemplateCard key={t.id} template={t} />)}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: "40px", padding: "18px 24px",
          background: "#fff", border: "1px solid #E5E7EB",
          borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "12px",
        }}>
          <span style={{ fontSize: "18px" }}>📌</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#6B7280", lineHeight: "1.6" }}>
            <strong style={{ color: "#374151" }}>n8n Integration Note:</strong> In each workflow, substitute the{" "}
            <code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: "4px", fontSize: "12px" }}>{"{{variable}}"}</code>{" "}
            placeholders with the corresponding Supabase field values from the incoming webhook payload. All prompts expect JSON-only responses — ensure your n8n HTTP node parses the response body as JSON before writing back to Supabase.
          </p>
        </div>

        {/* Future Enhancements */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: "800", color: "#111827" }}>
              Future Prompt Enhancements
            </h2>
            <p style={{ margin: 0, color: "#6B7280", fontSize: "14px", lineHeight: "1.6", maxWidth: "620px" }}>
              Planned extensions to the AI automation layer, deferred to post-v1.0.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "24px 28px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                Duplicate Request Detection
              </h3>
              <span
                style={{
                  background: "#F3F4F6",
                  color: "#6B7280",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                F2 Extension
              </span>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#374151", lineHeight: "1.7" }}>
              Extend the triage workflow with a Supabase similarity check before confirming a new submission.
              If an open request with the same type and location already exists, surface it to the citizen
              and give them the option to link to the existing ticket rather than creating a duplicate.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Implementation Requirements
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "A new n8n workflow step querying Supabase for matching open tickets by request_type and location",
                  "A Lovable UI update to the submission confirmation screen showing matched tickets",
                  "A possible_duplicate_of UUID field added to the requests table in Supabase",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 14px",
                      background: "#FAFAFA",
                      borderRadius: "8px",
                      border: "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#F3F4F6",
                        color: "#6B7280",
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
                    <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#FEF3C7",
                color: "#B45309",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Deferred due to testing complexity and Sprint 2 timeline constraints
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", marginTop: "32px" }}>
          Authored by Dev 2 (Emily) · Sprint 1 · Civic Service Request Tracker
        </p>
      </div>
    </div>
  );
}
