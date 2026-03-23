import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { seedUserStories } from "@/integrations/supabase/seedStories";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";
type Sprint = "Sprint 1" | "Sprint 2" | "Sprint 3" | "Sprint 4";
type FilterKey = "all" | Sprint | Priority;

interface UserStory {
  id: string;
  story_id: string;
  feature: string;
  story: string;
  assignee: string;
  priority: Priority;
  sprint: Sprint;
  epic: string;
  story_points: number;
  is_done: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPRINTS: Sprint[] = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"];

const SPRINT_DATES: Record<Sprint, string> = {
  "Sprint 1": "Mar 23 – Apr 5",
  "Sprint 2": "Apr 6 – Apr 19",
  "Sprint 3": "Apr 20 – May 3",
  "Sprint 4": "May 4 – May 17",
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
  All:      "#6B7280",
};

const EPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "HCD Research & Personas":          { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Project Foundation":               { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Citizen Submission & File Upload":  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "AI Triage & Data Layer":           { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Analytics & Public Transparency":  { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Real-Time Status & Citizen Account":{ bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  "AI Automation & Notifications":    { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Staff Operations Dashboard":       { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "QA & Workflow Hardening":          { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "Demo & Close-out":                 { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

function epicColor(epic: string) {
  return EPIC_COLORS[epic] ?? { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SprintBoardPage() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<"sprint" | "epic">("sprint");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_stories")
      .select("*")
      .order("id");
    if (!error && data) setStories(data as UserStory[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  // ── Toggle done ────────────────────────────────────────────────────────────
  const toggle = async (id: string, current: boolean) => {
    // Optimistic UI
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_done: !current } : s))
    );
    await supabase.from("user_stories").update({ is_done: !current }).eq("id", id);
  };

  // ── Seed ───────────────────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const count = await seedUserStories();
      setSeedMsg(`✓ ${count} stories seeded`);
      await fetchStories();
    } catch (e: unknown) {
      setSeedMsg(`✗ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    setSeeding(false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total = stories.length;
  const done  = stories.filter((s) => s.is_done).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = stories.filter((s) => {
    if (filter === "all") return true;
    return s.sprint === filter || s.priority === filter;
  });

  // ── Group ──────────────────────────────────────────────────────────────────
  const groups: [string, UserStory[]][] =
    view === "sprint"
      ? SPRINTS.map((sp) => [sp, filtered.filter((s) => s.sprint === sp)])
      : Array.from(
          filtered.reduce((acc, s) => {
            (acc.get(s.epic) ?? acc.set(s.epic, []).get(s.epic)!).push(s);
            return acc;
          }, new Map<string, UserStory[]>())
        );

  // ─────────────────────────────────────────────────────────────────────────
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
            All user stories from the Capstone Development Roadmap across 4 sprints (Mar 23 – May 17, 2026). Checkbox state is persisted to Supabase.
          </p>
        </div>

        {/* Seed + stats bar */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "18px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Progress */}
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

          {/* Seed button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", borderLeft: "1px solid #F3F4F6", paddingLeft: "20px" }}>
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{ padding: "8px 16px", background: seeding ? "#E5E7EB" : "#4338CA", color: seeding ? "#9CA3AF" : "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: seeding ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {seeding ? "Seeding…" : total === 0 ? "Seed Stories from Roadmap" : "Re-seed Stories"}
            </button>
            {seedMsg && <span style={{ fontSize: "12px", color: seedMsg.startsWith("✓") ? "#16A34A" : "#DC2626", fontWeight: "600" }}>{seedMsg}</span>}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: "4px", background: "#E5E7EB", borderRadius: "8px", padding: "3px" }}>
            {(["sprint", "epic"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: view === v ? "#fff" : "transparent", color: view === v ? "#111827" : "#6B7280", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                By {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["all","High","Medium","Low","Sprint 1","Sprint 2","Sprint 3","Sprint 4"] as FilterKey[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 13px", borderRadius: "20px", border: `1px solid ${filter === f ? "#4338CA" : "#D1D5DB"}`, background: filter === f ? "#4338CA" : "#fff", color: filter === f ? "#fff" : "#6B7280", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF", fontSize: "14px" }}>
            Loading stories from Supabase…
          </div>
        )}

        {/* Empty state */}
        {!loading && total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#6B7280", fontSize: "15px", marginBottom: "16px" }}>No stories found. Click <strong>"Seed Stories from Roadmap"</strong> above to populate the board from the capstone document.</p>
          </div>
        )}

        {/* Story Groups */}
        {!loading && groups.map(([groupKey, groupStories]) => {
          if (groupStories.length === 0) return null;
          const groupDone = groupStories.filter((s) => s.is_done).length;
          const isSprint = view === "sprint";

          return (
            <div key={groupKey} style={{ marginBottom: "32px" }}>
              {/* Group header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", paddingBottom: "10px", borderBottom: "2px solid #E5E7EB" }}>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#111827" }}>{groupKey}</h2>
                {isSprint && (
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>
                    {SPRINT_DATES[groupKey as Sprint]}
                  </span>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "600", color: groupDone === groupStories.length && groupStories.length > 0 ? "#16A34A" : "#6B7280", background: groupDone === groupStories.length && groupStories.length > 0 ? "#F0FDF4" : "#F3F4F6", padding: "3px 10px", borderRadius: "20px" }}>
                  {groupDone} / {groupStories.length} done
                </span>
              </div>

              {/* Table card */}
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", padding: "0 16px" }}>
                  {["", "User Story", "Assignee", "Priority", "Sprint", "Pts", "Epic"].map((h, i) => (
                    <div key={i} style={{ padding: "10px 8px", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {groupStories.map((story, idx) => {
                  const pc  = PRIORITY_COLORS[story.priority] ?? PRIORITY_COLORS.Medium;
                  const ec  = epicColor(story.epic);
                  const ac  = ASSIGNEE_COLORS[story.assignee] || "#6B7280";
                  const done = story.is_done;

                  return (
                    <div
                      key={story.id}
                      onClick={() => toggle(story.id, done)}
                      style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 80px 90px 90px 180px", padding: "0 16px", borderBottom: idx < groupStories.length - 1 ? "1px solid #F3F4F6" : "none", background: done ? "#FAFFFE" : "#fff", cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = done ? "#FAFFFE" : "#fff"; }}
                    >
                      {/* Checkbox */}
                      <div style={{ display: "flex", alignItems: "center", padding: "14px 8px" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${done ? "#4338CA" : "#D1D5DB"}`, background: done ? "#4338CA" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Story text */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", background: "#F3F4F6", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>{story.story_id}</span>
                        <span style={{ fontSize: "13px", color: done ? "#9CA3AF" : "#1F2937", lineHeight: 1.5, textDecoration: done ? "line-through" : "none", transition: "color 0.15s" }}>{story.story}</span>
                      </div>

                      {/* Assignee */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: ac, color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {story.assignee === "All" ? "★" : story.assignee[0]}
                          </div>
                          <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{story.assignee}</span>
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
                        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "500" }}>{story.sprint.replace("Sprint ", "S")}</span>
                      </div>

                      {/* Story points */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F3F4F6", color: "#374151", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {story.story_points}
                        </div>
                      </div>

                      {/* Epic */}
                      <div style={{ padding: "14px 8px", display: "flex", alignItems: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", background: ec.bg, color: ec.text, border: `1px solid ${ec.border}`, padding: "3px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
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

        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", marginTop: "40px" }}>
          Sprint Board · Civic Service Request Tracker · Axle Pathway Capstone · {total} User Stories · Supabase-backed
        </p>
      </div>
    </div>
  );
}
