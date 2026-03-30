import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      const msg = signInError.message;
      if (msg.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox for a confirmation link.");
      } else if (msg.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg);
      }
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "staff" && profile?.role !== "manager") {
        await supabase.auth.signOut();
        setError("This login is for staff and managers only. Please use the Citizen Login page.");
        setSubmitting(false);
        return;
      }

      navigate("/analytics");
    } else {
      navigate("/analytics");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[hsl(var(--hero-bg))] px-4">
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-white">Staff Connect</h1>
          <h2 className="text-lg font-semibold text-[hsl(var(--hero-muted))]">Sign In</h2>
          <p className="text-sm text-[hsl(var(--hero-muted))]">
            Welcome back. Sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[hsl(210_20%_80%)]">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-[hsl(217_33%_17%)] text-white border-white/15 placeholder:text-white/40 focus-visible:ring-[hsl(var(--hero-cta))]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[hsl(210_20%_80%)]">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-[hsl(217_33%_17%)] text-white border-white/15 placeholder:text-white/40 focus-visible:ring-[hsl(var(--hero-cta))]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 font-medium">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full rounded-lg bg-[hsl(var(--hero-cta))] text-white hover:bg-[hsl(224_76%_55%)] transition-colors"
            disabled={submitting}
          >
            {submitting ? "Signing In…" : "Sign In"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-6">
          <Button
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 bg-transparent transition-colors"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
