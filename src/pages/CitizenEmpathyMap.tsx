const quadrants = [
  {
    label: "SAYS",
    description: "Direct quotes from interviews",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    items: [
      '"I called twice and the second person had no record of my report."',
      '"Just acknowledge that I exist — that\'s all I need."',
      '"Four words: submitted, in queue, assigned, done."',
      '"My customer told me it was fixed before the city did."',
      '"The system should work for everyone, not just people who know the back channels."',
    ],
  },
  {
    label: "THINKS",
    description: "What they believe but don't say aloud",
    color: "#6D28D9",
    bg: "#F5F3FF",
    items: [
      '"Is anyone actually working on this or did it get lost?"',
      '"I must be doing something wrong — maybe the form didn\'t submit."',
      '"Only people who know the right people get results."',
      '"I shouldn\'t have to follow up. I did my part."',
      '"If it doesn\'t work this time, I won\'t bother again."',
    ],
  },
  {
    label: "DOES",
    description: "Observable behaviors and workarounds",
    color: "#C2410C",
    bg: "#FFF7ED",
    items: [
      "Calls the city line multiple times; gets different answers each time",
      "Resubmits the same form because there is no confirmation it was received",
      "Routes requests through personal contacts (council rep) instead of official channels",
      "Self-solves while waiting (e.g., installs own lighting outside business)",
      "Gives up and assumes someone else will eventually report the issue",
    ],
  },
  {
    label: "FEELS",
    description: "Emotional states",
    color: "#BE123C",
    bg: "#FFF1F2",
    items: [
      "Invisible — like their report disappeared into a void",
      "Frustrated by inconsistency between city staff responses",
      "Uncertain — no way to know if action is being taken",
      "Hopeful that a simple tracking system could change everything",
      "Concerned about neighbors without digital literacy or language access being left behind",
    ],
  },
];

const CitizenEmpathyMap = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header className="py-10 px-6 text-white text-center relative" style={{ backgroundColor: "#1D4ED8" }}>
        <div className="absolute top-4 right-6 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded">
          S1-01
        </div>
        <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Internal — HCD Research</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Citizen Empathy Map</h1>
        <p className="text-sm opacity-90 max-w-2xl mx-auto">
          Civic Service Request Tracker
        </p>
        <p className="text-sm italic opacity-80 mt-1">
          Synthesized from 3 citizen interviews — S1-01 | Developer: Eli
        </p>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
        {/* 2x2 Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quadrants.map((q) => (
            <div
              key={q.label}
              className="rounded-lg p-6"
              style={{
                backgroundColor: q.bg,
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <h3 className="text-lg font-bold mb-1" style={{ color: q.color }}>
                {q.label}
              </h3>
              <p className="text-xs italic mb-3" style={{ color: "#6B7280" }}>
                {q.description}
              </p>
              <ul className="text-sm list-disc list-inside space-y-1.5" style={{ color: "#2D2D2D" }}>
                {q.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Persona Snapshot */}
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>
            Persona Snapshot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Representative Users */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#6B7280" }}>
                Representative Users
              </h4>
              <ul className="text-sm space-y-1" style={{ color: "#374151" }}>
                <li><span className="font-semibold">Maria</span> (54, retired school administrator)</li>
                <li><span className="font-semibold">Darnell</span> (31, small business owner)</li>
                <li><span className="font-semibold">Grace</span> (67, long-term resident, 34 years in the community)</li>
              </ul>
            </div>

            {/* Primary Goal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#6B7280" }}>
                Primary Goal
              </h4>
              <p className="text-sm" style={{ color: "#374151" }}>
                Submit a civic issue report and receive transparent confirmation and status updates without needing to follow up manually.
              </p>
            </div>

            {/* Core Frustration */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#6B7280" }}>
                Core Frustration
              </h4>
              <p className="text-sm" style={{ color: "#374151" }}>
                No acknowledgment of receipt, no tracking, no closure. The system rewards persistence over fairness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center text-sm py-6 px-6"
        style={{ backgroundColor: "#F5F5F5", borderTop: "1px solid #DDDDDD", color: "#666666" }}
      >
        <p>S1-01 — Citizen Persona & Empathy Map</p>
        <p>Sprint 1 (March 23 – April 5, 2026) · Developer 1 (Eli) · Status: Complete</p>
        <p className="mt-2 max-w-2xl mx-auto" style={{ color: "#999999" }}>
          Synthesized from three citizen empathy interviews. Content reflects real community perspectives on civic service request processes.
        </p>
      </footer>
    </div>
  );
};

export default CitizenEmpathyMap;
