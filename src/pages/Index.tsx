import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, Building2, MapPin, Bell } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Submit Requests",
    desc: "Report potholes, streetlights, and more",
  },
  {
    icon: MapPin,
    title: "Track in Real Time",
    desc: "See live status updates on your report",
  },
  {
    icon: Bell,
    title: "Get Notified",
    desc: "Automatic updates when your issue is resolved",
  },
] as const;

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 overflow-hidden bg-[hsl(var(--hero-bg))]">
        {/* Geometric grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
            Civic Aid App
          </h1>
          <p className="text-xl font-semibold text-[hsl(var(--hero-accent))]">
            Axle County
          </p>
          <p className="text-[hsl(var(--hero-muted))] text-base">
            Report issues. Track progress. Get results.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 rounded-lg bg-[hsl(var(--hero-cta))] text-white hover:bg-[hsl(224_76%_55%)] transition-colors text-base px-8"
              onClick={() => navigate("/citizen-login")}
            >
              <User className="h-4 w-4" />
              Citizen Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2 rounded-lg border-white/60 text-white hover:bg-white/10 transition-colors text-base px-8 bg-transparent"
              onClick={() => navigate("/staff-login")}
            >
              <ShieldCheck className="h-4 w-4" />
              Staff Login
            </Button>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-[hsl(220_45%_16%)] border-t border-white/10 px-6 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--hero-accent))]/15">
                <f.icon className="h-5 w-5 text-[hsl(var(--hero-accent))]" />
              </div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-[hsl(var(--hero-muted))]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(220_45%_13%)] px-6 py-5 text-center">
        <p className="text-xs text-[hsl(var(--hero-muted))]">
          Axle County Government · Civic Service Portal
        </p>
      </footer>
    </div>
  );
};

export default Index;
