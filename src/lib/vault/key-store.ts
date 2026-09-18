// Holds the derived vault key in-memory only. Auto-clears after 15 min idle (SRS §3.3).
import { supabase } from "@/integrations/supabase/client";
import { deriveKey, generateSaltB64 } from "./crypto";

const IDLE_MS = 15 * 60 * 1000;
let key: CryptoKey | null = null;
let saltB64: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function arm() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    key = null;
    emit();
  }, IDLE_MS);
}

export function isUnlocked() {
  return key !== null;
}
export function getKey() {
  if (key) arm();
  return key;
}
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function lockVault() {
  key = null;
  if (timer) clearTimeout(timer);
  emit();
}

/** Re-auth the user with their own password (SRS FR-03.02), then derive the vault key. */
export async function unlockVault(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Load or initialise the user's vault salt on their profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No session");
  const { data: prof } = await supabase
    .from("profiles")
    .select("vault_salt")
    .eq("id", user.id)
    .maybeSingle();
  let salt = prof?.vault_salt ?? null;
  if (!salt) {
    salt = generateSaltB64();
    await supabase.from("profiles").update({ vault_salt: salt }).eq("id", user.id);
  }
  saltB64 = salt;
  key = await deriveKey(password, salt);
  arm();
  emit();
}

export function getSaltB64() {
  return saltB64;
}
