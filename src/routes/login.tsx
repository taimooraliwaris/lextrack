import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LexMonogram } from "@/components/brand/lex-monogram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SLS CMS" },
      { name: "description", content: "Sign in to the Soomro Law Services portal." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

const FAIL_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fails, setFails] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockSecondsLeft = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setLoading(true);
    setError(null);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      toast.success("Password reset email sent");
      setMode("signin");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const nextFails = fails + 1;
      setFails(nextFails);
      if (nextFails >= FAIL_LIMIT) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError("Too many failed attempts. Try again in 15 minutes.");
      } else {
        setError(error.message);
      }
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[var(--gradient-brand)] p-12">
        <div className="text-center text-white">
          <LexMonogram size={96} className="mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold tracking-tight">LexTrack Platform</h1>
          <p className="mt-3 text-white/80">Soomro Law Services © 2026 · Confidential</p>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-center">
            <LexMonogram size={64} />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="font-display text-2xl font-bold">
              {mode === "signin" ? "Sign in to LexTrack" : "Reset password"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Soomro Law Services Portal"
                : "Enter your email to receive a reset link"}
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {mode === "signin" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isLocked && (
              <p className="text-sm text-muted-foreground">
                Locked. Try again in {lockSecondsLeft}s
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || isLocked}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign In"
                  : "Send Reset Link"}
            </Button>
          </form>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "forgot" : "signin")}
          >
            {mode === "signin" ? "Forgot password?" : "Back to sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
