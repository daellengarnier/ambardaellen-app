"use client";

import { useEffect, useState } from "react";

// Aussprache über die Sprachausgabe des Geräts. Ob eine vietnamesische
// Stimme da ist (und ob sie südlich klingt), hängt vom Gerät ab.

function findViVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().startsWith("vi")) ?? null;
}

/** true, sobald eine vietnamesische Stimme verfügbar ist. */
export function useViVoice(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => setAvailable(findViVoice() !== null);
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);
  return available;
}

export function speakVi(text: string, rate = 0.85): void {
  const voice = findViVoice();
  if (!voice) return;
  window.speechSynthesis.cancel();
  // "thơm / dứa": Alternativen nacheinander sprechen.
  const u = new SpeechSynthesisUtterance(text.replace(/\s*\/\s*/g, ", "));
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
