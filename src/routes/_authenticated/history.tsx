import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAnalysis, listAnalyses } from "@/lib/analysis.functions";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Field log — Avicast" },
      {
        name: "description",
        content: "Your saved bird-sound climate readings, tracked over time and locations.",
      },
      { property: "og:title", content: "Field log — Avicast" },
      { property: "og:description", content: "Every saved bioacoustic climate reading." },
    ],
  }),
  component: History,
});

function History() {
  const fetchAll = useServerFn(listAnalyses);
  const remove = useServerFn(deleteAnalysis);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => fetchAll(),
  });

  const deletion = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Reading deleted.");
    },
    onError: () => toast.error("Could not delete that reading."),
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader signedIn />

      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Field log</h1>
            <p className="mt-2 text-muted-foreground">
              Every reading you've saved, newest first.
            </p>
          </div>
          <Button asChild>
            <Link to="/studio">New analysis</Link>
          </Button>
        </div>

        {isPending && (
          <div className="mt-16 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPending && (data?.length ?? 0) === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
            <p className="font-display text-lg font-semibold">No readings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Record or upload a bird sound in the studio to start your log.
            </p>
            <Button asChild className="mt-6">
              <Link to="/studio">Open the studio</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {data?.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-border bg-card p-6 card-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{row.title}</h2>
                    <Badge variant="secondary">{row.risk_level ?? "Low"} risk</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.species} · {row.habitat} ·{" "}
                    {new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl font-semibold">
                    {Math.round(Number(row.confidence ?? 0))}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete reading"
                    onClick={() => deletion.mutate(row.id)}
                    disabled={deletion.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed">{row.climate_summary}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">{row.temperature_signal}</span>
                <span className="rounded-full bg-muted px-3 py-1">{row.humidity_signal}</span>
                <span className="rounded-full bg-muted px-3 py-1">{row.season_signal}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
