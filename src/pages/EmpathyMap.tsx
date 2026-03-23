const EmpathyMap = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, "Segoe UI", sans-serif' }}>
      {/* SECTION 1 — PAGE HEADER */}
      <header className="py-10 px-6 text-white text-center" style={{ backgroundColor: '#1B6B5A' }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Staff Empathy Map</h1>
        <p className="text-sm italic opacity-90 max-w-2xl mx-auto">
          Government Staff User — Synthesized from Sandra (Service Officer) and Marcus (Field Operations Coordinator)
        </p>
        <p className="text-sm mt-1 opacity-80">S1-02 · Sprint 1 · Developer 3 (Connor)</p>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
        {/* SECTION 2 — PERSONA SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sandra */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: '#E8F4F0',
              borderLeft: '4px solid #1B6B5A',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: '#2D2D2D' }}>Sandra Chen</h2>
            <p className="text-sm mb-3" style={{ color: '#666666' }}>Primary Persona</p>
            <div className="text-sm space-y-1 mb-4" style={{ color: '#2D2D2D' }}>
              <p><span className="font-semibold">Role:</span> Senior Service Officer, Local Government Council</p>
              <p><span className="font-semibold">Experience:</span> 6 years in role</p>
              <p><span className="font-semibold">Tools:</span> Shared email inbox · Excel spreadsheet (400+ rows) · Phone · Council website CMS</p>
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#1B6B5A' }}>Goals</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: '#2D2D2D' }}>
              <li>Deliver good service outcomes for residents</li>
              <li>Reduce time spent on repetitive data entry</li>
              <li>Have clear visibility of where every job stands</li>
              <li>Be recognized as competent and responsive</li>
              <li>Spend more time on complex, human-facing work</li>
            </ul>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#C05A1F' }}>Frustrations</h3>
            <ul className="text-sm list-disc list-inside space-y-0.5" style={{ color: '#2D2D2D' }}>
              <li>Requests arrive with insufficient detail</li>
              <li>No automatic resident acknowledgments</li>
              <li>Loses visibility once a job is forwarded</li>
              <li>Spreadsheet tracking is error-prone and manual</li>
              <li>Communication failures make the team look incompetent even when work is done</li>
              <li>Overdue items must be spotted manually</li>
            </ul>
          </div>

          {/* Marcus */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: '#FDF0E8',
              borderLeft: '4px solid #C05A1F',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: '#2D2D2D' }}>Marcus</h2>
            <p className="text-sm mb-3" style={{ color: '#666666' }}>Secondary Persona</p>
            <div className="text-sm space-y-1 mb-4" style={{ color: '#2D2D2D' }}>
              <p><span className="font-semibold">Role:</span> Field Operations Coordinator, Local Government Council</p>
              <p><span className="font-semibold">Experience:</span> 2 years in coordination role (8 years as field technician)</p>
              <p><span className="font-semibold">Tools:</span> Email · WhatsApp (crew dispatch) · Personal Excel spreadsheet · Phone</p>
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#1B6B5A' }}>Goals</h3>
            <ul className="text-sm list-disc list-inside mb-4 space-y-0.5" style={{ color: '#2D2D2D' }}>
              <li>Set field crews up for success with complete job information</li>
              <li>Minimize rework and double-visits</li>
              <li>Have a single source of truth for all open jobs</li>
              <li>Reduce end-of-day admin backlog</li>
              <li>Return to field-facing, hands-on work</li>
            </ul>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#C05A1F' }}>Frustrations</h3>
            <ul className="text-sm list-disc list-inside space-y-0.5" style={{ color: '#2D2D2D' }}>
              <li>Incomplete job details cause crews to attend wrong locations</li>
              <li>No formal dispatch system — WhatsApp is used instead</li>
              <li>Three separate spreadsheets that do not sync with each other</li>
              <li>Completion updates fall through during busy periods</li>
              <li>Stopped raising improvement ideas after proposals went nowhere</li>
            </ul>
          </div>
        </div>

        {/* SECTION 3 — EMPATHY MAP (2x2 GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SAYS */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#E8F4F0', border: '1px solid #ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#1B6B5A' }}>SAYS</h3>
            <ul className="text-sm list-disc list-inside space-y-1.5" style={{ color: '#2D2D2D' }}>
              <li>"I spent forty minutes trying to work out exactly where it was."</li>
              <li>"The work was done but the resident had no idea — that reflects on me."</li>
              <li>"Automatic acknowledgments would cut my complaint calls in half."</li>
              <li>"We use WhatsApp for dispatch. There's no formal system."</li>
              <li>"I stopped raising improvement ideas — it felt like talking to a wall."</li>
              <li>"I feel like I'm managing paper rather than managing work."</li>
            </ul>
          </div>

          {/* THINKS */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#EAF2FB', border: '1px solid #ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#1B6B5A' }}>THINKS</h3>
            <ul className="text-sm list-disc list-inside space-y-1.5" style={{ color: '#2D2D2D' }}>
              <li>Wonders if residents understand what information staff actually need</li>
              <li>Believes the system makes the team look bad even when work is done right</li>
              <li>Doubts management will invest in better tools after past proposals failed</li>
              <li>Quietly aware that things fall through the gaps on busy days</li>
              <li>Suspects most rework could be prevented with better upfront information</li>
            </ul>
          </div>

          {/* DOES */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#FDF0E8', border: '1px solid #ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#1B6B5A' }}>DOES</h3>
            <ul className="text-sm list-disc list-inside space-y-1.5" style={{ color: '#2D2D2D' }}>
              <li>Checks shared inbox twice daily and manually logs requests to spreadsheet</li>
              <li>Assigns reference numbers by hand and forwards jobs via email</li>
              <li>Color-codes spreadsheet rows to flag overdue items</li>
              <li>Dispatches field crews via WhatsApp group messages</li>
              <li>Maintains a separate personal spreadsheet alongside the shared one</li>
              <li>Stays late to clear the admin backlog after busy days</li>
              <li>Cross-references maintenance logs to guess ambiguous job locations</li>
            </ul>
          </div>

          {/* FEELS */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#F3EEF8', border: '1px solid #ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#1B6B5A' }}>FEELS</h3>
            <ul className="text-sm list-disc list-inside space-y-1.5" style={{ color: '#2D2D2D' }}>
              <li>Helpless when a job has missing information and the resident won't pick up</li>
              <li>Demoralized when communication failures make good work invisible</li>
              <li>Responsible when crews arrive without enough information to do the job</li>
              <li>Drained by repetitive data entry that feels like it shouldn't need a human</li>
              <li>Deflated after raising improvement ideas that went nowhere</li>
              <li>Proud and energized when a complex job reaches resolution</li>
              <li>Satisfied when they can finally mark something as done</li>
            </ul>
          </div>
        </div>

        {/* SECTION 4 — KEY INSIGHTS */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#F5F5F5' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D2D2D' }}>Key Insights for Design</h2>
          <ol className="text-sm list-decimal list-inside space-y-3" style={{ color: '#2D2D2D' }}>
            <li>
              <span className="font-semibold">Automatic acknowledgments</span> are the single highest-impact change staff identified. The moment a request is received, an automated confirmation with a reference number should be sent to the citizen — removing a major source of complaint calls.
            </li>
            <li>
              <span className="font-semibold">Staff lose visibility</span> once a job is forwarded. The system must maintain a shared, real-time view of every ticket's status so no one needs to chase anyone for updates.
            </li>
            <li>
              <span className="font-semibold">Incomplete submissions</span> are the root cause of most rework. Structured submission forms with required fields (type, specific location, description) will reduce the time staff spend chasing residents for missing detail.
            </li>
            <li>
              <span className="font-semibold">Manual data entry</span> is a significant morale drain. The system should eliminate manual status updates, completion logging, and acknowledgment emails wherever possible.
            </li>
            <li>
              <span className="font-semibold">Staff feel pride</span> in their institutional knowledge and want tools that let them demonstrate competence — not ones that make them look bad through communication failures they cannot control.
            </li>
          </ol>
        </div>
      </div>

      {/* SECTION 5 — PAGE FOOTER */}
      <footer className="text-center text-sm py-6 px-6" style={{ backgroundColor: '#F5F5F5', borderTop: '1px solid #DDDDDD', color: '#666666' }}>
        <p>S1-02 — Staff Persona & Empathy Map</p>
        <p>Sprint 1 (March 23 – April 5, 2026) · Developer 3 (Connor) · Status: Complete</p>
        <p className="mt-2 max-w-2xl mx-auto" style={{ color: '#999999' }}>
          Synthesized from two simulated empathy interviews conducted in lieu of live user interviews. Content reflects realistic government staff workflows. To be referenced in Sprint 3 staff dashboard design decisions.
        </p>
      </footer>
    </div>
  );
};

export default EmpathyMap;
