"use client";
const V = {
  leaderboard: { cls: "ad-wrap leaderboard", icon: "📢", label: "728×90 — Leaderboard Ad" },
  inline:      { cls: "ad-wrap inline",      icon: "📰", label: "Inline Content Ad"       },
  rectangle:   { cls: "ad-wrap rectangle",   icon: "🔲", label: "300×250 — Rectangle Ad"  },
  sidebar:     { cls: "ad-wrap sidebar-slot", icon: "📌", label: "Sidebar Ad"              },
};
// ── Replace each return with your real AdSense <ins> tag after approval ──
// return <ins className="adsbygoogle" style={{display:"block"}}
//   data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXXXX"
//   data-ad-format="auto" data-full-width-responsive="true" />;
export default function AdBanner({ variant = "leaderboard" }) {
  const v = V[variant] || V.leaderboard;
  return (
    <div className={v.cls} aria-label="Advertisement">
      <span className="ad-badge">AD</span>
      <span style={{ fontSize: 20, opacity: .3 }}>{v.icon}</span>
      <span>{v.label}</span>
    </div>
  );
}
