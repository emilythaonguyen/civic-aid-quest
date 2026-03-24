const stages = [
  { num: 1, name: "Discovery", bg: "#1B6B5A" },
  { num: 2, name: "Submission", bg: "#1A5276" },
  { num: 3, name: "Waiting", bg: "#B7770D" },
  { num: 4, name: "Follow-Up", bg: "#C05A1F" },
  { num: 5, name: "Resolution", bg: "#6C3483" },
  { num: 6, name: "Reflection", bg: "#1E8449" },
];

const emotionRow = ["Moderate", "Low", "Low", "Lowest", "Moderate", "Low"];
const emotionColors = ["#B7770D", "#C0392B", "#C0392B", "#C0392B", "#B7770D", "#C0392B"];
const painRow = ["Low", "High", "High", "Highest", "Medium", "Medium"];
const painColors = ["#1E8449", "#C0392B", "#C0392B", "#C0392B", "#B7770D", "#B7770D"];
const channelRow = [
  "Personal observation",
  "City phone / website / online form",
  "None — silence",
  "Phone / resubmission",
  "Word of mouth / observation",
  "Memory of past experience",
];

const stageCards = [
  {
    actor: "Citizen (Maria, Darnell, or Grace)",
    whatHappens: "Citizen notices a civic issue in their neighborhood — a pothole, a broken streetlight, an unsafe tree hanging over the road. They feel civic-minded and want to report it.",
    channel: "Personal observation",
    painPoints: [
      "No clear single entry point for reporting — unclear whether to call, email, or use a website",
    ],
    emotional: { emoji: "🤔", text: "Concerned and civic-minded — \"Someone should fix this.\" Citizen is engaged and wants to help their community." },
    designImplication: "The submission entry point must be immediately discoverable. A single, prominent \"Report an Issue\" button should be the clearest path on the city portal.",
  },
  {
    actor: "Citizen",
    whatHappens: "Tries to find how to report — calls a general city phone number, searches the city website, or fills out a long online form. It is unclear whether the form was even submitted.",
    channel: "City phone line, city website, online form",
    painPoints: [
      "No confirmation of receipt — form feels like a black hole",
      "Multiple channels with no clear single entry point",
      "Unclear whether the submission actually went through",
      "Long, confusing forms discourage completion",
    ],
    emotional: { emoji: "😟", text: "Confused and uncertain — the citizen cannot tell whether their report was received. The lack of any acknowledgment triggers immediate doubt." },
    designImplication: "F1 (submission form) must be short and mobile-friendly. F4 (automated notifications) must send an instant confirmation with a reference number the moment the form is submitted.",
  },
  {
    actor: "Citizen",
    whatHappens: "Waits with no updates. Wonders if the report was received. May attempt to self-solve (e.g., Darnell installs his own lighting outside his business) or give up entirely.",
    channel: "None — complete silence from the city",
    painPoints: [
      "Silence is the default — no status, no estimated timeline, no contact",
      "This is the biggest driver of distrust in the system",
      "Citizens begin to self-solve or disengage entirely",
      "No way to check status without calling back",
    ],
    emotional: { emoji: "😤", text: "Anxious, then resigned — the silence feels deliberate. Citizens interpret no news as no action. This is where most people begin to lose faith in the system." },
    designImplication: "F3 (status tracker) must provide real-time status visible to the citizen. Even one proactive update (\"Your request is in queue\") would dramatically reduce anxiety and prevent duplicate submissions.",
  },
  {
    actor: "Citizen",
    whatHappens: "Calls back or resubmits the form. Often reaches a different staff member with no record of the original report. Has to re-explain the issue from scratch. Duplicate tickets may be created without anyone noticing.",
    channel: "Phone callback, form resubmission",
    painPoints: [
      "Different staff member has no record of the original report",
      "Citizen must re-explain the issue from scratch",
      "Duplicate tickets created — no deduplication or notification",
      "Citizen effort feels completely wasted",
      "Trust in the system hits its lowest point",
    ],
    emotional: { emoji: "😠", text: "Frustrated and dismissed — this is the emotional low point of the entire journey. Citizens feel invisible and begin to believe the system is not designed to serve them." },
    designImplication: "F3 (status tracker) with a reference number eliminates the need to call back. F6 (Supabase data layer) must ensure every report is persisted and retrievable by any staff member.",
  },
  {
    actor: "Citizen",
    whatHappens: "The issue is eventually fixed. Citizen finds out through word of mouth, personal observation, or (rarely) a city notification. There is no official close-out communication in most cases.",
    channel: "Word of mouth, personal observation",
    painPoints: [
      "No official close-out notification in most cases",
      "Citizen discovers resolution accidentally, not proactively",
      "The process felt accidental — no sense of a system working",
    ],
    emotional: { emoji: "😐", text: "Relieved but not impressed — the problem is solved, but the experience felt disjointed. The lack of a closing notification means the city gets no credit for the work done." },
    designImplication: "F4 (automated notifications) must send a closure notification when a ticket is marked Resolved. F15 (satisfaction survey) should trigger at this moment to capture feedback.",
  },
  {
    actor: "Citizen",
    whatHappens: "Citizen decides whether they would bother to report an issue again in the future. Those with bad experiences (Maria, Grace) are unlikely to re-engage unless the process demonstrably improves.",
    channel: "Memory of past experience",
    painPoints: [
      "Citizens who had one bad experience stopped reporting entirely",
      "Skeptical about future reporting — will only re-engage if the process proves reliable",
      "The system rewards persistence and personal contacts over fairness",
    ],
    emotional: { emoji: "🤨", text: "Skeptical — \"Only if there's a better way to track it.\" Grace: \"If it actually followed through, I'd use it and tell my neighbors to use it too.\"" },
    designImplication: "The entire flow must be reliable enough to rebuild trust with citizens who have already disengaged. One confirmation and one status update would be enough to change the narrative.",
  },
];

const painSummary = [
  ["No confirmation of receipt — form feels like a black hole", "F1 submission form must generate a visible ticket number; F4 must send instant confirmation"],
  ["Silence during waiting — no status, no timeline, no contact", "F3 status tracker must provide real-time citizen-facing status updates"],
  ["Follow-up reaches a different staff member with no record", "F6 Supabase data layer must persist all reports; F3 reference number eliminates re-explanation"],
  ["Duplicate tickets created with no deduplication or notification", "F2 AI triage should detect potential duplicates before creating new tickets"],
  ["No official close-out notification when issue is resolved", "F4 must auto-send closure notification on status change to Resolved"],
  ["Citizens who had bad experiences stopped reporting entirely", "End-to-end reliability and transparency must rebuild trust with disengaged residents"],
  ["System rewards personal contacts over official channels", "Portal must be the single most reliable channel — more effective than calling a council rep"],
  ["Neighbors without digital literacy or language access are excluded", "Submission flow must be accessible, multilingual, and usable without technical skill"],
  ["Citizens self-solve while waiting (e.g., install own lighting)", "Proactive status updates must reassure citizens that action is being taken"],
  ["No resident feedback collected at any point", "F15 satisfaction survey must trigger automatically when a ticket is marked Resolved"],
];

const quotes = [
  "Just acknowledge that I exist — that's all I need.",
  "I called twice and the second person had no record of my report.",
  "Submitted, in queue, assigned, done. Four words. That's all I need to stop worrying about it.",
  "My customer told me it was fixed before the city did.",
  "If it actually followed through, I'd use it and tell my neighbors to use it too.",
  "The system should work for everyone, not just people who know the back channels.",
];

const CitizenJourneyMap = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* HEADER */}
      <header className="py-10 px-6 text-white text-center" style={{ backgroundColor: '#1B6B5A' }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Citizen Journey Map</h1>
        <p className="text-base italic opacity-90">Citizen User · Discovery → Submission → Waiting → Follow-Up → Resolution → Reflection</p>
        <p className="text-sm mt-1 opacity-80">S1-03 · Sprint 1 · Developer 1 (Eli)</p>
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
                  <td className="p-3 font-semibold" style={{ color: '#2D2D2D', border: '1px solid #ddd', backgroundColor: '#F9F9F9' }}>Channel used</td>
                  {channelRow.map((val, i) => (
                    <td key={i} className="p-3 text-center" style={{ color: '#2D2D2D', border: '1px solid #ddd' }}>{val}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg p-4 text-sm" style={{ backgroundColor: '#EAFAF1', color: '#1E8449', border: '1px solid #A9DFBF' }}>
            Stage 4 (Follow-Up) is the emotional low point — trust hits its lowest when citizens must re-explain their issue to a new staff member. Stage 1 (Discovery) is the engagement high — citizens are civic-minded and willing to help. The system must preserve that goodwill.
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
                    <div><span className="font-semibold">Channel used:</span> {card.channel}</div>

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
                      <span className="font-semibold" style={{ color: '#1E8449' }}>Design implication:</span>
                      <p className="mt-1" style={{ color: '#1E8449' }}>{card.designImplication}</p>
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
                  <th className="p-3 text-left text-white font-semibold" style={{ backgroundColor: '#1B6B5A', border: '1px solid #ddd' }}>Design Implication</th>
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
        <p>S1-03 — Citizen Journey Map (Discovery → Reflection)</p>
        <p>Sprint 1 (March 23 – April 5, 2026) · Developer 1 (Eli) · Status: Complete</p>
        <p className="mt-2 max-w-2xl mx-auto" style={{ color: '#999999' }}>
          Based on insights from three citizen empathy interviews conducted for S1-01. Identifies pain points and design opportunities across the full service request lifecycle.
        </p>
      </footer>
    </div>
  );
};

export default CitizenJourneyMap;
