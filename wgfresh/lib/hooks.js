"use client";
import { useState, useEffect, useCallback } from "react";

// Auth-aware bookmark key helper (mirrors lib/auth.js logic without circular dep)
function getBmKey() {
  try {
    const u = JSON.parse(localStorage.getItem("wg_user") || "null");
    return u?.id ? `wg_bm_${u.id}` : "wg_bm";
  } catch { return "wg_bm"; }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    try {
      const key = getBmKey();
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      setBookmarks(new Set(saved));
    } catch {}
  }, []);

  const toggle = useCallback((id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try {
        const key = getBmKey();
        localStorage.setItem(key, JSON.stringify([...next]));
        // Also keep the legacy key in sync for unauthenticated fallback
        localStorage.setItem("wg_bm", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return { bookmarks, toggle };
}

export function useViews() {
  const [views, setViews] = useState({});
  useEffect(() => {
    import("../data/links").then(({ webLinks }) => {
      try {
        const saved = JSON.parse(localStorage.getItem("wg_views") || "{}");
        const seeded = {};
        webLinks.forEach((l) => { seeded[l.id] = saved[l.id] ?? Math.floor(Math.random() * 18000) + 200; });
        setViews(seeded);
        if (!Object.keys(saved).length) localStorage.setItem("wg_views", JSON.stringify(seeded));
      } catch {}
    });
  }, []);
  const increment = useCallback((id) => {
    setViews((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      try { localStorage.setItem("wg_views", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { views, increment };
}

export function useSearch(links) {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? links.filter((l) =>
        [l.title, l.url, l.desc, l.category].some((f) =>
          f.toLowerCase().includes(query.toLowerCase())
        )
      )
    : links;
  return { query, setQuery, results };
}

export function useToast() {
  const [toast, setToast] = useState({ on: false, msg: "", color: "a" });
  const show = useCallback((msg, color = "a") => setToast({ on: true, msg, color }), []);
  useEffect(() => {
    if (!toast.on) return;
    const t = setTimeout(() => setToast((p) => ({ ...p, on: false })), 2400);
    return () => clearTimeout(t);
  }, [toast.on, toast.msg]);
  return { toast, show };
}

export function fmtViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}
