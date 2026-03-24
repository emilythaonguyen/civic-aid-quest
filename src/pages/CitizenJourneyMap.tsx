const stages = [
  {
    num: 1,
    name: "Discovery",
    bg: "#1D4ED8",
    action: "Citizen notices a civic issue (pothole, broken streetlight, unsafe tree hanging over the road).",
    emotion: 'Concerned and civic-minded. "Someone should fix this."',
    arcPosition: "NEUTRAL",
    arcValue: 50,
    tag: null,
    note: "Citizen is engaged and wants to help their community.",
  },
  {
    num: 2,
    name: "Submission",
    bg: "#7C3AED",
    action: "Tries to find how to report — calls a general city phone number, searches the city website, or fills out a long online form.",
    emotion: "Confused and uncertain. Unclear whether the form was even submitted.",
    arcPosition: "LOW",
    arcValue: 20,
    tag: { type: "pain", text: "No confirmation of receipt. Form feels like a black hole. Multiple channels with no clear single entry point." },
    note: null,
  },
  {
    num: 3,
    name: "Waiting",
    bg: "#C2410C",
    action: 'Waits with no updates. Wonders if the report was received. May attempt to self-solve (e.g., puts up a battery light outside the business) or give up entirely.',
    emotion: "Anxious, then resigned.",
    arcPosition: "LOW",
    arcValue: 18,
    tag: { type: "pain", text: "Silence is the default. No status, no estimated timeline, no contact. This is the biggest driver of distrust in the system." },
    note: null,
  },
  {
    num: 4,
    name: "Follow-Up Attempt",
    bg: "#DC2626",
    action: "Calls back or resubmits the form. Often reaches a different staff member with no record of the original report. Has to re-explain the issue from scratch.",
    emotion: "Frustrated and dismissed.",
    arcPosition: "LOWEST",
    arcValue: 8,
    tag: { type: "pain", text: "Duplicate tickets created. Citizen effort feels completely wasted. Trust in the system hits its lowest point." },
    note: null,
  },
  {
    num: 5,
    name: "Resolution",
    bg: "#059669",
    action: "The issue is eventually fixed. Citizen finds out through word of mouth, personal observation, or (rarely) a city notification.",
    emotion: "Relieved but not impressed.",
    arcPosition: "MEDIUM",
    arcValue: 50,
    tag: { type: "mixed", text: "Problem is solved, but the process felt accidental. No official close-out notification in most cases." },
    note: null,
  },
  {
    num: 6,
    name: "Reflection",
    bg: "#6B7280",
    action: "Citizen decides whether they would bother to report an issue again in the future.",
    emotion: '"Skeptical. "Only if there\'s a better way to track it."',
    arcPosition: "LOW-MEDIUM",
    arcValue: 35,
    tag: { type: "opportunity", text: 'If the citizen had received one confirmation and one status update, trust would have been fully rebuilt. Grace\'s quote: "If it actually followed through, I\'d use it and tell my neighbors to use it too."' },
    note: null,
  },
];

const designImplications = [
  {
    title: "Immediate Confirmation is Non-Negotiable",
    text: "Every submission must generate a visible ticket number and a confirmation message. Directly addresses the Stage 2 and Stage 4 pain points. Citizens need proof their report exists.",
  },
  {
    title: "Status Transparency Builds Trust",
    text: 'Even one proactive status update (e.g., "Your request is in queue") would dramatically improve the Stage 3 and Stage 5 experience. Darnell\'s quote: "Submitted, in queue, assigned, done. Four words. That\'s all I need to stop worrying about it."',
  },
  {
    title: "Equity Must Be Designed In",
    text: "The current system rewards citizens who have personal contacts and know the back channels. The portal must be the simplest, most reliable channel available — not a last resort. Grace's insight: her neighbor, a non-English speaker, simply lives with problems because she doesn't know where to report them.",
  },
];

function tagStyle(type: string) {
  if (type === "pain") return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: "Pain Point" };
  if (type === "mixed") return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", label: "Mixed" };
  return { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", label: "Opportunity" };
}

const CitizenJourneyMap = () => {
  // SVG emotional arc
  const width = 900;
  const arcHeight = 100;
  const points = stages.map((s, i) => ({
    x: (i / (stages.length - 1)) * (width - 60) + 30,
    y: arcHeight - (s.arcValue / 100) * (arcHeight - 20) + 10,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header className="py-10 px-6 text-white text-center relative" style={{ backgroundColor: "#1B6B5A" }}>
        <div className="absolute top-4 right-6 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded">
          S1-03
        </div>
        <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Internal — HCD Research</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Citizen Journey Map — Report to Resolution</h1>
        <p className="text-sm opacity-90">Civic Service Request Tracker | S1-03 | Developer: Eli</p>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
        {/* Timeline */}
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(170px, 1fr))` }}>
            {stages.map((s) => {
              const ts = s.tag ? tagStyle(s.tag.type) : null;
              return (
                <div
                  key={s.num}
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  {/* Stage header */}
                  <div className="text-white text-center py-3 px-2" style={{ backgroundColor: s.bg }}>
                    <span className="text-xs font-semibold opacity-80">Stage {s.num}</span>
                    <h3 className="text-sm font-bold mt-0.5">{s.name}</h3>
                  </div>

                  <div className="p-3 space-y-3 bg-white">
                    {/* Action */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#9CA3AF" }}>Action</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{s.action}</p>
                    </div>

                    {/* Emotion */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#9CA3AF" }}>Emotion</p>
                      <p className="text-xs italic leading-relaxed" style={{ color: "#6B7280" }}>{s.emotion}</p>
                    </div>

                    {/* Tag */}
                    {ts && s.tag && (
                      <div
                        className="rounded p-2"
                        style={{ backgroundColor: ts.bg, border: `1px solid ${ts.border}` }}
                      >
                        <span className="text-[10px] font-bold uppercase" style={{ color: ts.text }}>{ts.label}</span>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: ts.text }}>{s.tag.text}</p>
                      </div>
                    )}

                    {s.note && (
                      <p className="text-xs italic" style={{ color: "#9CA3AF" }}>{s.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotional Arc */}
        <div className="rounded-lg p-6" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "#374151" }}>Emotional Arc</h3>
          <svg viewBox={`0 0 ${width} ${arcHeight + 20}`} className="w-full" style={{ maxHeight: "140px" }}>
            {/* Grid lines */}
            <line x1="30" y1={arcHeight + 10} x2={width - 30} y2={arcHeight + 10} stroke="#E5E7EB" strokeWidth="1" />
            <line x1="30" y1="10" x2={width - 30} y2="10" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
            <line x1="30" y1={(arcHeight + 20) / 2} x2={width - 30} y2={(arcHeight + 20) / 2} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />

            {/* Labels */}
            <text x="5" y="15" fontSize="9" fill="#9CA3AF">High</text>
            <text x="5" y={(arcHeight + 20) / 2 + 3} fontSize="9" fill="#9CA3AF">Mid</text>
            <text x="5" y={arcHeight + 13} fontSize="9" fill="#9CA3AF">Low</text>

            {/* Arc line */}
            <path d={pathD} fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#1D4ED8" />
                <text x={p.x} y={arcHeight + 25} textAnchor="middle" fontSize="8" fill="#6B7280">
                  {stages[i].name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Design Implications */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: "#111827" }}>Design Implications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {designImplications.map((card) => (
              <div
                key={card.title}
                className="rounded-lg p-5"
                style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <h4 className="text-sm font-bold mb-2" style={{ color: "#1D4ED8" }}>{card.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center text-sm py-6 px-6"
        style={{ backgroundColor: "#F5F5F5", borderTop: "1px solid #DDDDDD", color: "#666666" }}
      >
        <p>S1-03 — Citizen Journey Map (Report → Resolution)</p>
        <p>Sprint 1 (March 23 – April 5, 2026) · Developer 1 (Eli) · Status: Complete</p>
        <p className="mt-2 max-w-2xl mx-auto" style={{ color: "#999999" }}>
          Based on insights from three citizen empathy interviews conducted for S1-01. Identifies pain points and design opportunities across the full service request lifecycle.
        </p>
      </footer>
    </div>
  );
};

export default CitizenJourneyMap;
