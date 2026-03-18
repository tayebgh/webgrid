/**
 * Supabase client utilities
 *
 * Browser client  → use in Client Components ("use client")
 * Server client   → use in Server Components, Route Handlers, Server Actions
 * Admin client    → use ONLY in secure API routes (uses service role key)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Browser client (singleton) ────────────────────────────────────────────────
let _browserClient = null;

export function getSupabaseBrowser() {
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _browserClient;
}

// ── Admin client (server-side only — never expose to browser) ─────────────────
export function getSupabaseAdmin() {
  if (!SUPABASE_SVC) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, SUPABASE_SVC, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

/** Get the currently logged-in user (browser) */
export async function getCurrentUser() {
  const sb = getSupabaseBrowser();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/** Get the profile row for a user */
export async function getProfile(userId) {
  const sb = getSupabaseBrowser();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/** Update profile name */
export async function updateProfileName(userId, name) {
  const sb = getSupabaseBrowser();
  const { error } = await sb
    .from("profiles")
    .update({ name })
    .eq("id", userId);
  if (error) throw error;
}

// ── Bookmark helpers ──────────────────────────────────────────────────────────

/** Fetch all bookmarks for a user */
export async function fetchBookmarks(userId) {
  const sb = getSupabaseBrowser();
  const { data, error } = await sb
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Add a bookmark */
export async function addBookmark(userId, link) {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("bookmarks").upsert({
    user_id:    userId,
    site_slug:  link.slug,
    site_title: link.title,
    site_url:   link.url,
    site_cat:   link.category,
  }, { onConflict: "user_id,site_slug" });
  if (error) throw error;
}

/** Remove a bookmark */
export async function removeBookmark(userId, siteSlug) {
  const sb = getSupabaseBrowser();
  const { error } = await sb
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("site_slug", siteSlug);
  if (error) throw error;
}

/** Remove all bookmarks for a user */
export async function clearAllBookmarks(userId) {
  const sb = getSupabaseBrowser();
  const { error } = await sb
    .from("bookmarks")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
