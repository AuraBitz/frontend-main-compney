"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  callFingerprint,
  callPopupMessage,
  callSpeechMessage,
  isLatestActionRing,
} from "@/restaurant-management-admin-panel/lib/call-waiter-messages";
import { VoiceTalker } from "@/restaurant-management-admin-panel/components/VoiceTalker";
import {
  GetRecentRestaurantCallWaiter,
  type RestaurantCallWaiterRow,
} from "@/services/api/restaurant-call-waiter.api";

const RING_CALL_POLL_MS = 3000;
const POPUP_AUTO_DISMISS_MS = 3000;

function playRingTone() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    window.setTimeout(() => void ctx.close(), 500);
  } catch {
    // ignore
  }
}

function RingPopupCard({
  call,
  fingerprint,
  onDismiss,
}: {
  call: RestaurantCallWaiterRow;
  fingerprint: string;
  onDismiss: (key: string) => void;
}) {
  const isRing = isLatestActionRing(call);

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(fingerprint), POPUP_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [fingerprint, onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-2xl border-2 shadow-2xl animate-in slide-in-from-top-2",
        isRing
          ? "border-orange-400 bg-gradient-to-br from-orange-50 to-amber-100"
          : "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl",
            isRing ? "bg-orange-500 text-white animate-pulse" : "bg-blue-600 text-white"
          )}
        >
          {isRing ? "🔔" : "💬"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isRing ? "Table Ring" : "Guest Message"}
          </p>
          <p className="mt-1 text-base font-bold leading-snug">{callPopupMessage(call)}</p>
          {isRing && (call.ring_count ?? 0) > 1 ? (
            <p className="mt-1 text-xs font-semibold text-orange-700">
              Ring count: {call.ring_count}
            </p>
          ) : null}
          {call.floor_no != null ? (
            <p className="mt-1 text-xs text-muted-foreground">Floor {call.floor_no}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(fingerprint)}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-black/5"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <div className="border-t border-black/5 px-4 py-2">
        <button
          type="button"
          onClick={() => onDismiss(fingerprint)}
          className={cn(
            "w-full rounded-xl py-2 text-sm font-bold text-white",
            isRing ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

interface RestaurantRingCallerProps {
  restaurantId: number;
}

export function RestaurantRingCaller({ restaurantId }: RestaurantRingCallerProps) {
  const [visiblePopups, setVisiblePopups] = useState<
    Array<{ call: RestaurantCallWaiterRow; fingerprint: string }>
  >([]);
  const [speechMessages, setSpeechMessages] = useState<
    Array<{ id: string; text: string }>
  >([]);
  const primedRef = useRef(false);
  const announcedFingerprintsRef = useRef<Set<string>>(new Set());
  const lastRingFingerprintRef = useRef<string | null>(null);

  const dismissPopup = useCallback((fingerprint: string) => {
    setVisiblePopups((prev) => prev.filter((item) => item.fingerprint !== fingerprint));
  }, []);

  const announceCalls = useCallback((rows: RestaurantCallWaiterRow[]) => {
    if (!primedRef.current) {
      rows.forEach((row) => announcedFingerprintsRef.current.add(callFingerprint(row)));
      primedRef.current = true;
      return;
    }

    const fresh = rows.filter(
      (row) => !announcedFingerprintsRef.current.has(callFingerprint(row))
    );

    if (fresh.length === 0) return;

    fresh.forEach((row) => {
      const fingerprint = callFingerprint(row);
      announcedFingerprintsRef.current.add(fingerprint);

      setVisiblePopups((prev) => {
        const withoutSameTable = prev.filter((item) => item.call.id !== row.id);
        return [{ call: row, fingerprint }, ...withoutSameTable].slice(0, 5);
      });

      setSpeechMessages((prev) => [
        ...prev,
        { id: fingerprint, text: callSpeechMessage(row) },
      ]);

      if (isLatestActionRing(row) && fingerprint !== lastRingFingerprintRef.current) {
        lastRingFingerprintRef.current = fingerprint;
        playRingTone();
      }
    });
  }, []);

  useEffect(() => {
    if (!restaurantId) return undefined;

    let cancelled = false;
    primedRef.current = false;
    announcedFingerprintsRef.current = new Set();
    lastRingFingerprintRef.current = null;
    setSpeechMessages([]);
    setVisiblePopups([]);

    const fetchCalls = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const rows = await GetRecentRestaurantCallWaiter(restaurantId);
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        announceCalls(list);
      } catch {
        // keep last snapshot
      }
    };

    void fetchCalls();
    const timer = window.setInterval(fetchCalls, RING_CALL_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void fetchCalls();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [restaurantId, announceCalls]);

  return (
    <>
      <VoiceTalker messages={speechMessages} />
      {visiblePopups.length > 0 ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[10002] flex w-[min(100vw-2rem,22rem)] flex-col gap-3">
          {visiblePopups.map(({ call, fingerprint }) => (
            <RingPopupCard
              key={fingerprint}
              call={call}
              fingerprint={fingerprint}
              onDismiss={dismissPopup}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
