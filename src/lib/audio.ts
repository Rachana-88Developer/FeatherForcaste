import { useEffect, useRef, useState } from "react";

type Recorder = {
  isRecording: boolean;
  seconds: number;
  start: () => Promise<void>;
  stop: () => Promise<{ base64: string; format: string; blob: Blob } | null>;
  error: string | null;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the recording."));
    reader.readAsDataURL(blob);
  });
}

export function mimeToFormat(mime: string): string {
  const base = mime.split(";")[0] ?? "";
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/flac": "flac",
    "audio/aac": "aac",
  };
  return map[base] ?? "webm";
}

export function useRecorder(): Recorder {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was blocked. Allow it, or upload a file instead.");
    }
  };

  const stop = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return null;
    if (timerRef.current) clearInterval(timerRef.current);

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () =>
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      recorder.stop();
    });
    recorder.stream.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    setIsRecording(false);

    if (blob.size < 2048) {
      setError("That clip was too short or silent. Try recording a few seconds of bird song.");
      return null;
    }
    return { base64: await blobToBase64(blob), format: mimeToFormat(blob.type), blob };
  };

  return { isRecording, seconds, start, stop, error };
}

export async function fileToPayload(file: File) {
  const base64 = await blobToBase64(file);
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byExtension: Record<string, string> = {
    wav: "wav",
    mp3: "mp3",
    m4a: "m4a",
    webm: "webm",
    ogg: "ogg",
    aac: "aac",
    flac: "flac",
  };
  return {
    base64,
    format: byExtension[extension] ?? mimeToFormat(file.type),
    blob: file as Blob,
  };
}
