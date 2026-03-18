"use client";
import { useState } from "react";

const PLAT = [
  { id:"fb",  label:"Facebook",  color:"#1877F2", icon:"f",  url:(u,t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}&quote=${encodeURIComponent(t)}` },
  { id:"tw",  label:"X/Twitter", color:"#AAAAAA", icon:"𝕏",  url:(u,t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id:"th",  label:"Threads",   color:"#FFFFFF", icon:"@",  url:(u,t) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t+" "+u)}` },
  { id:"rd",  label:"Reddit",    color:"#FF4500", icon:"R",  url:(u,t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { id:"li",  label:"LinkedIn",  color:"#0A66C2", icon:"in", url:(u,t) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { id:"wa",  label:"WhatsApp",  color:"#25D366", icon:"W",  url:(u,t) => `https://wa.me/?text=${encodeURIComponent(t+" "+u)}` },
  { id:"tg",  label:"Telegram",  color:"#26A5E4", icon:"T",  url:(u,t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id:"pi",  label:"Pinterest", color:"#E60023", icon:"P",  url:(u,t) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(t)}` },
  { id:"md",  label:"Medium",    color:"#FFFFFF", icon:"M",  url: null, copy: true },
  { id:"ig",  label:"Instagram", color:"#E1306C", icon:"Ig", url: null, copy: true },
];
const LIGHT_ICO = ["#FFFFFF", "#AAAAAA"];

export default function SocialShare({ url, title }) {
  const [copied, setCopied] = useState(false);
  const href = typeof window !== "undefined" ? (url || window.location.href) : url;

  function copyLink() {
    navigator.clipboard.writeText(href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  function share(p) {
    if (p.copy) { copyLink(); return; }
    const u = p.url(href, title);
    if (u) window.open(u, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  return (
    <div className="share-sec">
      <div className="share-title">↗ Share this</div>
      <div className="share-grid">
        {PLAT.map((p) => (
          <button key={p.id} className="sh-btn" style={{ "--shc": p.color }} onClick={() => share(p)}>
            <span className="sh-ico" style={{ background: p.color, color: LIGHT_ICO.includes(p.color) ? "#000" : "#fff" }}>
              {p.icon}
            </span>
            {p.label}
            {p.copy && <span style={{ fontSize: 10, opacity: .5 }}> (copy)</span>}
          </button>
        ))}
        <button className={`copy-btn${copied ? " done" : ""}`} onClick={copyLink}>
          <span>{copied ? "✓" : "◫"}</span>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
