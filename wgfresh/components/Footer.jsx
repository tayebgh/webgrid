"use client";
import Link from "next/link";

const COLS = {
  Directory: [
    { l: "All Websites",    h: "/" },
    { l: "Social Media",    h: "/?cat=social" },
    { l: "Search Engines",  h: "/?cat=search" },
    { l: "News",            h: "/?cat=news" },
    { l: "Entertainment",   h: "/?cat=entertainment" },
    { l: "Shopping",        h: "/?cat=shopping" },
  ],
  "Tech & Work": [
    { l: "Tech & Dev",    h: "/?cat=tech" },
    { l: "Work & Tools",  h: "/?cat=work" },
    { l: "Education",     h: "/?cat=education" },
    { l: "Finance",       h: "/?cat=finance" },
    { l: "Travel",        h: "/?cat=travel" },
    { l: "Health",        h: "/?cat=health" },
  ],
  Blog: [
    { l: "All Articles",    h: "/blog" },
    { l: "Social Media",    h: "/blog" },
    { l: "Search",          h: "/blog" },
    { l: "Entertainment",   h: "/blog" },
    { l: "Work Tools",      h: "/blog" },
    { l: "Tech & Dev",      h: "/blog" },
  ],
  Company: [
    { l: "About WebGrid",   h: "/" },
    { l: "Pricing",         h: "/pricing" },
    { l: "Submit a Site",   h: "/" },
    { l: "Advertise",       h: "/" },
    { l: "Privacy Policy",  h: "/" },
    { l: "Contact",         h: "/" },
  ],
};

const SOCIALS = [
  { i: "𝕏", h: "https://x.com" },
  { i: "R", h: "https://reddit.com" },
  { i: "f", h: "https://facebook.com" },
  { i: "@", h: "https://threads.net" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="footer-logo-dot" />web<em>grid</em>
          </Link>
          <p className="footer-tagline">
            The Internet, Organized.<br />
            76+ top websites across 11 categories — all in one place.
          </p>
          <div className="footer-socials">
            {SOCIALS.map((s, i) => (
              <a key={i} href={s.h} target="_blank" rel="noopener noreferrer" className="f-social">{s.i}</a>
            ))}
          </div>
        </div>

        {Object.entries(COLS).map(([heading, links]) => (
          <div key={heading}>
            <div className="footer-col-heading">{heading}</div>
            <ul className="footer-col-list">
              {links.map((l) => (
                <li key={l.l}><Link href={l.h} className="f-link">{l.l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© {year} WebGrid. All rights reserved.</span>
        <span className="footer-made">Built with Next.js · Deployed on Vercel</span>
        <div className="footer-bl">
          <Link href="/" className="f-link">Privacy</Link>
          <Link href="/" className="f-link">Terms</Link>
          <Link href="/" className="f-link">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
