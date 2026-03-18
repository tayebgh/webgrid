"use client";
import { useState } from "react";
import Link from "next/link";
import { fmtViews } from "../lib/hooks";

export default function WebCard({ link, isBookmarked, onBookmark, views, onVisit }) {
  const [imgErr, setImgErr] = useState(false);
  const fav = `https://www.google.com/s2/favicons?sz=64&domain=${link.url}`;

  function visit(e) {
    e.stopPropagation();
    onVisit(link);
    window.open(`https://${link.url}`, "_blank", "noopener,noreferrer");
  }
  function bm(e) {
    e.stopPropagation();
    onBookmark(link.id);
  }

  return (
    <div className="card" style={{ "--c": link.color }}>
      <div className="card-head">
        <div className="card-logo">
          {!imgErr
            ? <img src={fav} alt={link.title} width={26} height={26} onError={() => setImgErr(true)} />
            : <span className="card-logo-fb" style={{ color: link.color }}>{link.title[0]}</span>}
        </div>
        <button className={`bm-btn${isBookmarked ? " on" : ""}`} onClick={bm} title={isBookmarked ? "Remove bookmark" : "Bookmark"}>
          <span style={{ fontSize: 14 }}>{isBookmarked ? "🔖" : "🏷️"}</span>
        </button>
      </div>

      <div className="card-name">{link.title}</div>
      <div className="card-desc">{link.desc}</div>

      <div className="card-footer">
        <div className="card-views">
          <span className="views-dot" />{fmtViews(views)} views
        </div>
        <div className="card-actions">
          <Link href={`/sites/${link.slug}`} className="card-info" onClick={(e) => e.stopPropagation()}>
            Info
          </Link>
          <button className="card-visit" onClick={visit}>Visit ↗</button>
        </div>
      </div>
    </div>
  );
}
