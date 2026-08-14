import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  CloudSun,
  Droplets,
  Leaf,
  Loader2,
  Mic,
  Square,
  Thermometer,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { analyzeRecording } from "@/lib/analysis.functions";
import { fileToPayload, useRecorder } from "@/lib/audio";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Analysis studio — Avicast" },
      {
        name: "description",
        content:
          "Record or upload a bird sound and get an instant climate reading with species, habitat, temperature, humidity and season signals.",
      },
      { property: "og:title", content: "Analysis studio — Avicast" },
      { property: "og:description", content: "Turn a bird recording into a climate reading." },
    ],
  }),
  component: Studio,
});

type Reading = Awaited<ReturnType<typeof analyzeRecording>>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Studio() {
  const recorder = useRecorder();
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeRecording);
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recorder.error) toast.error(recorder.error);
  }, [recorder.error]);

  useEffect(() => {
    return () => {
      if (clipUrl) URL.revokeObjectURL(clipUrl);
    };
  }, [clipUrl]);

  const mutation = useMutation({
    mutationFn: (input: { audioBase64: string; format: string; source: "recording" | "upload" }) =>
      analyze({ data: input as never }),
    onSuccess: (row) => {
      setReading(row);
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Climate reading ready.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Analysis failed. Try again."),
  });

  function submit(
    payload: { base64: string; format: string; blob: Blob },
    source: "recording" | "upload",
  ) {
    if (clipUrl) URL.revokeObjectURL(clipUrl);
    setClipUrl(URL.createObjectURL(payload.blob));
    mutation.mutate({ audioBase64: payload.base64, format: payload.format, source });
  }

  async function toggleRecording() {
    if (recorder.isRecording) {
      const payload = await recorder.stop();
      if (payload) submit(payload, "recording");
    } else {
      setReading(null);
      await recorder.start();
    }
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 18 * 1024 * 1024) {
      toast.error("That file is too large. Keep clips under 18 MB.");
      return;
    }
    setReading(null);
    submit(await fileToPayload(file), "upload");
  }

  const signals = reading
    ? [
        { icon: Thermometer, label: "Temperature", value: reading.temperature_signal },
        { icon: Droplets, label: "Humidity", value: reading.humidity_signal },
        { icon: CloudSun, label: "Season", value: reading.season_signal },
        { icon: Leaf, label: "Ecological risk", value: reading.risk_level },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader signedIn />

      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-semibold md:text-4xl">Analysis studio</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Capture five to thirty seconds of bird song, or upload a clip. Clean audio with as little
          wind and traffic as possible gives the sharpest reading.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center card-soft">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={mutation.isPending}
              className={`flex size-24 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-50 ${
                recorder.isRecording
                  ? "bg-destructive text-destructive-foreground recording-pulse"
                  : "surface-canopy"
              }`}
              aria-label={recorder.isRecording ? "Stop recording" : "Start recording"}
            >
              {recorder.isRecording ? <Square className="size-8" /> : <Mic className="size-8" />}
            </button>
            <p className="mt-5 font-display text-lg font-semibold">
              {recorder.isRecording ? formatTime(recorder.seconds) : "Record live"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {recorder.isRecording ? "Tap to stop and analyse" : "Uses your device microphone"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Upload className="size-7" />
            </span>
            <p className="mt-5 font-display text-lg font-semibold">Upload a clip</p>
            <p className="mt-1 text-sm text-muted-foreground">WAV, MP3, M4A, OGG or WebM</p>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={onFile}
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fileRef.current?.click()}
              disabled={mutation.isPending}
            >
              Choose file
            </Button>
          </div>
        </section>

        {clipUrl && (
          <audio controls src={clipUrl} className="mt-6 w-full">
            <track kind="captions" />
          </audio>
        )}

        {mutation.isPending && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 card-soft">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="font-medium">Listening to your recording…</p>
            </div>
            <Progress value={66} className="mt-4" />
            <p className="mt-3 text-sm text-muted-foreground">
              Identifying the singer, then reading habitat and climate signals.
            </p>
          </div>
        )}

        {reading && !mutation.isPending && (
          <section className="mt-10 rounded-2xl border border-border bg-card p-8 card-lift">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1.5">
                  <AudioLines className="size-3.5" />
                  {reading.source === "recording" ? "Live recording" : "Uploaded clip"}
                </Badge>
                <h2 className="text-2xl font-semibold">{reading.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reading.species} · {reading.habitat}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Confidence
                </p>
                <p className="font-display text-3xl font-semibold">
                  {Math.round(Number(reading.confidence ?? 0))}%
                </p>
              </div>
            </div>

            <p className="mt-6 leading-relaxed">{reading.climate_summary}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {signals.map((signal) => (
                <div key={signal.label} className="rounded-xl border border-border bg-background p-4">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <signal.icon className="size-3.5" />
                    {signal.label}
                  </span>
                  <p className="mt-2 text-sm font-medium">{signal.value}</p>
                </div>
              ))}
            </div>

            {reading.notes && (
              <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                {reading.notes}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
