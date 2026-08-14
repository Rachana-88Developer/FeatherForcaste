import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bird, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Avicast" },
      {
        name: "description",
        content: "Sign in to Avicast to analyse bird recordings and keep a private climate log.",
      },
      { property: "og:title", content: "Sign in — Avicast" },
      { property: "og:description", content: "Access your bioacoustic climate field log." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const destination = search.redirect?.startsWith("/") ? search.redirect : "/studio";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destination, replace: true });
    });
  }, [navigate, destination]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${destination}`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setPendingConfirm(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        navigate({ to: destination, replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: destination, replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth?redirect=${encodeURIComponent(destination)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 surface-canopy md:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Bird className="size-5" />
          Avicast
        </Link>
        <div>
          <h2 className="max-w-sm text-3xl font-semibold leading-tight">
            Every dawn chorus is a <span className="text-dawn">weather report</span>.
          </h2>
          <p className="mt-4 max-w-sm text-sm opacity-80">
            Sign in to analyse recordings and build a private log of how your listening sites shift
            across seasons.
          </p>
        </div>
        <p className="text-xs opacity-60">Bioacoustic climate inference</p>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to reach your studio and field log."
              : "Start analysing bird recordings in under a minute."}
          </p>

          {pendingConfirm ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm card-soft">
              We sent a confirmation link to <strong>{email}</strong>. Click it to finish signing up,
              then come back here.
            </div>
          ) : (
            <>
              <Button variant="outline" className="mt-8 w-full" onClick={handleGoogle}>
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Field observer"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <button
                type="button"
                className="mt-6 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin"
                  ? "No account yet? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
