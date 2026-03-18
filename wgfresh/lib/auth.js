"use client";
/**
 * AuthProvider — Supabase auth state for the entire app.
 * Replaces the old localStorage-based auth.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabaseBrowser } from "./supabase";

const AuthCtx = createContext({
  user:            null,
  profile:         null,
  loading:         true,
  login:           async () => {},
  signup:          async () => {},
  logout:          async () => {},
  loginWithGoogle: async () => {},
  loginWithGitHub: async () => {},
  updateName:      async () => {},
  refreshProfile:  async () => {},
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const sb = getSupabaseBrowser();

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await sb.from("profiles").select("*").eq("id", userId).single();
      setProfile(data || null);
      return data;
    } catch { return null; }
  }, [sb]);

  function buildUser(sbUser, prof) {
    if (!sbUser) return null;
    const name = prof?.name || sbUser.user_metadata?.name || sbUser.email?.split("@")[0] || "User";
    return {
      id:                 sbUser.id,
      email:              sbUser.email,
      name,
      avatar:             name[0].toUpperCase(),
      avatarColor:        prof?.avatar_color || "#7C7FFF",
      isPro:              prof?.is_pro       || false,
      subscriptionStatus: prof?.subscription_status || "inactive",
      currentPeriodEnd:   prof?.current_period_end  || null,
      stripeCustomerId:   prof?.stripe_customer_id  || null,
    };
  }

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setUser(buildUser(session.user, prof));
      }
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setUser(buildUser(session.user, prof));
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [sb, fetchProfile]);

  const signup = useCallback(async (name, email, password) => {
    if (!name.trim() || !email.trim() || password.length < 6)
      throw new Error("Name, email, and a password of at least 6 characters are required.");
    const { error } = await sb.auth.signUp({
      email:    email.trim(),
      password,
      options:  { data: { name: name.trim() } },
    });
    if (error) throw new Error(error.message);
  }, [sb]);

  const login = useCallback(async (email, password) => {
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
  }, [sb]);

  const logout = useCallback(async () => {
    await sb.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [sb]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw new Error(error.message);
  }, [sb]);

  const loginWithGitHub = useCallback(async () => {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "github",
      options:  { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw new Error(error.message);
  }, [sb]);

  const updateName = useCallback(async (newName) => {
    if (!user || !newName.trim()) return;
    await sb.from("profiles").update({ name: newName.trim() }).eq("id", user.id);
    setUser((u) => u ? { ...u, name: newName.trim(), avatar: newName.trim()[0].toUpperCase() } : u);
  }, [user, sb]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const prof = await fetchProfile(user.id);
    if (prof) {
      const sbUser = (await sb.auth.getUser()).data.user;
      if (sbUser) setUser(buildUser(sbUser, prof));
    }
  }, [user, sb, fetchProfile]);

  return (
    <AuthCtx.Provider value={{ user, profile, loading, login, signup, logout, loginWithGoogle, loginWithGitHub, updateName, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}

// ── Generate Netscape HTML bookmark file ─────────────────────────────────────
export function generateBookmarkHTML(bookmarkedLinks, userName) {
  const now   = Math.floor(Date.now() / 1000);
  const lines = [
    "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
    "<!-- DO NOT EDIT! -->",
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    `<TITLE>WebGrid Bookmarks — ${userName || "My Bookmarks"}</TITLE>`,
    "<H1>WebGrid Bookmarks</H1>",
    "<DL><p>",
    `    <DT><H3 ADD_DATE="${now}">WebGrid — My Websites</H3>`,
    "    <DL><p>",
  ];
  const byCategory = {};
  bookmarkedLinks.forEach((link) => {
    const cat = link.site_cat || link.category || "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(link);
  });
  Object.entries(byCategory).forEach(([cat, links]) => {
    lines.push(`        <DT><H3>${cat.charAt(0).toUpperCase() + cat.slice(1)}</H3>`, "        <DL><p>");
    links.forEach((link) => {
      const url   = link.site_url   || link.url;
      const title = link.site_title || link.title;
      lines.push(`            <DT><A HREF="https://${url}" ADD_DATE="${now}">${title}</A>`);
    });
    lines.push("        </DL><p>");
  });
  lines.push("    </DL><p>", "</DL><p>");
  return lines.join("\n");
}
