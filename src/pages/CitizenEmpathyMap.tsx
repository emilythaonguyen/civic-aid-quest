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
      <header className="py-10 px-6 text-white text-center relative" style={{ backgroundColor: "#1B6B5A" }}>
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
        {/* PERSONA SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Maria — Primary Persona */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "#EFF6FF",
              borderLeft: "4px solid #1D4ED8",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: "#2D2D2D" }}>Maria Santos</h2>
            <p className="text-sm mb-3" style={{ color: "#666666" }}>Primary Persona</p>
            <div className="text-sm space-y-1 mb-4" style={{ color: "#2D2D2D" }}>
              <p><span className="font-semibold">Role:</span> Retired School Administrator</p>
              <p><span className="font-semibold">Age:</span> 54</p>
              <p><span className="font-semibold">Tech Comfort:</span> Low — prefers phone calls over online forms</p>
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#1D4ED8" }}>Goals</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Report neighborhood issues without having to call multiple times</li>
              <li>Receive a simple confirmation that her report was received</li>
              <li>Trust that the city is taking action without needing to follow up</li>
            </ul>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#BE123C" }}>Frustrations</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Called the city twice; second rep had no record of her first report</li>
              <li>Feels invisible when reports disappear with no acknowledgment</li>
              <li>Believes the process assumes citizens don't know anything</li>
              <li>Gave up on reporting after her case number was lost</li>
            </ul>
            <p className="text-sm italic mt-2" style={{ color: "#1D4ED8" }}>
              "Just acknowledge that I exist — that's all I need."
            </p>
          </div>

          {/* Darnell — Secondary Persona */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "#F5F3FF",
              borderLeft: "4px solid #6D28D9",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: "#2D2D2D" }}>Darnell Washington</h2>
            <p className="text-sm mb-3" style={{ color: "#666666" }}>Secondary Persona</p>
            <div className="text-sm space-y-1 mb-4" style={{ color: "#2D2D2D" }}>
              <p><span className="font-semibold">Role:</span> Small Business Owner</p>
              <p><span className="font-semibold">Age:</span> 31</p>
              <p><span className="font-semibold">Tech Comfort:</span> High — uses apps daily, expects digital confirmation</p>
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#1D4ED8" }}>Goals</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Submit a report quickly and get a trackable ticket number</li>
              <li>Know the status without having to call or resubmit</li>
              <li>Stop having to manage city infrastructure problems himself while waiting</li>
            </ul>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#BE123C" }}>Frustrations</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Resubmitted the same form twice because there was no confirmation</li>
              <li>Found out his streetlight was fixed from a customer, not the city</li>
              <li>Duplicate tickets were created; no one told him</li>
              <li>Wasted time self-solving (installed own lighting) while waiting</li>
            </ul>
            <p className="text-sm italic mt-2" style={{ color: "#6D28D9" }}>
              "Submitted, in queue, assigned, done. Four words. That's all I need to stop worrying about it."
            </p>
          </div>

          {/* Grace — Supporting Persona */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "#FFF1F2",
              borderLeft: "4px solid #BE123C",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: "#2D2D2D" }}>Grace Okafor</h2>
            <p className="text-sm mb-3" style={{ color: "#666666" }}>Supporting Persona</p>
            <div className="text-sm space-y-1 mb-4" style={{ color: "#2D2D2D" }}>
              <p><span className="font-semibold">Role:</span> Retired, Long-Term Resident (34 years)</p>
              <p><span className="font-semibold">Age:</span> 67</p>
              <p><span className="font-semibold">Tech Comfort:</span> Medium — willing to use a good tool if it proves reliable</p>
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#1D4ED8" }}>Goals</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Report issues through an official channel that actually works</li>
              <li>Help neighbors (including non-English speakers) access the same system</li>
              <li>See the city follow through so trust can be rebuilt</li>
            </ul>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "#BE123C" }}>Frustrations</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: "#2D2D2D" }}>
              <li>Stopped using the general city number after a dangerous tree report went unanswered for weeks</li>
              <li>Routes all requests through her council rep — a workaround not available to everyone</li>
              <li>Worries that neighbors without connections or language skills are left out</li>
              <li>Won't recommend a tool unless it demonstrably follows through</li>
            </ul>
            <p className="text-sm italic mt-2" style={{ color: "#BE123C" }}>
              "If it actually followed through, I'd use it and tell my neighbors to use it too."
            </p>
          </div>
        </div>

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
