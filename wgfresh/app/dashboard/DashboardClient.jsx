"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth, generateBookmarkHTML } from "../../lib/auth";
import { fetchBookmarks, addBookmark, removeBookmark, clearAllBookmarks } from "../../lib/supabase";
import { getSupabaseBrowser } from "../../lib/supabase";
import { webLinks, categories } from "../../data/links";
import { fmtViews } from "../../lib/hooks";
import { PLANS } from "../../lib/stripe";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import AdBanner from "../../components/AdBanner";
import AuthModal from "../../components/AuthModal";

const FREE_LIMIT = PLANS.free.limits.bookmarks; // 20

export default function DashboardClient() {
  const { user, loading, logout, updateName, refreshProfile } = useAuth();
  const [dbBookmarks, setDbBookmarks]   = useState([]);  // rows from Supabase bookmarks table
  const [bmLoading,   setBmLoading]     = useState(true);
  const [showAuth,    setShowAuth]      = useState(false);
  const [filter,      setFilter]        = useState("all");
  const [search,      setSearch]        = useState("");
  const [sortBy,      setSortBy]        = useState("added");
  const [editName,    setEditName]      = useState(false);
  const [nameVal,     setNameVal]       = useState("");
  const [toast,       setToast]         = useState({ on: false, msg: "" });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading,  setPortalLoading]  = useState(false);

  function showToast(msg) {
    setToast({ on: true, msg });
    setTimeout(() => setToast({ on: false, msg: "" }), 2400);
  }

  // Load bookmarks from Supabase
  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    setBmLoading(true);
    try {
      const rows = await fetchBookmarks(user.id);
      setDbBookmarks(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setBmLoading(false);
    }
  }, [user]);

  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  // Slugs set for quick lookup (used on home page cards)
  const bmSlugs = useMemo(() => new Set(dbBookmarks.map((r) => r.site_slug)), [dbBookmarks]);

  // Enrich bookmark rows with full link data
  const bmLinks = useMemo(() => {
    return dbBookmarks
      .map((row) => {
        const link = webLinks.find((l) => l.slug === row.site_slug);
        return link ? { ...row, ...link } : null;
      })
      .filter(Boolean);
  }, [dbBookmarks]);

  // Filtered + sorted
  const displayed = useMemo(() => {
    let list = bmLinks;
    if (filter !== "all") list = list.filter((l) => l.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === "alpha")    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "category") list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    return list;
  }, [bmLinks, filter, search, sortBy]);

  const catCounts = useMemo(() => {
    const c = {};
    bmLinks.forEach((l) => { c[l.category] = (c[l.category] || 0) + 1; });
    return c;
  }, [bmLinks]);

  async function handleRemove(siteSlug) {
    try {
      await removeBookmark(user.id, siteSlug);
      setDbBookmarks((prev) => prev.filter((r) => r.site_slug !== siteSlug));
      showToast("Removed from bookmarks");
    } catch (err) { showToast("Error: " + err.message); }
  }

  async function handleClearAll() {
    if (!window.confirm("Remove all bookmarks? This cannot be undone.")) return;
    try {
      await clearAllBookmarks(user.id);
      setDbBookmarks([]);
      showToast("All bookmarks cleared");
    } catch (err) { showToast("Error: " + err.message); }
  }

  function downloadBookmarks() {
    if (!bmLinks.length) { showToast("No bookmarks to export"); return; }
    const html = generateBookmarkHTML(bmLinks, user?.name);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "webgrid-bookmarks.html"; a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${bmLinks.length} bookmarks ✓`);
  }

  function copyAsText() {
    if (!bmLinks.length) { showToast("No bookmarks to copy"); return; }
    const text = bmLinks.map((l) => `${l.title} — https://${l.url}`).join("\n");
    navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard ✓"));
  }

  function saveName() {
    if (nameVal.trim()) { updateName(nameVal); showToast("Name updated ✓"); }
    setEditName(false);
  }

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const res  = await fetch("/api/checkout", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      showToast("Error: " + err.message);
      setUpgradeLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const res  = await fetch("/api/portal", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      showToast("Error: " + err.message);
      setPortalLoading(false);
    }
  }

  const atFreeLimit = !user?.isPro && dbBookmarks.length >= FREE_LIMIT;

  // ── NOT LOGGED IN ─────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div className="layout">
        <TopBar />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <div style={{ paddingTop: "var(--topbar-h)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="dash-login-gate">
            <div className="dlg-icon">🔒</div>
            <h2 className="dlg-title">Sign in to your Dashboard</h2>
            <p className="dlg-sub">Save bookmarks, organise websites, and download your collection to import into any browser. Syncs across all your devices.</p>
            <button className="dlg-btn" onClick={() => setShowAuth(true)}>Sign In / Create Account</button>
            <Link href="/" className="dlg-back">← Back to WebGrid</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="layout">
      <TopBar />
      <div style={{ paddingTop: "var(--topbar-h)" }}>
        <div className="dash-wrap">

          {/* ── PROFILE HEADER ── */}
          <div className="dash-header">
            <div className="dash-header-left">
              <div className="dash-avatar" style={{ background: user?.avatarColor || "var(--accent)" }}>
                {user?.avatar || "?"}
                {user?.isPro && <span className="dash-pro-crown">✦</span>}
              </div>
              <div>
                {editName ? (
                  <div className="dash-name-edit">
                    <input className="dash-name-input" value={nameVal}
                      onChange={(e) => setNameVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key==="Enter") saveName(); if (e.key==="Escape") setEditName(false); }}
                      autoFocus />
                    <button className="dash-name-save" onClick={saveName}>Save</button>
                    <button className="dash-name-cancel" onClick={() => setEditName(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="dash-name-row">
                    <h1 className="dash-name">{user?.name}</h1>
                    {user?.isPro && <span className="dash-pro-badge">✦ Pro</span>}
                    <button className="dash-edit-btn" onClick={() => { setNameVal(user?.name || ""); setEditName(true); }} title="Edit name">✏️</button>
                  </div>
                )}
                <div className="dash-email">{user?.email}</div>
                {user?.isPro && user?.currentPeriodEnd && (
                  <div className="dash-period">Pro renews {new Date(user.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="dash-stats">
              <div className="dash-stat">
                <div className="dash-stat-n">{dbBookmarks.length}{!user?.isPro && `/${FREE_LIMIT}`}</div>
                <div className="dash-stat-l">Bookmarks</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-n">{Object.keys(catCounts).length}</div>
                <div className="dash-stat-l">Categories</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-n">{user?.isPro ? "∞" : FREE_LIMIT - dbBookmarks.length}</div>
                <div className="dash-stat-l">{user?.isPro ? "Limit" : "Remaining"}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="dash-header-actions">
              <button className="dash-btn-download" onClick={downloadBookmarks}>⬇ Download for Browser</button>
              <button className="dash-btn-copy"     onClick={copyAsText}>◫ Copy as Text</button>
              {user?.isPro ? (
                <button className="dash-btn-portal" onClick={handlePortal} disabled={portalLoading}>
                  {portalLoading ? "Loading…" : "⚙ Manage Subscription"}
                </button>
              ) : (
                <button className="dash-btn-upgrade" onClick={handleUpgrade} disabled={upgradeLoading}>
                  {upgradeLoading ? "Loading…" : "✦ Upgrade to Pro — $7/mo"}
                </button>
              )}
              <button className="dash-btn-logout" onClick={logout}>Sign Out</button>
            </div>
          </div>

          {/* ── FREE LIMIT BANNER ── */}
          {atFreeLimit && (
            <div className="dash-limit-banner">
              <div>
                <strong>You've reached the free bookmark limit ({FREE_LIMIT}).</strong>{" "}
                Upgrade to Pro for unlimited bookmarks, no ads, and more.
              </div>
              <button className="dash-limit-upgrade" onClick={handleUpgrade} disabled={upgradeLoading}>
                {upgradeLoading ? "Loading…" : "Upgrade to Pro →"}
              </button>
            </div>
          )}

          {/* ── EXPORT INFO ── */}
          <div className="dash-export-info">
            <div className="dei-icon">💡</div>
            <div>
              <div className="dei-title">Import your bookmarks into any browser</div>
              <div className="dei-text">
                Click <strong>Download for Browser</strong> to get a <code>.html</code> file.
                Then: <strong>Chrome</strong> → Bookmarks → Import |
                <strong> Firefox</strong> → Show All Bookmarks → Import from HTML |
                <strong> Safari</strong> → File → Import From → Bookmarks HTML File
              </div>
            </div>
          </div>

          <AdBanner variant="leaderboard" />

          {/* ── TOOLBAR ── */}
          <div className="dash-toolbar">
            <div className="dash-search">
              <span className="dash-search-icon">⌕</span>
              <input className="dash-search-input" placeholder="Search your bookmarks…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="dash-sort">
              <span className="dash-sort-label">Sort:</span>
              {[["added","Date Added"],["alpha","A–Z"],["category","Category"]].map(([v,l]) => (
                <button key={v} className={`dash-sort-btn${sortBy===v?" on":""}`} onClick={() => setSortBy(v)}>{l}</button>
              ))}
            </div>
            {dbBookmarks.length > 0 && (
              <button className="dash-clear-btn" onClick={handleClearAll}>🗑 Clear All</button>
            )}
          </div>

          {/* ── CATEGORY FILTERS ── */}
          {bmLinks.length > 0 && (
            <div className="dash-cats">
              <button className={`dash-cat-btn${filter==="all"?" on":""}`} onClick={() => setFilter("all")}>
                All <span className="dash-cat-count">{dbBookmarks.length}</span>
              </button>
              {Object.entries(catCounts).map(([cat, n]) => {
                const catData = categories.find((c) => c.id === cat);
                return (
                  <button key={cat} className={`dash-cat-btn${filter===cat?" on":""}`} onClick={() => setFilter(cat)}>
                    {catData?.icon} {catData?.label} <span className="dash-cat-count">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── BOOKMARK GRID ── */}
          {bmLoading ? (
            <div className="dash-empty"><div className="dash-empty-icon">⟳</div><div className="dash-empty-title">Loading bookmarks…</div></div>
          ) : displayed.length === 0 ? (
            <div className="dash-empty">
              {dbBookmarks.length === 0 ? (
                <>
                  <div className="dash-empty-icon">🔖</div>
                  <div className="dash-empty-title">No bookmarks yet</div>
                  <div className="dash-empty-sub">Browse the directory and click 🏷️ on any website card to save it here.</div>
                  <Link href="/" className="dash-empty-btn">Explore Websites →</Link>
                </>
              ) : (
                <>
                  <div className="dash-empty-icon">🔍</div>
                  <div className="dash-empty-title">No results for "{search}"</div>
                </>
              )}
            </div>
          ) : (
            <div className="dash-grid">
              {displayed.map((link) => (
                <DashCard key={link.site_slug} link={link} onRemove={() => handleRemove(link.site_slug)} />
              ))}
            </div>
          )}

          {displayed.length > 0 && !user?.isPro && (
            <div style={{ marginTop: 24 }}>
              <AdBanner variant="inline" />
            </div>
          )}

          {/* Upgrade CTA (bottom) */}
          {!user?.isPro && dbBookmarks.length > 0 && (
            <div className="dash-upgrade-cta">
              <div>
                <div className="duc-title">✦ Unlock WebGrid Pro</div>
                <div className="duc-sub">Unlimited bookmarks, no ads, priority support — $7/month.</div>
              </div>
              <button className="dash-btn-upgrade" onClick={handleUpgrade} disabled={upgradeLoading} style={{ flexShrink: 0 }}>
                {upgradeLoading ? "Loading…" : "Upgrade Now →"}
              </button>
            </div>
          )}

        </div>
      </div>
      <Footer />
      <div className={`toast${toast.on ? " on" : ""}`}>
        <span className="tdot a" />{toast.msg}
      </div>
    </div>
  );
}

function DashCard({ link, onRemove }) {
  const [imgErr, setImgErr] = useState(false);
  const fav     = `https://www.google.com/s2/favicons?sz=64&domain=${link.url}`;
  const catData = categories.find((c) => c.id === link.category);

  return (
    <div className="dash-card" style={{ "--c": link.color }}>
      <div className="dash-card-accent" />
      <div className="dash-card-head">
        <div className="dash-card-logo">
          {!imgErr
            ? <img src={fav} alt={link.title} width={24} height={24} onError={() => setImgErr(true)} />
            : <span style={{ fontWeight:900, fontSize:16, color:link.color }}>{link.title[0]}</span>}
        </div>
        <span className="dash-card-cat">{catData?.icon} {catData?.label}</span>
        <button className="dash-card-remove" onClick={onRemove} title="Remove">✕</button>
      </div>
      <div className="dash-card-name">{link.title}</div>
      <div className="dash-card-desc">{link.desc}</div>
      <div className="dash-card-foot">
        <span className="dash-card-url">{link.url}</span>
        <div className="dash-card-actions">
          <Link href={`/sites/${link.slug}`} className="dash-card-info">Info</Link>
          <a href={`https://${link.url}`} target="_blank" rel="noopener noreferrer" className="dash-card-visit">Visit ↗</a>
        </div>
      </div>
    </div>
  );
}
