"use client";

import { useCallback, useEffect, useRef } from "react";

function pickIndianVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const ranked = [...voices].sort((a, b) => scoreIndianVoice(b) - scoreIndianVoice(a));
  return ranked[0] ?? null;
}

function scoreIndianVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  if (lang === "en-in") {
    if (name.includes("google")) return 100;
    if (name.includes("heera") || name.includes("rishi") || name.includes("veena")) return 95;
    if (name.includes("lekha") || name.includes("neerja")) return 90;
    return 85;
  }

  if (lang.startsWith("en-in")) return 80;
  if (name.includes("india") || name.includes("indian")) return 75;
  if (lang.startsWith("hi-in") || lang.startsWith("hi")) return 70;
  if (lang.startsWith("en-gb") && name.includes("google")) return 40;
  if (lang.startsWith("en")) return 20;

  return 0;
}

export interface VoiceTalkerMessage {
  id: string | number;
  text: string;
}

function useVoiceTalkerEngine() {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return undefined;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
      queueRef.current = [];
      speakingRef.current = false;
    };
  }, [supported]);

  const processQueue = useCallback(() => {
    if (!supported || speakingRef.current || queueRef.current.length === 0) return;

    const text = queueRef.current.shift();
    if (!text?.trim()) {
      processQueue();
      return;
    }

    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = pickIndianVoice(voicesRef.current);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang.startsWith("en") ? "en-IN" : voice.lang;
    }

    const finish = () => {
      speakingRef.current = false;
      processQueue();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      queueRef.current.push(trimmed);
      processQueue();
    },
    [supported, processQueue]
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    speakingRef.current = false;
  }, [supported]);

  return { speak, cancel, supported };
}

interface VoiceTalkerProps {
  messages: VoiceTalkerMessage[];
}

/** Headless TTS — reads popup messages with Indian English voice. */
export function VoiceTalker({ messages }: VoiceTalkerProps) {
  const { speak, supported } = useVoiceTalkerEngine();
  const spokenIdsRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!supported) return;

    for (const message of messages) {
      if (spokenIdsRef.current.has(message.id)) continue;
      spokenIdsRef.current.add(message.id);
      speak(message.text);
    }
  }, [messages, speak, supported]);

  return null;
}

export { useVoiceTalkerEngine };
