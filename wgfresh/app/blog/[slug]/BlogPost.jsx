"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TopBar from "../../../components/TopBar";
import Footer from "../../../components/Footer";
import AdBanner from "../../../components/AdBanner";
import SocialShare from "../../../components/SocialShare";

/* ── Markdown → HTML ─────────────────────────────────────────────── */
function md(text) {
  if (!text) return "";
  return text
    // Tables
    .replace(
      /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g,
      (_, h, rows) => {
        const ths = h.split("|").filter((c) => c.trim())
          .map((c) => `<th>${c.trim()}</th>`).join("");
        const trs = rows.trim().split("\n")
          .map((row) => {
            const tds = row.split("|").filter((c) => c.trim())
              .map((c) => `<td>${c.trim()}</td>`).join("");
            return `<tr>${tds}</tr>`;
          }).join("");
        return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>\n\n`;
      }
    )
    // Headings
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    // HR
    .replace(/^---$/gm, "<hr />")
    // Unordered lists
    .replace(/(^- .+\n?)+/gm, (match) =>
      `<ul>${match.trim().split("\n")
        .map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("")}</ul>`
    )
    // Paragraphs
    .split(/\n{2,}/)
    .map((b) => {
      b = b.trim();
      if (!b) return "";
      if (/^<(h[1-6]|ul|ol|table|hr)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}

function getH2s(text) {
  return [...(text || "").matchAll(/^## (.+)$/gm)].map((m) => m[1]);
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/* ── Component ───────────────────────────────────────────────────── */
export default function BlogPost({ post, related }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const d = document.documentElement;
      const total = d.scrollHeight - d.clientHeight;
      setProgress(total > 0 ? (d.scrollTop / total) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const h2s    = getH2s(post.content);
  const html   = md(post.content);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="layout">
      <TopBar />

      {/* Reading progress bar */}
      <div
        className="progress-bar"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />

      <div style={{ paddingTop: "var(--topbar-h)" }}>

        {/* Top leaderboard ad */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 0" }}>
          <AdBanner variant="leaderboard" />
        </div>

        <div className="post-wrap">

          {/* Breadcrumb */}
          <nav className="crumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/blog">Blog</Link>
            <span>›</span>
            <span style={{ color: "var(--text)" }}>{post.category}</span>
          </nav>

          <div className="post-layout">

            {/* ── ARTICLE ── */}
            <article>

              {/* Hero image */}
              {post.image && (
                <div className="post-hero-img">
                  <Image
                    src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=1200&q=85`}
                    alt={post.title}
                    fill
                    sizes="(max-width:900px) 100vw, 720px"
                    className="post-hero-photo"
                    priority
                  />
                  <div className="post-hero-overlay" />
                  {/* Category badge on image */}
                  <div className="post-hero-badge" style={{ "--pc": post.categoryColor }}>
                    <span className="post-cat-dot" />
                    {post.coverEmoji} {post.category}
                  </div>
                </div>
              )}

              {/* Category badge (shown when no image) */}
              {!post.image && (
                <div className="post-cat" style={{ "--pc": post.categoryColor }}>
                  <span className="post-cat-dot" />
                  {post.category}
                </div>
              )}

              {/* Title & excerpt */}
              <h1 className="post-title">{post.title}</h1>
              <p className="post-excerpt">{post.excerpt}</p>

              {/* Meta */}
              <div className="post-meta">
                <span className="post-meta-author">✦ {post.author}</span>
                <span>·</span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>

              {/* Table of contents */}
              {h2s.length > 0 && (
                <nav className="post-toc" aria-label="Table of contents">
                  <div className="post-toc-label">Table of Contents</div>
                  <ol>
                    {h2s.map((h, i) => (
                      <li key={i}>
                        <a href={`#${slug(h)}`}>{h}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Main content */}
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((t) => (
                    <span key={t} className="post-tag">#{t}</span>
                  ))}
                </div>
              )}

              {/* Bottom ad */}
              <AdBanner variant="inline" />

              {/* Social share */}
              <SocialShare
                url={pageUrl}
                title={`${post.title} — WebGrid Blog`}
              />

            </article>

            {/* ── SIDEBAR ── */}
            <aside className="post-sidebar">

              {/* Related articles */}
              {related.length > 0 && (
                <div className="sidebar-box">
                  <div className="sidebar-box-label">Related Articles</div>
                  {related.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`} className="rp-item">
                      <span className="rp-emoji">{rp.coverEmoji}</span>
                      <div>
                        <div className="rp-title">{rp.title}</div>
                        <div className="rp-meta">{rp.readTime} · {rp.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Sidebar ads */}
              <AdBanner variant="rectangle" />
              <AdBanner variant="rectangle" />

            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
