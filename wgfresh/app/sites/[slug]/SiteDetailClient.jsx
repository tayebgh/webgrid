"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TopBar from "../../../components/TopBar";
import Footer from "../../../components/Footer";
import AdBanner from "../../../components/AdBanner";
import SocialShare from "../../../components/SocialShare";
import { fmtViews } from "../../../lib/hooks";

export default function SiteDetailClient({ link, category, related }) {
  const [imgErr, setImgErr] = useState(false);
  const [bm, setBm] = useState(false);
  const [views, setViews] = useState(0);
  const fav = `https://www.google.com/s2/favicons?sz=128&domain=${link.url}`;

  useEffect(() => {
    try {
      setBm(JSON.parse(localStorage.getItem("wg_bm") || "[]").includes(link.id));
      const v = JSON.parse(localStorage.getItem("wg_views") || "{}");
      setViews(v[link.id] || Math.floor(Math.random() * 18000) + 200);
    } catch {}
  }, [link.id]);

  function toggleBm() {
    try {
      const s = new Set(JSON.parse(localStorage.getItem("wg_bm") || "[]"));
      if (s.has(link.id)) s.delete(link.id); else s.add(link.id);
      localStorage.setItem("wg_bm", JSON.stringify([...s]));
      setBm(!bm);
    } catch {}
  }

  function visit() {
    try {
      const v = JSON.parse(localStorage.getItem("wg_views") || "{}");
      v[link.id] = (v[link.id] || 0) + 1;
      localStorage.setItem("wg_views", JSON.stringify(v));
      setViews((p) => p + 1);
    } catch {}
    window.open(`https://${link.url}`, "_blank", "noopener,noreferrer");
  }

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="layout">
      <TopBar />
      <div style={{ paddingTop: "var(--topbar-h)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 0" }}>
          <AdBanner variant="leaderboard" />
        </div>
        <div className="site-wrap">
          <nav className="crumb">
            <Link href="/">Home</Link><span>›</span>
            <Link href={`/?cat=${link.category}`}>{category?.label}</Link><span>›</span>
            <span style={{ color: "var(--text)" }}>{link.title}</span>
          </nav>

          <div className="site-grid">
            {/* LEFT */}
            <div>
              <div className="site-head">
                <div className="site-logo-big">
                  {!imgErr
                    ? <img src={fav} alt={link.title} onError={() => setImgErr(true)} />
                    : <span style={{ fontSize: 28, fontWeight: 900, color: link.color }}>{link.title[0]}</span>}
                </div>
                <div>
                  <div className="site-name">{link.title}</div>
                  <span className="site-badge">{category?.icon} {category?.label}</span><br />
                  <a href={`https://${link.url}`} target="_blank" rel="noopener noreferrer" className="site-url">↗ {link.url}</a>
                </div>
              </div>

              <div className="chips">
                {link.founded && <span className="chip">📅 Founded {link.founded}</span>}
                {link.hq && <span className="chip">📍 {link.hq}</span>}
                <span className="chip">👁 {fmtViews(views)} views</span>
                <span className="chip">{bm ? "🔖 Bookmarked" : "🏷️ Not bookmarked"}</span>
              </div>

              <p className="site-desc">{link.longDesc}</p>

              {link.tags?.length > 0 && (
                <div className="tags">{link.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
              )}

              <AdBanner variant="inline" />
              <SocialShare url={pageUrl} title={`${link.title} — ${link.desc} | WebGrid`} />

              {related.length > 0 && (
                <div className="related-sec">
                  <div className="related-title">Related Websites</div>
                  <div className="related-grid">
                    {related.map((r) => (
                      <Link key={r.id} href={`/sites/${r.slug}`} className="rel-card">
                        <div className="rel-logo">
                          <img src={`https://www.google.com/s2/favicons?sz=64&domain=${r.url}`} alt={r.title}
                            onError={(e) => { e.target.style.display = "none"; }} width={24} height={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{r.url}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div>
              <div className="visit-box" style={{ borderTop: `3px solid ${link.color}` }}>
                <div className="vb-logo">
                  {!imgErr
                    ? <img src={fav} alt={link.title} onError={() => setImgErr(true)} />
                    : <span style={{ color: link.color, fontWeight: 900, fontSize: 22 }}>{link.title[0]}</span>}
                </div>
                <div className="vb-name">{link.title}</div>
                <div className="vb-url">{link.url}</div>
                <button className="vb-visit" onClick={visit}>Visit {link.title} ↗</button>
                <button className={`vb-bm${bm ? " on" : ""}`} onClick={toggleBm}>
                  {bm ? "🔖 Bookmarked" : "🏷️ Add to Bookmarks"}
                </button>
                <div className="vb-stats">
                  <div className="vbs"><div className="vbs-n">{fmtViews(views)}</div><div className="vbs-l">Views</div></div>
                  <div className="vbs"><div className="vbs-n">{link.tags?.length || 0}</div><div className="vbs-l">Tags</div></div>
                  <div className="vbs"><div className="vbs-n">{related.length}</div><div className="vbs-l">Related</div></div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}><AdBanner variant="rectangle" /></div>
              <div style={{ marginTop: 12 }}><AdBanner variant="rectangle" /></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
