import { useState } from "react";

type Priority = "High" | "Medium" | "Low";
type Sprint = "Sprint 1" | "Sprint 2" | "Sprint 3" | "Sprint 4";
type Epic =
  | "Citizen Experience"
  | "Automation & AI"
  | "Staff Operations"
  | "Insights & Quality";

interface UserStory {
  id: string;
  feature: string;
  story: string;
  assignee: string;
  priority: Priority;
  sprint: Sprint;
  epic: Epic;
}

const stories: UserStory[] = [
  // Sprint 1 – Foundation
  {
    id: "F1-1",
    feature: "F1",
    story: "As a citizen, I want to submit a service request with location and category so that council can act on my issue.",
    assignee: "Eli",
    priority: "High",
    sprint: "Sprint 1",
    epic: "Citizen Experience",
  },
  {
    id: "F6-1",
    feature: "F6",
    story: "As a developer, I want the Supabase schema (tables, RLS, audit trail) established so that all features have a consistent data layer.",
    assignee: "Connor",
    priority: "High",
    sprint: "Sprint 1",
    epic: "Staff Operations",
  },
  {
    id: "F8-1",
    feature: "F8",
    story: "As a team, I want an agile sprint board tracking all features so that we can manage our velocity and backlog.",
    assignee: "Nicholas",
    priority: "Medium",
    sprint: "Sprint 1",
    epic: "Insights & Quality",
  },

  // Sprint 2 – Core Build
  {
    id: "F1-2",
    feature: "F1",
    story: "As a citizen, I want to attach photos to my submission so that staff have visual evidence of the issue.",
    assignee: "Eli",
    priority: "Medium",
    sprint: "Sprint 2",
    epic: "Citizen Experience",
  },
  {
    id: "F2-1",
    feature: "F2",
    story: "As a staff member, I want incoming requests auto-triaged by category and urgency so that priority jobs surface immediately.",
    assignee: "Emily",
    priority: "High",
    sprint: "Sprint 2",
    epic: "Automation & AI",
  },
  {
    id: "F3-1",
    feature: "F3",
    story: "As a citizen, I want to track my request status in real-time so that I know whether my issue is being addressed.",
    assignee: "Eli",
    priority: "High",
    sprint: "Sprint 2",
    epic: "Citizen Experience",
  },
  {
    id: "F5-1",
    feature: "F5",
    story: "As a staff member, I want a dashboard showing all open requests with status so that I can manage my queue efficiently.",
    assignee: "Connor",
    priority: "High",
    sprint: "Sprint 2",
    epic: "Staff Operations",
  },
  {
    id: "F6-2",
    feature: "F6",
    story: "As a developer, I want RLS policies enforcing that citizens only see their own data so that privacy is maintained.",
    assignee: "Connor",
    priority: "High",
    sprint: "Sprint 2",
    epic: "Staff Operations",
  },
  {
    id: "F7-1",
    feature: "F7",
    story: "As a manager, I want an analytics overview of request volume and resolution times so that I can identify bottlenecks.",
    assignee: "Nicholas",
    priority: "Medium",
    sprint: "Sprint 2",
    epic: "Insights & Quality",
  },
  {
    id: "F16-1",
    feature: "F16",
    story: "As a member of the public, I want to see aggregated service request stats without PII so that council transparency is maintained.",
    assignee: "Nicholas",
    priority: "Medium",
    sprint: "Sprint 2",
    epic: "Insights & Quality",
  },
  {
    id: "F10-1",
    feature: "F10",
    story: "As a citizen, I want to upload file attachments with my request so that I can provide supporting documents.",
    assignee: "Eli",
    priority: "Medium",
    sprint: "Sprint 2",
    epic: "Citizen Experience",
  },

  // Sprint 3 – Staff / AI / Citizen+
  {
    id: "F4-1",
    feature: "F4",
    story: "As a citizen, I want automated email/SMS notifications when my request status changes so that I don't need to check manually.",
    assignee: "Emily",
    priority: "High",
    sprint: "Sprint 3",
    epic: "Automation & AI",
  },
  {
    id: "F9-1",
    feature: "F9",
    story: "As a citizen, I want a personal account showing my full request history so that I can reference past submissions.",
    assignee: "Eli",
    priority: "Medium",
    sprint: "Sprint 3",
    epic: "Citizen Experience",
  },
  {
    id: "F11-1",
    feature: "F11",
    story: "As a staff member, I want AI-generated resolution suggestions on each request so that I can close jobs faster.",
    assignee: "Emily",
    priority: "High",
    sprint: "Sprint 3",
    epic: "Automation & AI",
  },
  {
    id: "F12-1",
    feature: "F12",
    story: "As a manager, I want requests exceeding 48 hours to be automatically escalated so that SLA breaches are caught early.",
    assignee: "Emily",
    priority: "High",
    sprint: "Sprint 3",
    epic: "Automation & AI",
  },
  {
    id: "F13-1",
    feature: "F13",
    story: "As a staff manager, I want to assign requests to team members and view workload distribution so that work is balanced.",
    assignee: "Connor",
    priority: "Medium",
    sprint: "Sprint 3",
    epic: "Staff Operations",
  },
  {
    id: "F14-1",
    feature: "F14",
    story: "As a staff member, I want an append-only internal comment thread on each request so that all context is preserved.",
    assignee: "Connor",
    priority: "Medium",
    sprint: "Sprint 3",
    epic: "Staff Operations",
  },
  {
    id: "F15-1",
    feature: "F15",
    story: "As a manager, I want a satisfaction survey sent post-resolution so that citizen feedback is captured automatically.",
    assignee: "Nicholas",
    priority: "Medium",
    sprint: "Sprint 3",
    epic: "Insights & Quality",
  },

  // Sprint 4 – Polish & Demo
  {
    id: "F1-3",
    feature: "F1",
    story: "As a citizen, I want the submission form to be WCAG AA accessible so that all users can interact with it equally.",
    assignee: "Eli",
    priority: "High",
    sprint: "Sprint 4",
    epic: "Citizen Experience",
  },
  {
    id: "F5-2",
    feature: "F5",
    story: "As a staff member, I want the dashboard to support role-based routing (citizen vs staff) so that the right UI is shown.",
    assignee: "Connor",
    priority: "High",
    sprint: "Sprint 4",
    epic: "Staff Operations",
  },
  {
    id: "F7-2",
    feature: "F7",
    story: "As a manager, I want charts showing AI triage accuracy ≥80% so that we can validate the AI model performance.",
    assignee: "Nicholas",
    priority: "Medium",
    sprint: "Sprint 4",
    epic: "Insights & Quality",
  },
  {
    id: "F2-2",
    feature: "F2",
    story: "As a developer, I want end-to-end error handling and QA hardening on all features so that the demo is stable.",
    assignee: "Emily",
    priority: "High",
    sprint: "Sprint 4",
    epic: "Automation & AI",
  },
];

const SPRINTS: Sprint[] = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"];

const SPRINT_DATES: Record<Sprint, string> = {
  "Sprint 1": "Mar 23 – Apr 5",
  "Sprint 2": "Apr 6 – Apr 19",
  "Sprint 3": "Apr 20 – May 3",
  "Sprint 4": "May 4 – May 17",
};

const EPIC_COLORS: Record<Epic, { bg: string; text: string; border: string }> = {
  "Citizen Experience": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Automation & AI":    { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Staff Operations":   { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Insights & Quality": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; dot: string }> = {
  High:   { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  Low:    { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
};

const ASSIGNEE_COLORS: Record<string, string> = {
  Eli:      "#2563EB",
  Emily:    "#7C3AED",
  Connor:   "#C2410C",
  Nicholas: "#059669",
};

type FilterKey = "all" | Sprint | Epic | Priority;

export default function SprintBoardPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<"sprint" | "epic">("sprint");

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = stories.filter((s) => {
    if (filter === "all") return true;
    return s.sprint === filter || s.epic === filter || s.priority === filter;
  });

  const groups: Record<string, UserStory[]> =
    view === "sprint"
      ? SPRINTS.reduce((acc, sp) => {
          acc[sp] = filtered.filter((s) => s.sprint === sp);
          return acc;
        }, {} as Record<string, UserStory[]>)
      : (["Citizen Experience", "Automation & AI", "Staff Operations", "Insights & Quality"] as Epic[]).reduce(
          (acc, ep) => {
            acc[ep] = filtered.filter((s) => s.epic === ep);
            return acc;
          },
          {} as Record<string, UserStory[]>
        );

  const total = stories.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: "40px 24px 64px",
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#EEF2FF",
              color: "#4338CA",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Agile · Sprint Board · F8
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "34px", fontWeight: "800", color: "#111827", lineHeight: 1.2 }}>
            User Story Backlog
          </h1>
          <p style={{ margin: 0, color: "#6B7280", fontSize: "15px", maxWidth: "600px", lineHeight: 1.6 }}>
            All user stories across 4 sprints (Mar 23 – May 17, 2026). Check off stories as they are completed.
          </p>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Overall Progress</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#4338CA" }}>{done} / {total} stories</span>
            </div>
            <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "9999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #4338CA, #7C3AED)",
                  borderRadius: "9999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#4338CA", minWidth: "56px", textAlign: "right" }}>
            {pct}%
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* View toggle */}
          <div style={{ display: "flex", gap: "4px", background: "#E5E7EB", borderRadius: "8px", padding: "3px" }}>
            {(["sprint", "epic"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  background: view === v ? "#fff" : "transparent",
                  color: view === v ? "#111827" : "#6B7280",
                  boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                By {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["all", "High", "Medium", "Low", "Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"] as FilterKey[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 13px",
                    borderRadius: "20px",
                    border: `1px solid ${filter === f ? "#4338CA" : "#D1D5DB"}`,
                    background: filter === f ? "#4338CA" : "#fff",
                    color: filter === f ? "#fff" : "#6B7280",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {f === "all" ? "All" : f}
                </button>
              )
            )}
          </div>
        </div>

        {/* Story Groups */}
        {Object.entries(groups).map(([groupKey, groupStories]) => {
          if (groupStories.length === 0) return null;
          const isSprintView = view === "sprint";
          const groupDone = groupStories.filter((s) => checked.has(s.id)).length;
          const epicColor = !isSprintView ? EPIC_COLORS[groupKey as Epic] : null;

          return (
            <div key={groupKey} style={{ marginBottom: "32px" }}>
              {/* Group header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #E5E7EB",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>{groupKey}</h2>
                {isSprintView && (
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>
                    {SPRINT_DATES[groupKey as Sprint]}
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: groupDone === groupStories.length ? "#16A34A" : "#6B7280",
                    background: groupDone === groupStories.length ? "#F0FDF4" : "#F3F4F6",
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {groupDone} / {groupStories.length} done
                </span>
              </div>

              {/* Table */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  overflow: "hidden",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 110px 80px 100px 160px",
                    gap: "0",
                    background: "#F9FAFB",
                    borderBottom: "1px solid #E5E7EB",
                    padding: "0 16px",
                  }}
                >
                  {["", "User Story", "Assignee", "Priority", "Sprint", "Epic"].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {groupStories.map((story, idx) => {
                  const isChecked = checked.has(story.id);
                  const pc = PRIORITY_COLORS[story.priority];
                  const ec = EPIC_COLORS[story.epic];
                  const ac = ASSIGNEE_COLORS[story.assignee] || "#6B7280";

                  return (
                    <div
                      key={story.id}
                      onClick={() => toggle(story.id)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr 110px 80px 100px 160px",
                        gap: "0",
                        padding: "0 16px",
                        borderBottom: idx < groupStories.length - 1 ? "1px solid #F3F4F6" : "none",
                        background: isChecked ? "#FAFFFE" : "#fff",
                        cursor: "pointer",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = isChecked ? "#FAFFFE" : "#fff";
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{ display: "flex", alignItems: "center", padding: "14px 8px" }}>
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "5px",
                            border: `2px solid ${isChecked ? "#4338CA" : "#D1D5DB"}`,
                            background: isChecked ? "#4338CA" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* User Story */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#9CA3AF",
                            background: "#F3F4F6",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            flexShrink: 0,
                          }}
                        >
                          {story.id}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: isChecked ? "#9CA3AF" : "#1F2937",
                            lineHeight: 1.5,
                            textDecoration: isChecked ? "line-through" : "none",
                            transition: "color 0.15s",
                          }}
                        >
                          {story.story}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              background: ac,
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {story.assignee[0]}
                          </div>
                          <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{story.assignee}</span>
                        </div>
                      </div>

                      {/* Priority */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: pc.bg,
                            color: pc.text,
                            padding: "3px 9px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pc.dot }} />
                          {story.priority}
                        </div>
                      </div>

                      {/* Sprint */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500" }}>{story.sprint}</span>
                      </div>

                      {/* Epic */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: ec.bg,
                            color: ec.text,
                            border: `1px solid ${ec.border}`,
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {story.epic}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", marginTop: "40px" }}>
          Sprint Board · Civic Service Request Tracker · Axle Pathway Capstone · 4 Sprints · {total} User Stories
        </p>
      </div>
    </div>
  );
}
