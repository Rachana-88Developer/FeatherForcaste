import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AudioLines, Bird, CloudSun, Droplets, LineChart, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avicast — Read the Climate in Bird Song" },
      {
        name: "description",
        content:
          "Avicast turns a few seconds of bird sound into an AI climate reading: likely species, habitat, temperature, humidity, season and ecological risk.",
      },
      { property: "og:title", content: "Avicast — Read the Climate in Bird Song" },
      {
        property: "og:description",
        content: "Record or upload bird sounds and get an instant climate and habitat reading.",
      },
    ],
  }),
  component: Index,
});

const signals = [
  {
    icon: Thermometer,
    title: "Temperature signal",
    body: "Call tempo, pitch shifts and panting notes hint at the thermal band the bird is singing in.",
  },
  {
    icon: Droplets,
    title: "Humidity signal",
    body: "Post-rain resonance, insect ambience and dampened reverb point to moisture in the air.",
  },
  {
    icon: CloudSun,
    title: "Season signal",
    body: "Breeding song, alarm calls and chorus density place the recording in the seasonal cycle.",
  },
  {
    icon: LineChart,
    title: "Ecological risk",
    body: "Thin dawn chorus or out-of-season song is flagged as a stress indicator worth tracking.",
  },
];

function Index() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session?.user)),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader signedIn={signedIn} />

      <main>
        <section className="relative overflow-hidden surface-canopy">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-widest opacity-80">
                <AudioLines className="size-3.5" />
                Bioacoustic climate sensing
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] md:text-6xl">
                The forest is already <span className="text-dawn">reporting the weather.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed opacity-85 md:text-lg">
                Avicast listens to a few seconds of bird song and infers the conditions around the
                singer — likely species, habitat, temperature and humidity band, season and
                ecological stress. Every reading is saved to your field log.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link to={signedIn ? "/studio" : "/auth"}>
                    {signedIn ? "Open the studio" : "Start listening"}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="border border-white/25 hover:bg-white/10"
                >
                  <a href="#how">How it works</a>
                </Button>
              </div>
              <p className="mt-5 text-xs opacity-65">
                Acoustic inference, not a meteorological instrument — every reading ships with its
                confidence and caveats.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative flex size-56 items-center justify-center rounded-full border border-white/15 bg-white/5 md:size-72">
                <div className="absolute inset-6 rounded-full border border-white/10" />
                <div className="absolute inset-12 rounded-full border border-white/10" />
                <Bird className="size-20 opacity-90 md:size-24" />
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold md:text-4xl">What a recording tells us</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Record live from your phone or upload an existing clip. The analysis breaks the audio
            into four environmental signals plus a plain-language summary.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {signals.map((signal) => (
              <article
                key={signal.title}
                className="rounded-2xl border border-border bg-card p-6 card-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <signal.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{signal.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-8 card-soft">
            <div>
              <h3 className="text-xl font-semibold">Build your own acoustic climate log</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Readings are stored to your private history so you can watch a site change over
                seasons.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to={signedIn ? "/studio" : "/auth"}>
                {signedIn ? "Analyse a recording" : "Create an account"}
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Avicast · bioacoustic climate inference
      </footer>
    </div>
  );
}
