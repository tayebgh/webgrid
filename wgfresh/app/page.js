"use client";
import { useState, useMemo } from "react";
import { webLinks, categories } from "../data/links";
import { useBookmarks, useViews, useSearch, useToast, fmtViews } from "../lib/hooks";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import WebCard from "../components/WebCard";
import AdBanner from "../components/AdBanner";
import Footer from "../components/Footer";

export default function HomePage() {
  const [cat, setCat] = useState("all");
  const { bookmarks, toggle: bmToggle } = useBookmarks();
  const { views, increment } = useViews();
  const { query, setQuery, results: searched } = useSearch(webLinks);
  const { toast, show } = useToast();

  const counts = useMemo(() => {
    const c = { total: webLinks.length };
    webLinks.forEach((l) => { c[l.category] = (c[l.category] || 0) + 1; });
    return c;
  }, []);

  const displayLinks = useMemo(() => {
    if (query.trim()) return searched;
    if (cat === "all") return webLinks;
    if (cat === "bookmarks") return webLinks.filter((l) => bookmarks.has(l.id));
    return webLinks.filter((l) => l.category === cat);
  }, [cat, query, searched, bookmarks]);

  const grouped = useMemo(() => {
    if (cat !== "all" || query.trim()) return null;
    return categories.slice(1).reduce((acc, c) => {
      const links = webLinks.filter((l) => l.category === c.id);
      if (links.length) acc.push({ ...c, links });
      return acc;
    }, []);
  }, [cat, query]);

  function onVisit(link) { increment(link.id); show(`Opening ${link.title}…`, "g"); }
  function onBm(id) {
    const link = webLinks.find((l) => l.id === id);
    const was = bookmarks.has(id);
    bmToggle(id);
    show(was ? `Removed ${link?.title}` : `Bookmarked ${link?.title}!`, was ? "a" : "y");
  }
  function selCat(c) { setCat(c); setQuery(""); }

  function renderGrid(links) {
    if (!links.length) return (
      <div className="empty"><div className="empty-icon">⌕</div><div>No websites found for "{query}"</div></div>
    );
    const items = [];
    links.forEach((link, i) => {
      if (i > 0 && i % 12 === 0)
        items.push(<div key={`ad${i}`} style={{ gridColumn: "1/-1" }}><AdBanner variant="inline" /></div>);
      items.push(
        <WebCard key={link.id} link={link} isBookmarked={bookmarks.has(link.id)}
          onBookmark={onBm} views={views[link.id] || 0} onVisit={onVisit} />
      );
    });
    return items;
  }

  const curCat = categories.find((c) => c.id === cat);

  return (
    <div className="layout">
      <TopBar query={query} onSearch={(q) => { setQuery(q); if (q) setCat("all"); }} />

      <div className="body-row">
        <Sidebar active={cat} onSelect={selCat} counts={counts} bmCount={bookmarks.size} />

        <main className="main">
          <AdBanner variant="leaderboard" />

          {cat === "all" && !query && (
            <div className="hero">
              <div className="hero-text">
                <h1>The Internet, Organized. 🌐</h1>
                <p>Explore {webLinks.length}+ top websites sorted by category — Social, News, Search, Entertainment, Shopping, Tech &amp; more. Your visual internet home.</p>
              </div>
              <div className="hero-stats">
                <div><div className="hstat-n">{webLinks.length}+</div><div className="hstat-l">Websites</div></div>
                <div><div className="hstat-n">{categories.length - 1}</div><div className="hstat-l">Categories</div></div>
                <div><div className="hstat-n">Free</div><div className="hstat-l">Always</div></div>
              </div>
            </div>
          )}

          {(query || cat !== "all") && (
            <div className="page-hd">
              <h2>{query ? `Results for "${query}"` : cat === "bookmarks" ? "🔖 My Bookmarks" : `${curCat?.icon} ${curCat?.label}`}</h2>
              <p><span>{displayLinks.length}</span> {query ? "websites found" : "websites in this category"}</p>
            </div>
          )}

          {grouped && !query && grouped.map((group, gi) => (
            <div key={group.id} className="section-block">
              <div className="section-heading">
                <span className="section-icon">{group.icon}</span>
                <span className="section-name">{group.label}</span>
                <span className="section-count">({group.links.length})</span>
                <button className="section-all" onClick={() => selCat(group.id)}>View all →</button>
              </div>
              <div className="grid">
                {group.links.map((link) => (
                  <WebCard key={link.id} link={link} isBookmarked={bookmarks.has(link.id)}
                    onBookmark={onBm} views={views[link.id] || 0} onVisit={onVisit} />
                ))}
              </div>
              {(gi + 1) % 2 === 0 && <AdBanner variant="inline" />}
            </div>
          ))}

          {(!grouped || query) && (
            <div className="grid">
              {cat === "bookmarks" && !bookmarks.size
                ? <div className="empty-bm"><div className="empty-icon">🔖</div><p>No bookmarks yet. Click the tag icon on any card to save it here.</p></div>
                : renderGrid(displayLinks)}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <div className={`toast${toast.on ? " on" : ""}`}>
        <span className={`tdot ${toast.color}`} />{toast.msg}
      </div>
    </div>
  );
}
