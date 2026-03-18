"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import AdBanner from "../../components/AdBanner";

export default function BlogList({ posts }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const cats = useMemo(() => ["All", ...new Set(posts.map((p) => p.category))], [posts]);

  const filtered = useMemo(() => {
    let list = filter !== "All" ? posts.filter((p) => p.category === filter) : posts;
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(lq) ||
        p.excerpt.toLowerCase().includes(lq) ||
        p.tags.some((t) => t.toLowerCase().includes(lq))
      );
    }
    return list;
  }, [filter, q, posts]);

  const items = useMemo(() => {
    const out = [];
    filtered.forEach((post, i) => {
      if (i > 0 && i % 6 === 0) out.push({ type: "ad", id: `ad${i}` });
      out.push({ type: "post", data: post, featured: i === 0 && !q && filter === "All" });
    });
    return out;
  }, [filtered, q, filter]);

  return (
    <div className="layout">
      <TopBar />
      <div style={{ paddingTop: "var(--topbar-h)" }}>
        <div className="blog-wrap">
          <div style={{ paddingTop: 20 }}><AdBanner variant="leaderboard" /></div>

          <div className="blog-hd">
            <div>
              <h1>WebGrid <em>Blog</em></h1>
              <p>In-depth guides, reviews, and digital tips — {posts.length} articles and counting.</p>
            </div>
            <div className="blog-search">
              <span className="blog-search-icon">⌕</span>
              <input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          <div className="blog-filters">
            {cats.map((c) => (
              <button key={c} className={`bf-btn${filter === c ? " on" : ""}`}
                onClick={() => { setFilter(c); setQ(""); }}>{c}</button>
            ))}
          </div>

          <div className="blog-grid">
            {items.length === 0 && <div className="blog-empty">No articles found for "{q}"</div>}
            {items.map((item) =>
              item.type === "ad"
                ? <div key={item.id} className="blog-ad-full"><AdBanner variant="inline" /></div>
                : <BlogCard key={item.data.id} post={item.data} featured={item.featured} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BlogCard({ post, featured }) {
  const [imgErr, setImgErr] = useState(false);
  const imgUrl = post.image
    ? `https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=${featured ? 560 : 720}&q=80`
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`bc${featured ? " featured" : ""}`}
      style={{ "--cc": post.categoryColor, "--gc1": post.categoryColor + "33", "--gc2": post.categoryColor + "11" }}
    >
      {/* ── Thumbnail ── */}
      <div className="bc-cover">
        {imgUrl && !imgErr ? (
          <Image
            src={imgUrl}
            alt={post.title}
            fill
            sizes={featured ? "560px" : "(max-width:640px) 100vw, 380px"}
            className="bc-cover-img"
            onError={() => setImgErr(true)}
            priority={featured}
          />
        ) : (
          <div className="bc-gradient" />
        )}

        {/* Category badge overlaid on image */}
        <div className="bc-cover-badge" style={{ background: post.categoryColor }}>
          {post.coverEmoji} {post.category}
        </div>

        {/* Gradient overlay so text is readable over photos */}
        <div className="bc-cover-overlay" />
      </div>

      {/* ── Body ── */}
      <div className="bc-body">
        <div className="bc-title">{post.title}</div>
        <div className="bc-excerpt">{post.excerpt}</div>
        <div className="bc-foot">
          <div style={{ display: "flex", gap: 12 }}>
            <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
          </div>
          <div className="bc-read">Read <span>→</span></div>
        </div>
      </div>
    </Link>
  );
}

