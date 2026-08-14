// Server-only helpers for bird-sound climate analysis.

export type ClimateReading = {
  title: string;
  species: string;
  habitat: string;
  confidence: number;
  climate_summary: string;
  temperature_signal: string;
  humidity_signal: string;
  season_signal: string;
  risk_level: string;
  notes: string;
};

const SYSTEM_PROMPT = `You are an acoustic ecologist. You listen to short field recordings of bird
vocalisations and infer environmental and climate conditions from them.

From the audio, reason about:
- which bird species (or family) is most likely calling
- the habitat/biome the recording most likely comes from
- what the call type, tempo, pitch and background ambience imply about temperature, humidity,
  season and time of day
- any ecological stress signals (heat stress panting calls, reduced dawn chorus density,
  out-of-season breeding song, storm-avoidance behaviour)

Be explicit that this is an acoustic inference, not a meteorological measurement. If the audio has
no discernible bird sound, say so plainly, set confidence low and describe what you did hear.

Answer ONLY with a JSON object using exactly these keys:
{
  "title": "short 3-6 word label for this reading",
  "species": "most likely species or family",
  "habitat": "likely habitat / biome",
  "confidence": 0-100 number,
  "climate_summary": "2-3 sentence plain-language climate reading",
  "temperature_signal": "e.g. Warm, 22-28 C range",
  "humidity_signal": "e.g. High humidity, post-rain",
  "season_signal": "e.g. Early breeding season / spring",
  "risk_level": "one of: Low, Moderate, Elevated, High",
  "notes": "caveats and what would sharpen the estimate"
}`;

function coerce(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function inferClimateFromAudio(
  audioBase64: string,
  format: string,
): Promise<ClimateReading> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Gemini is used here because the recording is audio input; text-only models cannot listen.
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse this bird recording and return the JSON climate reading.",
            },
            { type: "input_audio", input_audio: { data: audioBase64, format } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Too many requests right now — try again shortly.");
    if (response.status === 402)
      throw new Error("AI credits are exhausted. Add credits to keep analysing recordings.");
    throw new Error(`Analysis failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]) as Record<string, unknown>;
  }

  const confidenceRaw = parsed["confidence"];
  const confidence =
    typeof confidenceRaw === "number"
      ? Math.max(0, Math.min(100, confidenceRaw))
      : Number.parseFloat(String(confidenceRaw ?? "")) || 0;

  return {
    title: coerce(parsed["title"], "Bird sound analysis"),
    species: coerce(parsed["species"], "Unidentified"),
    habitat: coerce(parsed["habitat"], "Unknown"),
    confidence,
    climate_summary: coerce(parsed["climate_summary"], raw.slice(0, 500) || "No reading produced."),
    temperature_signal: coerce(parsed["temperature_signal"], "Inconclusive"),
    humidity_signal: coerce(parsed["humidity_signal"], "Inconclusive"),
    season_signal: coerce(parsed["season_signal"], "Inconclusive"),
    risk_level: coerce(parsed["risk_level"], "Low"),
    notes: coerce(parsed["notes"], ""),
  };
}
