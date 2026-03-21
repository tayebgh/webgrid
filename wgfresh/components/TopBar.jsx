"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../lib/auth";
import AuthModal from "./AuthModal";

export default function TopBar({ query = "", onSearch }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="logo">
          <span className="logo-dot" />Web<em>Zarf</em>
        </Link>

        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search 76+ websites…"
            value={query}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="topbar-right">
          <Link href="/blog" className="nav-link">✦ Blog</Link>

          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">{dark ? "🌙" : "☀️"}</span>
            </span>
          </button>

          {/* Auth area */}
          {user ? (
            <div className="user-menu-wrap">
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu((v) => !v)}
                style={{ background: user.avatarColor || "var(--accent)" }}
                title={user.name}
              >
                {user.avatar}
              </button>

              {showUserMenu && (
                <>
                  <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <div className="user-menu-avatar" style={{ background: user.avatarColor || "var(--accent)" }}>{user.avatar}</div>
                      <div>
                        <div className="user-menu-name">{user.name}</div>
                        <div className="user-menu-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-menu-divider" />
                    <Link href="/dashboard" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                      <span>🔖</span> My Bookmarks
                    </Link>
                    <Link href="/dashboard" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                      <span>⬇</span> Download Bookmarks
                    </Link>
                    <div className="user-menu-divider" />
                    <button className="user-menu-item user-menu-logout" onClick={() => { logout(); setShowUserMenu(false); }}>
                      <span>→</span> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => setShowAuth(true)}>Sign In</button>
          )}

          <button className="btn btn-accent">+ Add Site</button>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

