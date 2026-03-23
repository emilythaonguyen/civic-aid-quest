import { supabase } from "./client";

export const USER_STORIES = [
  // ── SPRINT 1 ───────────────────────────────────────────────────────────────
  {
    id: "S1-01", sprint_id: "S1", story_id: "S1-01", feature: "EP-01",
    story: "As a project team, we want a documented citizen persona so that we design the submission flow around real user needs.",
    assignee: "Eli", priority: "High", sprint: "Sprint 1", epic: "HCD Research & Personas", story_points: 3, is_done: false,
  },
  {
    id: "S1-02", sprint_id: "S1", story_id: "S1-02", feature: "EP-01",
    story: "As a project team, we want a documented staff persona so that the admin dashboard matches real staff workflows.",
    assignee: "Connor", priority: "High", sprint: "Sprint 1", epic: "HCD Research & Personas", story_points: 3, is_done: false,
  },
  {
    id: "S1-03", sprint_id: "S1", story_id: "S1-03", feature: "EP-01",
    story: "As a project team, we want a citizen journey map so that we identify friction points across the full service request lifecycle.",
    assignee: "Eli", priority: "Medium", sprint: "Sprint 1", epic: "HCD Research & Personas", story_points: 3, is_done: false,
  },
  {
    id: "S1-04", sprint_id: "S1", story_id: "S1-04", feature: "EP-01",
    story: "As a project team, we want a staff journey map (receive → close ticket) so that we design the staff dashboard around real workflows.",
    assignee: "Connor", priority: "Medium", sprint: "Sprint 1", epic: "HCD Research & Personas", story_points: 3, is_done: false,
  },
  {
    id: "S1-05", sprint_id: "S1", story_id: "S1-05", feature: "EP-01",
    story: "As a project team, we want POV statements and HMW questions so that we frame design challenges clearly before building.",
    assignee: "Emily", priority: "Medium", sprint: "Sprint 1", epic: "HCD Research & Personas", story_points: 2, is_done: false,
  },
  {
    id: "S1-06", sprint_id: "S1", story_id: "S1-06", feature: "F6",
    story: "As a developer team, we want a fully defined Supabase schema so that all developers can build against a stable data contract from Sprint 2.",
    assignee: "Connor", priority: "High", sprint: "Sprint 1", epic: "Project Foundation", story_points: 5, is_done: false,
  },
  {
    id: "S1-07", sprint_id: "S1", story_id: "S1-07", feature: "F1",
    story: "As a developer team, we want a Lovable project shell with authentication so that all four developers can build on a shared foundation.",
    assignee: "Eli", priority: "High", sprint: "Sprint 1", epic: "Project Foundation", story_points: 5, is_done: false,
  },
  {
    id: "S1-08", sprint_id: "S1", story_id: "S1-08", feature: "F8",
    story: "As a project team, we want all 16 user stories written with acceptance criteria so that the sprint board is populated before Sprint 2 begins.",
    assignee: "Nicholas", priority: "High", sprint: "Sprint 1", epic: "Project Foundation", story_points: 5, is_done: false,
  },
  {
    id: "S1-09", sprint_id: "S1", story_id: "S1-09", feature: "F8",
    story: "As a project manager, I want the sprint board populated with all stories so that I can track progress across all four sprints.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 1", epic: "Project Foundation", story_points: 3, is_done: false,
  },
  {
    id: "S1-10", sprint_id: "S1", story_id: "S1-10", feature: "F2/F12/F15",
    story: "As a developer, I want prompt templates designed in Sprint 1 so that n8n workflows can be built immediately in Sprint 2.",
    assignee: "Emily", priority: "High", sprint: "Sprint 1", epic: "Project Foundation", story_points: 3, is_done: false,
  },
  {
    id: "S1-11", sprint_id: "S1", story_id: "S1-11", feature: "All",
    story: "As a project team, we want a Definition of Done per feature so that we know exactly when each item can be marked complete.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 1", epic: "Project Foundation", story_points: 2, is_done: false,
  },
  {
    id: "S1-12", sprint_id: "S1", story_id: "S1-12", feature: "Agile",
    story: "As a team, we want to run and document Sprint 1 Planning so that we have an Agile ceremony on record.",
    assignee: "All", priority: "Low", sprint: "Sprint 1", epic: "Project Foundation", story_points: 1, is_done: false,
  },

  // ── SPRINT 2 ───────────────────────────────────────────────────────────────
  {
    id: "S2-01", sprint_id: "S2", story_id: "S2-01", feature: "F1",
    story: "As a citizen, I want to submit a service request with type, location, and description so that the government is notified of the issue I'm reporting.",
    assignee: "Eli", priority: "High", sprint: "Sprint 2", epic: "Citizen Submission & File Upload", story_points: 5, is_done: false,
  },
  {
    id: "S2-02", sprint_id: "S2", story_id: "S2-02", feature: "F10",
    story: "As a citizen, I want to attach photos or documents to my request so that staff have visual evidence of the issue.",
    assignee: "Eli", priority: "High", sprint: "Sprint 2", epic: "Citizen Submission & File Upload", story_points: 5, is_done: false,
  },
  {
    id: "S2-03", sprint_id: "S2", story_id: "S2-03", feature: "F2",
    story: "As a staff member, I want new submissions automatically classified by type and priority so that I don't have to manually triage every ticket.",
    assignee: "Emily", priority: "High", sprint: "Sprint 2", epic: "AI Triage & Data Layer", story_points: 8, is_done: false,
  },
  {
    id: "S2-04", sprint_id: "S2", story_id: "S2-04", feature: "F6",
    story: "As a security-conscious team, we want row-level security and an append-only audit trail so that citizen data is protected and history is immutable.",
    assignee: "Connor", priority: "High", sprint: "Sprint 2", epic: "AI Triage & Data Layer", story_points: 8, is_done: false,
  },
  {
    id: "S2-05", sprint_id: "S2", story_id: "S2-05", feature: "F7",
    story: "As a staff manager, I want a chart view of request volume by category and average resolution time so that I can identify trends and resource gaps.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 2", epic: "Analytics & Public Transparency", story_points: 5, is_done: false,
  },
  {
    id: "S2-06", sprint_id: "S2", story_id: "S2-06", feature: "F16",
    story: "As a citizen, I want a public read-only page showing open vs resolved counts by category so that I can see how my government is performing without logging in.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 2", epic: "Analytics & Public Transparency", story_points: 5, is_done: false,
  },
  {
    id: "S2-07", sprint_id: "S2", story_id: "S2-07", feature: "F1/F2/F6",
    story: "As a developer team, we want the full submission pipeline wired together so that Sprint 2 delivers a working end-to-end flow.",
    assignee: "Emily", priority: "High", sprint: "Sprint 2", epic: "AI Triage & Data Layer", story_points: 5, is_done: false,
  },
  {
    id: "S2-08", sprint_id: "S2", story_id: "S2-08", feature: "HCD",
    story: "As a UX-conscious team, we want to test the submission prototype with a real user so that we validate the form before the full build.",
    assignee: "Eli", priority: "Medium", sprint: "Sprint 2", epic: "Analytics & Public Transparency", story_points: 3, is_done: false,
  },
  {
    id: "S2-09", sprint_id: "S2", story_id: "S2-09", feature: "Agile",
    story: "As a team, we want to run daily standups in Sprint 2 (Weeks 1 and 2) so that blockers are surfaced and resolved quickly.",
    assignee: "All", priority: "Low", sprint: "Sprint 2", epic: "Analytics & Public Transparency", story_points: 1, is_done: false,
  },
  {
    id: "S2-10", sprint_id: "S2", story_id: "S2-10", feature: "Agile",
    story: "As a team, we want to hold a Sprint 2 Review and demo to stakeholders so that we gather feedback before Sprint 3.",
    assignee: "All", priority: "Low", sprint: "Sprint 2", epic: "Analytics & Public Transparency", story_points: 1, is_done: false,
  },

  // ── SPRINT 3 ───────────────────────────────────────────────────────────────
  {
    id: "S3-01", sprint_id: "S3", story_id: "S3-01", feature: "F3",
    story: "As a citizen, I want to see the live status of my request (Open → In Review → Resolved) with timestamps so that I don't need to contact the office for updates.",
    assignee: "Eli", priority: "High", sprint: "Sprint 3", epic: "Real-Time Status & Citizen Account", story_points: 5, is_done: false,
  },
  {
    id: "S3-02", sprint_id: "S3", story_id: "S3-02", feature: "F9",
    story: "As a citizen, I want to register, log in, and view all my past and active requests so that I can manage my history in one place.",
    assignee: "Eli", priority: "High", sprint: "Sprint 3", epic: "Real-Time Status & Citizen Account", story_points: 5, is_done: false,
  },
  {
    id: "S3-03", sprint_id: "S3", story_id: "S3-03", feature: "F4",
    story: "As a citizen, I want to receive an email or SMS whenever my request status changes so that I'm kept informed without checking the portal.",
    assignee: "Emily", priority: "High", sprint: "Sprint 3", epic: "AI Automation & Notifications", story_points: 5, is_done: false,
  },
  {
    id: "S3-04", sprint_id: "S3", story_id: "S3-04", feature: "F11",
    story: "As a staff member, I want AI-generated resolution steps displayed when I open a ticket so that I can act faster on common request types.",
    assignee: "Emily", priority: "High", sprint: "Sprint 3", epic: "AI Automation & Notifications", story_points: 8, is_done: false,
  },
  {
    id: "S3-05", sprint_id: "S3", story_id: "S3-05", feature: "F5",
    story: "As a staff member, I want to view all tickets, filter by status/type/location, and update ticket status so that I can manage my workload efficiently.",
    assignee: "Connor", priority: "High", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 5, is_done: false,
  },
  {
    id: "S3-06", sprint_id: "S3", story_id: "S3-06", feature: "F13",
    story: "As a staff manager, I want to assign tickets to staff members and see each person's open count so that workload is distributed fairly.",
    assignee: "Connor", priority: "Medium", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 5, is_done: false,
  },
  {
    id: "S3-07", sprint_id: "S3", story_id: "S3-07", feature: "F12",
    story: "As a staff manager, I want tickets unresolved past the SLA threshold to auto-escalate to a supervisor so that breaches are caught before they worsen.",
    assignee: "Emily", priority: "High", sprint: "Sprint 3", epic: "AI Automation & Notifications", story_points: 5, is_done: false,
  },
  {
    id: "S3-08", sprint_id: "S3", story_id: "S3-08", feature: "F14",
    story: "As a staff member, I want to post internal notes on a ticket that are hidden from citizens so that I can communicate with colleagues in context.",
    assignee: "Connor", priority: "Medium", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 5, is_done: false,
  },
  {
    id: "S3-09", sprint_id: "S3", story_id: "S3-09", feature: "F15",
    story: "As a government portal owner, I want an AI-generated satisfaction survey to send automatically when a ticket is resolved so that I can gather quality feedback.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 5, is_done: false,
  },
  {
    id: "S3-10", sprint_id: "S3", story_id: "S3-10", feature: "HCD",
    story: "As a UX-conscious team, we want to test the staff dashboard with a representative user so that we validate the workflow before Sprint 4 polish.",
    assignee: "Connor", priority: "Medium", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 3, is_done: false,
  },
  {
    id: "S3-11", sprint_id: "S3", story_id: "S3-11", feature: "Agile",
    story: "As a team, we want to hold and document a Sprint 3 Review and Retrospective so that we gather stakeholder feedback and improve our process before Sprint 4.",
    assignee: "All", priority: "Medium", sprint: "Sprint 3", epic: "Staff Operations Dashboard", story_points: 2, is_done: false,
  },

  // ── SPRINT 4 ───────────────────────────────────────────────────────────────
  {
    id: "S4-01", sprint_id: "S4", story_id: "S4-01", feature: "All",
    story: "As a project team, we want all 16 features tested end-to-end so that we can confirm the application meets the Definition of Done before demo day.",
    assignee: "All", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 8, is_done: false,
  },
  {
    id: "S4-02", sprint_id: "S4", story_id: "S4-02", feature: "F1/F3/F5",
    story: "As a team, we want a UX polish and accessibility review so that the application meets WCAG AA and error states are handled gracefully.",
    assignee: "Eli", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 5, is_done: false,
  },
  {
    id: "S4-03", sprint_id: "S4", story_id: "S4-03", feature: "F2/F4/F12/F15",
    story: "As a developer, I want all n8n workflows to have fallback routes so that no workflow failure goes unnoticed or unhandled in production.",
    assignee: "Emily", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 5, is_done: false,
  },
  {
    id: "S4-04", sprint_id: "S4", story_id: "S4-04", feature: "F8",
    story: "As a developer, I want the Agile sprint board finalized and data cleaned up so that it accurately reflects all sprint outcomes.",
    assignee: "Nicholas", priority: "Medium", sprint: "Sprint 4", epic: "Demo & Close-out", story_points: 3, is_done: false,
  },
  {
    id: "S4-05", sprint_id: "S4", story_id: "S4-05", feature: "F16",
    story: "As a security reviewer, I want to verify that the public dashboard exposes zero PII so that citizen data is fully protected.",
    assignee: "Connor", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 3, is_done: false,
  },
  {
    id: "S4-06", sprint_id: "S4", story_id: "S4-06", feature: "F6",
    story: "As a security reviewer, I want to validate the append-only audit trail so that status_history integrity is confirmed before demo.",
    assignee: "Connor", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 3, is_done: false,
  },
  {
    id: "S4-07", sprint_id: "S4", story_id: "S4-07", feature: "F2",
    story: "As a team, we want to verify AI triage accuracy against the 80% threshold so that the KPI is met before demo.",
    assignee: "Emily", priority: "High", sprint: "Sprint 4", epic: "QA & Workflow Hardening", story_points: 3, is_done: false,
  },
  {
    id: "S4-08", sprint_id: "S4", story_id: "S4-08", feature: "Demo",
    story: "As a team, we want a demo script and 10-minute walkthrough prepared so that the stakeholder presentation is polished and rehearsed.",
    assignee: "Nicholas", priority: "High", sprint: "Sprint 4", epic: "Demo & Close-out", story_points: 3, is_done: false,
  },
  {
    id: "S4-09", sprint_id: "S4", story_id: "S4-09", feature: "Demo",
    story: "As a team, we want to practice the presentation in a full dry run so that every developer is confident on demo day.",
    assignee: "All", priority: "Medium", sprint: "Sprint 4", epic: "Demo & Close-out", story_points: 2, is_done: false,
  },
  {
    id: "S4-10", sprint_id: "S4", story_id: "S4-10", feature: "Agile",
    story: "As a team, we want to hold a Final Retrospective and self-assessment scoring so that we close the project with documented learnings.",
    assignee: "All", priority: "Medium", sprint: "Sprint 4", epic: "Demo & Close-out", story_points: 2, is_done: false,
  },
];

export async function seedUserStories() {
  const { error } = await supabase
    .from("user_stories")
    .upsert(USER_STORIES, { onConflict: "id" });
  if (error) throw error;
  return USER_STORIES.length;
}
