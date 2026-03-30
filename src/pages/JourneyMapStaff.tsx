import HcdDropdown from "@/components/HcdDropdown";

const stages = [
  { num: 1, name: "Receive", bg: "#1B6B5A" },
  { num: 2, name: "Triage", bg: "#1A5276" },
  { num: 3, name: "Assign", bg: "#B7770D" },
  { num: 4, name: "Act", bg: "#C05A1F" },
  { num: 5, name: "Comment/Update", bg: "#6C3483" },
  { num: 6, name: "Close", bg: "#1E8449" },
];

const emotionRow = ["Low", "Low", "Moderate", "Low", "Moderate", "High"];
const emotionColors = ["#C0392B", "#C0392B", "#B7770D", "#C0392B", "#B7770D", "#1E8449"];
const painRow = ["High", "High", "Medium", "High", "Low", "Low"];
const painColors = ["#C0392B", "#C0392B", "#B7770D", "#C0392B", "#1E8449", "#1E8449"];
const toolRow = [
  "Email / inbox",
  "Spreadsheet + guesswork",
  "WhatsApp",
  "WhatsApp + personal spreadsheet",
  "Manual email + spreadsheet",
  "Spreadsheet update",
];

const stageCards = [
  {
    actor: "Sandra (Service Officer)",
    whatHappens: "A new service request arrives via the shared email inbox. Sandra checks the inbox twice daily — morning and after lunch. She reads the email, assesses whether it has enough detail to act on, and decides next steps.",
    tools: "Shared email inbox",
    painPoints: [
      "No structured intake — requests arrive as free-text emails with no required fields",
      "Requests frequently missing key details (exact location, photo, contact info)",
      "Inbox is shared — risk of two officers picking up the same request",
      "No automatic acknowledgment sent to the resident at this stage",
    ],
    emotional: { emoji: "😟", text: "Anxious and uncertain — she can't tell from the subject line whether the request is actionable or will require significant chasing." },
    sprint3: "F1 (submission form) must enforce required fields. F4 (automated notifications) must send an instant acknowledgment the moment a request is submitted, before Sandra even opens it.",
  },
  {
    actor: "Sandra (Service Officer)",
    whatHappens: "Sandra reads the full request and determines: (a) what type of issue it is, (b) which team is responsible, and (c) whether there is enough information to act. If information is missing, she attempts to call or email the resident. She manually assigns a reference number and logs the request into the shared spreadsheet.",
    tools: "Shared spreadsheet (400+ rows), phone, email",
    painPoints: [
      "Categorization is entirely manual and relies on Sandra's institutional knowledge",
      "Ambiguous requests require guesswork or asking colleagues",
      "If the resident can't be reached, the request stalls",
      "Manual reference number assignment is error-prone",
      "Spreadsheet has no auto-classification or priority flagging",
    ],
    emotional: { emoji: "😤", text: "Frustrated — this stage consumes significant time for something that feels like it could be automated. She's good at it, but resents that the system forces her to carry all the knowledge in her head." },
    sprint3: "F2 (AI triage) must auto-classify request type and priority before Sandra sees it. F5 (staff dashboard) must show pre-classified type so Sandra only needs to confirm or override, not start from scratch.",
  },
  {
    actor: "Sandra → Marcus (Field Operations Coordinator)",
    whatHappens: "Sandra forwards the classified request to the relevant team coordinator (Marcus for field jobs). She sends an email with the reference number and details. Marcus receives it, checks crew availability in his personal spreadsheet, creates a work order manually, and sends the job to his crew via WhatsApp.",
    tools: "Email (Sandra), WhatsApp (Marcus), personal spreadsheet (Marcus)",
    painPoints: [
      "Handoff is via email — no formal assignment system",
      "Marcus maintains a separate spreadsheet from Sandra's — they can fall out of sync",
      "No visibility for Sandra of whether Marcus has picked up the job",
      "Crew dispatch via WhatsApp provides no audit trail",
      "If Marcus is busy, the assignment email can sit unread",
    ],
    emotional: { emoji: "😐", text: "Detached — Sandra loses visibility the moment she forwards the email. Marcus feels burdened by having to manually re-enter information he's already been sent." },
    sprint3: "F5 (staff dashboard) must include a ticket assignment flow so Sandra can assign directly to Marcus without email. F13 (workload view) must show Marcus's queue so Sandra can see whether he has capacity before assigning.",
  },
  {
    actor: "Marcus + Field Crew",
    whatHappens: "Marcus's crew attends the site and performs the work. Marcus monitors via WhatsApp — crew members message the group when they arrive and when the job is done. Marcus cross-references the outcome against his personal spreadsheet. On busy days, completion confirmations can be missed or delayed.",
    tools: "WhatsApp (crew comms), personal spreadsheet",
    painPoints: [
      "WhatsApp messages are easily missed on busy days",
      "No formal job completion record — outcome lives in chat history",
      "If a crew attends the wrong location, rework is required",
      "Marcus sometimes stays late to catch up on logging completions",
      "Sandra has no visibility that the job is being worked on",
    ],
    emotional: { emoji: "😓", text: "Stressed — Marcus is managing multiple crews simultaneously with no system to help him track parallel jobs. He feels responsible when crews encounter problems but has limited tools to proactively prevent them." },
    sprint3: "F5 (staff dashboard) must allow staff to update ticket status in real time from any device. F14 (internal comments) must replace WhatsApp for crew notes and updates.",
  },
  {
    actor: "Marcus → Sandra",
    whatHappens: "Once a job is complete, Marcus is supposed to notify Sandra so she can update the main spreadsheet and the ticket status. In practice this happens about 60% of the time. When it doesn't, Sandra has to chase Marcus — or discovers the job is done only when a resident calls to confirm.",
    tools: "Email, phone (ad hoc), shared spreadsheet",
    painPoints: [
      "Update handoff is informal and frequently falls through",
      "Sandra must manually update the spreadsheet after receiving Marcus's confirmation",
      "Residents sometimes call for a status update that Sandra can't give",
      "No internal notes system — context is scattered across emails and WhatsApp",
    ],
    emotional: { emoji: "😔", text: "Helpless — Sandra is dependent on Marcus remembering to loop her in. When he doesn't, she has no way to know a job is done until someone complains." },
    sprint3: "F14 (internal comment thread) must provide a structured, append-only notes field on each ticket visible only to staff, eliminating ad hoc updates. Status changes should auto-notify both parties.",
  },
  {
    actor: "Sandra",
    whatHappens: "Sandra marks the ticket as Resolved in the spreadsheet and sends a manual email to the resident confirming the job is done. This is her favorite part of the job — she feels genuine satisfaction when a complex case reaches resolution. On difficult jobs, this moment is meaningful.",
    tools: "Shared spreadsheet, email",
    painPoints: [
      "Closure email is manually written — no template or automation",
      "No structured resident feedback collection at close",
      "Marking as resolved in the spreadsheet doesn't notify any other system",
    ],
    emotional: { emoji: "😊", text: "Satisfied and proud — closing a job, especially a difficult one, is the emotional high of Sandra's day. This moment should be preserved by the system, not buried in admin." },
    sprint3: "F4 (automated notifications) must send a professional closure notification to the resident automatically on status change to Resolved. F15 (satisfaction survey) must trigger at this moment to capture resident feedback.",
  },
];

const painSummary = [
  ["Requests arrive with no required fields — key info routinely missing", "F1 submission form must enforce type, location, and description before submission is accepted"],
  ["No automatic acknowledgment sent to residents at point of receipt", "F4 automated notifications must fire immediately on record creation in Supabase"],
  ["Triage is entirely manual, relying on Sandra's institutional knowledge", "F2 AI triage must pre-classify type and priority so staff confirm rather than categorize from scratch"],
  ["Ambiguous request types cause misrouting and returned jobs", "F5 staff dashboard must show AI-suggested category with an override control"],
  ["Assignment handoff via email — no formal system, no confirmation", "F5 must include a direct ticket assignment feature replacing email forwarding"],
  ["Sandra has no visibility once a job is forwarded to Marcus", "F13 workload view must show live per-staff queue so Sandra can monitor progress"],
  ["Crew dispatch via WhatsApp — no audit trail, messages easily missed", "F14 internal comment thread must replace WhatsApp for all crew and staff communication"],
  ["Completion updates fall through 40% of the time on busy days", "F5 status update must be one tap from any device; auto-notification fires to Sandra on change"],
  ["Manual closure email required for every resolved ticket", "F4 must auto-send a professional closure notification on status change to Resolved"],
  ["No resident feedback collected at closure", "F15 satisfaction survey must trigger automatically when a ticket is marked Resolved"],
];

const quotes = [
  "I spent probably forty minutes trying to work out exactly where it was. Called the person back, couldn't reach them.",
  "By the time a job gets to me it's been through at least one or two people. Sometimes the details were there originally and just didn't carry across.",
  "I've sent things to the wrong team and had them bounce back. That's embarrassing.",
  "I send them the details via a group chat. WhatsApp, actually. There's no formal dispatch system.",
  "Completion updates happen about sixty percent of the time. If it's a busy day, things fall through.",
  "Closing a job — that's satisfying. Especially the ones that were complicated.",
];

const JourneyMapStaff = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* HEADER */}
      <header className="py-10 px-6 text-white text-center" style={{ backgroundColor: '#1B6B5A' }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Staff Journey Map</h1>
        <p className="text-base italic opacity-90">Government Staff User · Receive → Triage → Assign → Act → Comment → Close</p>
        <p className="text-sm mt-1 opacity-80">S1-04 · Sprint 1 · Developer 3 (Connor)</p>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
        {/* SECTION 2 — EMOTIONAL ARC TABLE */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Emotional Arc at a Glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th className="p-3 text-left font-semibold" style={{ color: '#2D2D2D', backgroundColor: '#F5F5F5', border: '1px solid #ddd' }}></th>
                  {stages.map((s) => (
                    <th key={s.num} className="p-3 text-center text-white font-semibold" style={{ backgroundColor: s.bg, border: '1px solid #ddd' }}>
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 font-semibold" style={{ color: '#2D2D2D', border: '1px solid #ddd', backgroundColor: '#F9F9F9' }}>Emotion level</td>
                  {emotionRow.map((val, i) => (
                    <td key={i} className="p-3 text-center font-semibold" style={{ color: emotionColors[i], border: '1px solid #ddd' }}>{val}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold" style={{ color: '#2D2D2D', border: '1px solid #ddd', backgroundColor: '#F9F9F9' }}>Pain level</td>
                  {painRow.map((val, i) => (
                    <td key={i} className="p-3 text-center font-semibold" style={{ color: painColors[i], border: '1px solid #ddd' }}>{val}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold" style={{ color: '#2D2D2D', border: '1px solid #ddd', backgroundColor: '#F9F9F9' }}>Key tool today</td>
                  {toolRow.map((val, i) => (
                    <td key={i} className="p-3 text-center" style={{ color: '#2D2D2D', border: '1px solid #ddd' }}>{val}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg p-4 text-sm" style={{ backgroundColor: '#EAFAF1', color: '#1E8449', border: '1px solid #A9DFBF' }}>
            Stages 1–2 (Receive, Triage) and Stage 4 (Act) carry the highest pain. Stage 6 (Close) is the emotional high — the system should make it easier to reach this moment, not harder.
          </div>
        </div>

        {/* SECTION 3 — STAGE CARDS */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Stage-by-Stage Journey</h2>
          <div className="space-y-6">
            {stages.map((stage, i) => {
              const card = stageCards[i];
              return (
                <div key={stage.num} className="rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
                  <div className="px-5 py-3 text-white font-bold" style={{ backgroundColor: stage.bg }}>
                    Stage {stage.num}: {stage.name}
                  </div>
                  <div className="p-5 space-y-4 text-sm" style={{ color: '#2D2D2D' }}>
                    <div><span className="font-semibold">Actor:</span> {card.actor}</div>
                    <div><span className="font-semibold">What happens:</span> {card.whatHappens}</div>
                    <div><span className="font-semibold">Tools used:</span> {card.tools}</div>

                    <div className="rounded p-3" style={{ backgroundColor: '#FDEDEC' }}>
                      <span className="font-semibold" style={{ color: '#C0392B' }}>Pain points:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5" style={{ color: '#C0392B' }}>
                        {card.painPoints.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    </div>

                    <div className="rounded p-3" style={{ backgroundColor: '#F5EEF8' }}>
                      <span className="font-semibold" style={{ color: '#6C3483' }}>Emotional state:</span>
                      <p className="mt-1" style={{ color: '#6C3483' }}>{card.emotional.emoji} {card.emotional.text}</p>
                    </div>

                    <div className="rounded p-3" style={{ backgroundColor: '#EAFAF1' }}>
                      <span className="font-semibold" style={{ color: '#1E8449' }}>Sprint 3 impact:</span>
                      <p className="mt-1" style={{ color: '#1E8449' }}>{card.sprint3}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4 — PAIN POINT SUMMARY TABLE */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Pain Point Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left text-white font-semibold" style={{ backgroundColor: '#1B6B5A', border: '1px solid #ddd', width: 40 }}>#</th>
                  <th className="p-3 text-left text-white font-semibold" style={{ backgroundColor: '#1B6B5A', border: '1px solid #ddd' }}>Pain Point</th>
                  <th className="p-3 text-left text-white font-semibold" style={{ backgroundColor: '#1B6B5A', border: '1px solid #ddd' }}>Sprint 3 Feature Implication</th>
                </tr>
              </thead>
              <tbody>
                {painSummary.map(([pain, impl], i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold" style={{ border: '1px solid #ddd', color: '#2D2D2D' }}>{i + 1}</td>
                    <td className="p-3" style={{ backgroundColor: '#FDEDEC', border: '1px solid #ddd', color: '#2D2D2D' }}>{pain}</td>
                    <td className="p-3" style={{ backgroundColor: '#EAFAF1', border: '1px solid #ddd', color: '#2D2D2D' }}>{impl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5 — REPRESENTATIVE QUOTES */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Representative Quotes from the Journey</h2>
          <div className="space-y-4">
            {quotes.map((q, i) => (
              <blockquote key={i} className="pl-4 py-2 italic text-sm" style={{ borderLeft: '4px solid #C05A1F', color: '#2D2D2D', marginLeft: 16 }}>
                "{q}"
              </blockquote>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-sm py-6 px-6" style={{ backgroundColor: '#F5F5F5', borderTop: '1px solid #DDDDDD', color: '#666666' }}>
        <p>S1-04 — Staff Journey Map (Receive → Close)</p>
        <p>Sprint 1 (March 23 – April 5, 2026) · Developer 3 (Connor) · Status: Complete</p>
        <p className="mt-2 max-w-2xl mx-auto" style={{ color: '#999999' }}>
          Synthesized from S1-02 empathy interviews with Sandra (Service Officer) and Marcus (Field Operations Coordinator). To be referenced in Sprint 3 staff admin dashboard (F5) and workload view (F13) design decisions.
        </p>
      </footer>
    </div>
  );
};

export default JourneyMapStaff;
