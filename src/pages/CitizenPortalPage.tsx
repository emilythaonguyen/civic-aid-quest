import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, Brain, Eye } from "lucide-react";
import SubmitRequestForm from "@/components/SubmitRequestForm";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Submit Your Request",
    description: "Your report is logged and assigned a unique ID.",
  },
  {
    icon: Brain,
    title: "AI Triage",
    description: "Your request is automatically categorized and prioritized.",
  },
  {
    icon: Eye,
    title: "Track Your Status",
    description: "You will receive updates as your request moves through review.",
  },
];

export default function CitizenPortalPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Citizen Connect</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-10">
        {/* Welcome */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Your Citizen Portal</h2>
          <p className="text-muted-foreground">
            Report a non-emergency issue in your community. Fill out the form below and track your request status.
          </p>
        </section>

        {/* Submission Form */}
        <section>
          <SubmitRequestForm />
        </section>

        {/* What Happens Next */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center">What Happens Next</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center rounded-lg border border-border bg-card p-5 space-y-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </div>
                <step.icon className="h-6 w-6 text-primary" />
                <p className="font-medium text-foreground text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
