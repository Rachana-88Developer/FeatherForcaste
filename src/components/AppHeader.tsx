import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bird, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        pathname === to
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl surface-canopy">
            <Bird className="size-5" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">Avicast</span>
        </Link>

        <nav className="flex items-center gap-1">
          {signedIn ? (
            <>
              {navLink("/studio", "Studio")}
              {navLink("/history", "History")}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-1 gap-1.5">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
