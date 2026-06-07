import type { RestaurantCallWaiterRow } from "@/services/api/restaurant-call-waiter.api";

export type CallingTextJson = Record<string, string>;

export function parseCallingText(raw: unknown): CallingTextJson {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>)
        .filter(([, value]) => value != null && String(value).trim())
        .map(([key, value]) => [key, String(value).trim()])
    );
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) {
        return parseCallingText(parsed);
      }
    } catch {
      return raw.trim() ? { "1": raw.trim() } : {};
    }
  }
  return {};
}

export function latestCallingMessage(callingText: CallingTextJson): string | null {
  const keys = Object.keys(callingText)
    .map((key) => Number(key))
    .filter((num) => Number.isFinite(num) && num > 0)
    .sort((a, b) => b - a);

  if (!keys.length) return null;
  return callingText[String(keys[0])] ?? null;
}

/** Latest action for this table row — ring or text (from is_ring flag). */
export function isLatestActionRing(call: RestaurantCallWaiterRow): boolean {
  return call.is_ring === true;
}

export function callFingerprint(call: RestaurantCallWaiterRow): string {
  return `${call.id}:${call.is_ring ? "ring" : "text"}:${call.ring_count ?? 0}:${JSON.stringify(parseCallingText(call.calling_text))}:${call.updated_at ?? call.created_at}`;
}

export function tableCallLabel(call: RestaurantCallWaiterRow): string {
  return call.table_number?.trim() || `Table ${call.table_id}`;
}

/** Popup — only the latest action (ring OR latest message, never both). */
export function callPopupMessage(call: RestaurantCallWaiterRow): string {
  const table = tableCallLabel(call);

  if (isLatestActionRing(call)) {
    const ringCount = call.ring_count ?? 1;
    const countLabel = ringCount > 1 ? ` (${ringCount})` : "";
    return `${table}: ringing${countLabel}`;
  }

  const latestMsg = latestCallingMessage(parseCallingText(call.calling_text));
  if (latestMsg) return `${table}: ${latestMsg}`;
  return `${table}: message`;
}

/** Voice — only the latest action. */
export function callSpeechMessage(call: RestaurantCallWaiterRow): string {
  const table = tableCallLabel(call);

  if (isLatestActionRing(call)) {
    const ringCount = call.ring_count ?? 1;
    if (ringCount > 1) {
      return `Attention! ${table} is ringing ${ringCount} times. Please attend the guest.`;
    }
    return `Attention! ${table} is ringing. Please attend the guest.`;
  }

  const latestMsg = latestCallingMessage(parseCallingText(call.calling_text));
  if (latestMsg) return `Message from ${table}. ${latestMsg}`;
  return `${table} sent a message. Please check.`;
}
