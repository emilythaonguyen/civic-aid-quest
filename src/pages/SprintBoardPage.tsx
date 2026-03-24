import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";

interface Epic {
  id: string;
  epic_id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  test_plan: string;
  definition_of_done: string;
  sprint_id: string;
}

interface UserStory {
  id: string;
  story_id: string;
  title: string;
  user_story_text: string;
  description: string;
  acceptance_criteria_text: string;
  test_plan_text: string;
  definition_of_done: string;
  assignee_id: string | null;
  priority: Priority;
  sprint_id: string;
  epic_id: string;
  story_points: number;
  status: string;
  story_type: string;
  completed_at: string | null;
}

interface Developer {
  id: string;
  name: string;
  color: string;
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

const SPRINT_MAP: Record<string, { label: string; short: string; dates: string }> = {
  "50000000-0000-0000-0000-000000000001": { label: "Sprint 1", short: "S1", dates: "Mar 23 – Apr 5" },
  "50000000-0000-0000-0000-000000000002": { label: "Sprint 2", short: "S2", dates: "Apr 6 – Apr 19" },
  "50000000-0000-0000-0000-000000000003": { label: "Sprint 3", short: "S3", dates: "Apr 20 – May 3" },
  "50000000-0000-0000-0000-000000000004": { label: "Sprint 4", short: "S4", dates: "May 4 – May 17" },
};

const SPRINT_ORDER = [
  "50000000-0000-0000-0000-000000000001",
  "50000000-0000-0000-0000-000000000002",
  "50000000-0000-0000-0000-000000000003",
  "50000000-0000-0000-0000-000000000004",
];

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; dot: string }> = {
  High:   { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  Low:    { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
};

const EPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "EP-01": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "EP-02": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "EP-03": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "EP-04": { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "EP-05": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "EP-06": { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  "EP-07": { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "EP-08": { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "EP-09": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "EP-10": { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "EP-11": { bg: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  "EP-12": { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

function epicColor(epicId: string) {
  return EPIC_COLORS[epicId] ?? { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
}

function assigneeInfo(id: string | null, devMap: Map<string, Developer>) {
  if (!id) return { name: "All", color: "#6B7280" };
  const dev = devMap.get(id);
  return dev ? { name: dev.name, color: dev.color } : { name: "Unknown", color: "#6B7280" };
}

function sprintLabel(id: string) {
  return SPRINT_MAP[id]?.label ?? "Unknown";
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailSection({ label, content }: { label: string; content: string | null }) {
  if (!content) return null;
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>{content}</div>
    </div>
  );
}

function StoryDetail({ story, epic }: { story: UserStory; epic?: Epic }) {
  return (
    <div style={{ padding: "20px 24px", background: "#F9FAFB", borderTop: "1px solid #E5E7EB" }}>
      <DetailSection label="Title" content={story.title} />
      <DetailSection label="Description" content={story.description} />
      <DetailSection label="Acceptance Criteria" content={story.acceptance_criteria_text} />
      <DetailSection label="Test Plan" content={story.test_plan_text} />
      <DetailSection label="Definition of Done" content={story.definition_of_done} />
      {story.completed_at && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#16A34A", fontWeight: "600" }}>
          ✓ Completed on {new Date(story.completed_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function EpicDetail({ epic }: { epic: Epic }) {
  return (
    <div style={{ padding: "20px 24px", background: "#FAFAFE", borderRadius: "0 0 12px 12px", borderTop: "1px dashed #D1D5DB" }}>
      <div style={{ fontSize: "13px", fontWeight: "700", color: "#4338CA", marginBottom: "12px" }}>Epic: {epic.title}</div>
      <DetailSection label="Description" content={epic.description} />
      <DetailSection label="Acceptance Criteria" content={epic.acceptance_criteria} />
      <DetailSection label="Test Plan" content={epic.test_plan} />
      <DetailSection label="Definition of Done" content={epic.definition_of_done} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SprintBoardPage() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sprintFilter, setSprintFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [view, setView] = useState<"sprint" | "epic">("sprint");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [storiesRes, epicsRes, devsRes] = await Promise.all([
      supabase.from("user_stories").select("*").order("story_id"),
      supabase.from("epics").select("*").order("epic_id"),
      supabase.from("developers").select("*").order("name"),
    ]);
    if (storiesRes.data) setStories(storiesRes.data as UserStory[]);
    if (epicsRes.data) setEpics(epicsRes.data as Epic[]);
    if (devsRes.data) setDevelopers(devsRes.data as Developer[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Toggle done status
  const toggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Done" ? "Planned" : "Done";
    const completedAt = newStatus === "Done" ? new Date().toISOString() : null;
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus, completed_at: completedAt } : s))
    );
    await supabase.from("user_stories").update({ status: newStatus, completed_at: completedAt }).eq("id", id);
  };

  // Stats
  const total = stories.length;
  const done = stories.filter((s) => s.status === "Done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Filter
  const filtered = stories.filter((s) => {
    if (sprintFilter !== "all" && s.sprint_id !== sprintFilter) return false;
    if (priorityFilter !== "all" && s.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && s.assignee_id !== assigneeFilter) return false;
    return true;
  });

  // Lookups
  const epicMap = new Map(epics.map((e) => [e.id, e]));
  const devMap = new Map(developers.map((d) => [d.id, d]));

  // Group
  const groups: { key: string; label: string; subtitle?: string; stories: UserStory[] }[] =
    view === "sprint"
      ? SPRINT_ORDER.map((sid) => ({
          key: sid,
          label: SPRINT_MAP[sid].label,
          subtitle: SPRINT_MAP[sid].dates,
          stories: filtered.filter((s) => s.sprint_id === sid),
        }))
      : epics.map((e) => ({
          key: e.id,
          label: `${e.epic_id}: ${e.title}`,
          stories: filtered.filter((s) => s.epic_id === e.id),
        }));

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "40px 24px 64px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#EEF2FF", color: "#4338CA", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
            F8 · Agile Sprint Board · Supabase
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "34px", fontWeight: "800", color: "#111827", lineHeight: 1.2 }}>
            User Story Backlog
          </h1>
          <p style={{ margin: 0, color: "#6B7280", fontSize: "15px", maxWidth: "640px", lineHeight: 1.6 }}>
            All user stories from the Capstone Development Roadmap across 4 sprints (Mar 23 – May 17, 2026). Click any story or epic header to expand details.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "18px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Overall Progress</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#4338CA" }}>{done} / {total} stories</span>
            </div>
            <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4338CA,#7C3AED)", borderRadius: "9999px", transition: "width 0.3s" }} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#4338CA", minWidth: "52px", textAlign: "right" }}>{pct}%</div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "4px", background: "#E5E7EB", borderRadius: "8px", padding: "3px" }}>
            {(["sprint", "epic"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: view === v ? "#fff" : "transparent", color: view === v ? "#111827" : "#6B7280", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                By {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Assignee */}
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Assignees</option>
              {developers.map((dev) => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>

            {/* Priority */}
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sprint */}
            <select value={sprintFilter} onChange={(e) => setSprintFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Sprints</option>
              {SPRINT_ORDER.map((sid) => (
                <option key={sid} value={sid}>{SPRINT_MAP[sid].label} ({SPRINT_MAP[sid].dates})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF", fontSize: "14px" }}>
            Loading stories from Supabase…
          </div>
        )}

        {/* Empty */}
        {!loading && total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#6B7280", fontSize: "15px" }}>No stories found in the database.</p>
          </div>
        )}

        {/* Groups */}
        {!loading && groups.map(({ key, label, subtitle, stories: groupStories }) => {
          if (groupStories.length === 0) return null;
          const groupDone = groupStories.filter((s) => s.status === "Done").length;
          const isEpicView = view === "epic";
          const epicForGroup = isEpicView ? epicMap.get(key) : undefined;
          const isEpicExpanded = expandedEpic === key;

          return (
            <div key={key} style={{ marginBottom: "32px" }}>
              {/* Group header */}
              <div
                onClick={() => isEpicView && setExpandedEpic(isEpicExpanded ? null : key)}
                style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", paddingBottom: "10px", borderBottom: "2px solid #E5E7EB", cursor: isEpicView ? "pointer" : "default" }}
              >
                {isEpicView && (
                  <span style={{ fontSize: "14px", color: "#9CA3AF", transition: "transform 0.15s", transform: isEpicExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                )}
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#111827" }}>{label}</h2>
                {subtitle && (
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>{subtitle}</span>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "600", color: groupDone === groupStories.length && groupStories.length > 0 ? "#16A34A" : "#6B7280", background: groupDone === groupStories.length && groupStories.length > 0 ? "#F0FDF4" : "#F3F4F6", padding: "3px 10px", borderRadius: "20px" }}>
                  {groupDone} / {groupStories.length} done
                </span>
              </div>

              {/* Epic detail expand */}
              {isEpicView && isEpicExpanded && epicForGroup && (
                <EpicDetail epic={epicForGroup} />
              )}

              {/* Table */}
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "0 16px" }}>
                  {["", "User Story", "Assignee", "Priority", "Sprint", "Pts", "Epic"].map((h, i) => (
                    <div key={i} style={{ padding: "10px 8px", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>

                {groupStories.map((story, idx) => {
                  const pc = PRIORITY_COLORS[story.priority] ?? PRIORITY_COLORS.Medium;
                  const epic = epicMap.get(story.epic_id);
                  const ec = epicColor(epic?.epic_id ?? "");
                  const ai = assigneeInfo(story.assignee_id, devMap);
                  const isDone = story.status === "Done";
                  const isExpanded = expandedStory === story.id;

                  return (
                    <div key={story.id}>
                      <div
                        style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px", padding: "0 16px", borderBottom: idx < groupStories.length - 1 || isExpanded ? "1px solid #F3F4F6" : "none", background: isDone ? "#FAFFFE" : "#fff", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={(e) => { if (!isDone) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isDone ? "#FAFFFE" : "#fff"; }}
                      >
                        {/* Checkbox */}
                        <div style={{ display: "flex", alignItems: "center", padding: "14px 8px" }} onClick={(e) => { e.stopPropagation(); toggle(story.id, story.status); }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${isDone ? "#4338CA" : "#D1D5DB"}`, background: isDone ? "#4338CA" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            {isDone && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Story text */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center", gap: "8px" }} onClick={() => setExpandedStory(isExpanded ? null : story.id)}>
                          <span style={{ fontSize: "14px", color: isExpanded ? "#4338CA" : "#9CA3AF", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}>▶</span>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", background: "#F3F4F6", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>{story.story_id}</span>
                          <span style={{ fontSize: "13px", color: isDone ? "#9CA3AF" : "#1F2937", lineHeight: 1.5, textDecoration: isDone ? "line-through" : "none", transition: "color 0.15s" }}>{story.user_story_text}</span>
                        </div>

                        {/* Assignee */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: ai.color, color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {ai.name === "All" ? "★" : ai.name[0]}
                            </div>
                            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{ai.name}</span>
                          </div>
                        </div>

                        {/* Priority */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: pc.bg, color: pc.text, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pc.dot }} />
                            {story.priority}
                          </div>
                        </div>

                        {/* Sprint */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500" }}>{SPRINT_MAP[story.sprint_id]?.short ?? "?"}</span>
                        </div>

                        {/* Points */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F3F4F6", color: "#374151", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {story.story_points}
                          </div>
                        </div>

                        {/* Epic */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", background: ec.bg, color: ec.text, border: `1px solid ${ec.border}`, padding: "3px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                            {epic?.title ?? "Unknown"}
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && <StoryDetail story={story} epic={epic} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", marginTop: "40px" }}>
          Sprint Board · Civic Service Request Tracker · Axle Pathway Capstone · {total} User Stories · Supabase-backed
        </p>
      </div>
    </div>
  );
}
