import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import StoryFormDialog from "@/components/StoryFormDialog";
import EpicFormDialog from "@/components/EpicFormDialog";
import SprintFormDialog from "@/components/SprintFormDialog";
import { Plus, Pencil } from "lucide-react";

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
  alias: string;
  full_name: string;
  color?: string;
}

interface SprintData {
  id: string;
  label: string;
  short: string;
  dates: string;
  sort_order: number;
}

// ─── Default sprints ─────────────────────────────────────────────────────────

const DEFAULT_SPRINTS: SprintData[] = [
  { id: "50000000-0000-0000-0000-000000000001", label: "Sprint 1", short: "S1", dates: "Mar 23 – Apr 5", sort_order: 1 },
  { id: "50000000-0000-0000-0000-000000000002", label: "Sprint 2", short: "S2", dates: "Apr 6 – Apr 19", sort_order: 2 },
  { id: "50000000-0000-0000-0000-000000000003", label: "Sprint 3", short: "S3", dates: "Apr 20 – May 3", sort_order: 3 },
  { id: "50000000-0000-0000-0000-000000000004", label: "Sprint 4", short: "S4", dates: "May 4 – May 17", sort_order: 4 },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

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

const DEV_COLORS: Record<string, string> = {
  "d1000000-0000-0000-0000-000000000001": "#2563EB",
  "d1000000-0000-0000-0000-000000000002": "#7C3AED",
  "d1000000-0000-0000-0000-000000000003": "#C2410C",
  "d1000000-0000-0000-0000-000000000004": "#059669",
};

function assigneeInfo(id: string | null, devMap: Map<string, Developer>) {
  if (!id) return { name: "All", color: "#6B7280" };
  const dev = devMap.get(id);
  return dev ? { name: dev.full_name, color: DEV_COLORS[id] ?? "#6B7280" } : { name: "Unknown", color: "#6B7280" };
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

function StoryDetail({ story }: { story: UserStory }) {
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
  const [sprints, setSprints] = useState<SprintData[]>(DEFAULT_SPRINTS);
  const [loading, setLoading] = useState(true);
  const [sprintFilter, setSprintFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [view, setView] = useState<"sprint" | "epic">("sprint");
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Dialog state
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [epicDialogOpen, setEpicDialogOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<SprintData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [storiesRes, epicsRes, devsRes] = await Promise.all([
      supabase.from("user_stories").select("*").order("story_id"),
      supabase.from("epics").select("*").order("epic_id"),
      supabase.from("developers").select("*").order("full_name"),
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

  // Sprint CRUD (local state - no DB table)
  const handleSprintSaved = (sprint: SprintData) => {
    setSprints((prev) => {
      const existing = prev.findIndex((s) => s.id === sprint.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = sprint;
        return updated.sort((a, b) => a.sort_order - b.sort_order);
      }
      return [...prev, sprint].sort((a, b) => a.sort_order - b.sort_order);
    });
  };

  // Build sprint map from state
  const sprintMap = new Map(sprints.map((s) => [s.id, s]));

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
      ? sprints.map((s) => ({
          key: s.id,
          label: s.label,
          subtitle: s.dates,
          stories: filtered.filter((st) => st.sprint_id === s.id),
        }))
      : epics.map((e) => ({
          key: e.id,
          label: `${e.epic_id}: ${e.title}`,
          stories: filtered.filter((st) => st.epic_id === e.id),
        }));

  // Helpers for opening dialogs
  const openAddStory = () => { setEditingStory(null); setStoryDialogOpen(true); };
  const openEditStory = (story: UserStory) => { setEditingStory(story); setStoryDialogOpen(true); };
  const openAddEpic = () => { setEditingEpic(null); setEpicDialogOpen(true); };
  const openEditEpic = (epic: Epic) => { setEditingEpic(epic); setEpicDialogOpen(true); };
  const openAddSprint = () => { setEditingSprint(null); setSprintDialogOpen(true); };
  const openEditSprint = (sprint: SprintData) => { setEditingSprint(sprint); setSprintDialogOpen(true); };

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
            All user stories from the Capstone Development Roadmap. Click any story or epic header to expand details.
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
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Assignees</option>
              {developers.map((dev) => (
                <option key={dev.id} value={dev.id}>{dev.full_name}</option>
              ))}
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select value={sprintFilter} onChange={(e) => setSprintFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "#fff", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", outline: "none" }}>
              <option value="all">All Sprints</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>{s.label} ({s.dates})</option>
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
          const sprintForGroup = !isEpicView ? sprintMap.get(key) : undefined;
          const isEpicExpanded = expandedEpic === key;

          return (
            <div key={key} style={{ marginBottom: "32px" }}>
              {/* Group header */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", paddingBottom: "10px", borderBottom: "2px solid #E5E7EB", cursor: isEpicView ? "pointer" : "default" }}
              >
                {isEpicView && (
                  <span onClick={() => setExpandedEpic(isEpicExpanded ? null : key)} style={{ fontSize: "14px", color: "#9CA3AF", transition: "transform 0.15s", transform: isEpicExpanded ? "rotate(90deg)" : "rotate(0deg)", cursor: "pointer" }}>▶</span>
                )}
                <h2 onClick={() => isEpicView && setExpandedEpic(isEpicExpanded ? null : key)} style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#111827", cursor: isEpicView ? "pointer" : "default" }}>{label}</h2>
                {subtitle && (
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>{subtitle}</span>
                )}

                {/* Edit button for group */}
                {isEpicView && epicForGroup && (
                  <button onClick={(e) => { e.stopPropagation(); openEditEpic(epicForGroup); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px" }} title="Edit epic">
                    <Pencil size={14} />
                  </button>
                )}
                {!isEpicView && sprintForGroup && (
                  <button onClick={() => openEditSprint(sprintForGroup)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px" }} title="Edit sprint">
                    <Pencil size={14} />
                  </button>
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
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px 40px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "0 16px" }}>
                  {["", "User Story", "Assignee", "Priority", "Sprint", "Pts", "Epic", ""].map((h, i) => (
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
                  const sp = sprintMap.get(story.sprint_id);

                  return (
                    <div key={story.id}>
                      <div
                        style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px 40px", padding: "0 16px", borderBottom: idx < groupStories.length - 1 || isExpanded ? "1px solid #F3F4F6" : "none", background: isDone ? "#FAFFFE" : "#fff", cursor: "pointer", transition: "background 0.1s" }}
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
                          <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500" }}>{sp?.short ?? "?"}</span>
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

                        {/* Edit button */}
                        <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                          <button onClick={(e) => { e.stopPropagation(); openEditStory(story); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }} title="Edit story">
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && <StoryDetail story={story} />}
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

      {/* FAB */}
      <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 50 }}>
        {fabOpen && (
          <>
            <div style={{ position: "fixed", inset: 0 }} onClick={() => setFabOpen(false)} />
            <div style={{ position: "absolute", bottom: "64px", right: 0, background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: "6px", minWidth: "160px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                { label: "User Story", action: openAddStory },
                { label: "Epic", action: openAddEpic },
                { label: "Sprint", action: openAddSprint },
              ].map((item) => (
                <button key={item.label} onClick={() => { item.action(); setFabOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#374151", width: "100%", textAlign: "left" }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <Plus size={16} style={{ color: "#4338CA" }} />
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen((o) => !o)}
          style={{
            width: "52px", height: "52px", borderRadius: "50%", border: "none",
            background: "#4338CA", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(67, 56, 202, 0.4)",
            opacity: fabOpen ? 1 : 0.35,
            transition: "opacity 0.2s, transform 0.2s",
            transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { if (!fabOpen) (e.currentTarget as HTMLButtonElement).style.opacity = "0.35"; }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Dialogs */}
      <StoryFormDialog
        open={storyDialogOpen}
        onOpenChange={setStoryDialogOpen}
        story={editingStory}
        sprints={sprints}
        epics={epics}
        developers={developers}
        onSaved={fetchData}
      />
      <EpicFormDialog
        open={epicDialogOpen}
        onOpenChange={setEpicDialogOpen}
        epic={editingEpic}
        sprints={sprints}
        onSaved={fetchData}
      />
      <SprintFormDialog
        open={sprintDialogOpen}
        onOpenChange={setSprintDialogOpen}
        sprint={editingSprint}
        onSaved={handleSprintSaved}
      />
    </div>
  );
}
