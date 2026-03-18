"use client";
import Link from "next/link";
import { categories } from "../data/links";
import { useAuth } from "../lib/auth";
import AdBanner from "./AdBanner";

export default function Sidebar({ active, onSelect, counts, bmCount }) {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <span className="sidebar-label">Categories</span>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-btn${active === cat.id ? " active" : ""}`}
          onClick={() => onSelect(cat.id)}
        >
          <span className="cat-icon">{cat.icon}</span>
          {cat.label}
          <span className="cat-count">{cat.id === "all" ? counts.total : (counts[cat.id] || 0)}</span>
        </button>
      ))}

      <div className="sidebar-divider" />
      <span className="sidebar-label">My Stuff</span>
      <button
        className={`cat-btn${active === "bookmarks" ? " active" : ""}`}
        onClick={() => onSelect("bookmarks")}
      >
        <span className="cat-icon">🔖</span>
        Bookmarks
        <span className="cat-count">{bmCount}</span>
      </button>
      {user && (
        <Link href="/dashboard" className="cat-btn" style={{ textDecoration:"none" }}>
          <span className="cat-icon">◈</span>
          My Dashboard
        </Link>
      )}

      <div className="sidebar-divider" />
      <span className="sidebar-label">Sponsored</span>
      <AdBanner variant="sidebar" />
      <AdBanner variant="sidebar" />
    </aside>
  );
}
