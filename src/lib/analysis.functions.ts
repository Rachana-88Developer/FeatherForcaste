import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { inferClimateFromAudio } from "./analysis.server";

const AnalyzeInput = z.object({
  audioBase64: z.string().min(100),
  format: z.enum(["webm", "wav", "mp3", "m4a", "ogg", "aac", "flac"]),
  source: z.enum(["recording", "upload"]),
});

export const analyzeRecording = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const reading = await inferClimateFromAudio(data.audioBase64, data.format);

    const { data: row, error } = await context.supabase
      .from("analyses")
      .insert({
        user_id: context.userId,
        source: data.source,
        title: reading.title,
        species: reading.species,
        habitat: reading.habitat,
        confidence: reading.confidence,
        climate_summary: reading.climate_summary,
        temperature_signal: reading.temperature_signal,
        humidity_signal: reading.humidity_signal,
        season_signal: reading.season_signal,
        risk_level: reading.risk_level,
        notes: reading.notes,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("analyses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
