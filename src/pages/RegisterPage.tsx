import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) { setError("Full name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      setError(
        signUpError.message.includes("already registered")
          ? "An account with this email already exists."
          : signUpError.message
      );
      setSubmitting(false);
      return;
    }

    console.log("Signup successful:", signUpData);

    // If the trigger didn't create the profile, try manual insert as fallback
    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: signUpData.user.id,
          full_name: fullName,
          email: email,
          role: "citizen",
        }, { onConflict: "id" });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        // Don't block registration — the trigger may have already created the row
      }
    }

    navigate("/portal");
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
          <h1 className="text-2xl font-bold text-white">Citizen Connect</h1>
          <h2 className="text-lg font-semibold text-[hsl(var(--hero-muted))]">Create Your Account</h2>
          <p className="text-sm text-[hsl(var(--hero-muted))]">
            Report and track civic service requests in your community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[hsl(210_20%_80%)]">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="bg-[hsl(217_33%_17%)] text-white border-white/15 placeholder:text-white/40 focus-visible:ring-[hsl(var(--hero-cta))]"
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[hsl(210_20%_80%)]">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {submitting ? "Creating Account…" : "Create Account"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-sm text-[hsl(var(--hero-muted))]">
            Already have an account?{" "}
            <Link to="/citizen-login" className="text-[hsl(var(--hero-accent))] font-medium hover:underline">Sign in</Link>
          </p>
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
