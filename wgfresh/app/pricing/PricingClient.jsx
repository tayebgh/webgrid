"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";
import { PLANS } from "../../lib/stripe";
import TopBar from "../../components/TopBar";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { getSupabaseBrowser } from "../../lib/supabase";

export default function PricingClient() {
  const { user } = useAuth();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    if (!user) { setShowAuth(true); return; }
    setError("");
    setLoadingCheckout(true);
    try {
      // Get the current session token
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      window.location.href = url; // redirect to Stripe Checkout
    } catch (err) {
      setError(err.message);
      setLoadingCheckout(false);
    }
  }

  const freePlan = PLANS.free;
  const proPlan  = PLANS.pro;

  return (
    <div className="layout">
      <TopBar />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <div style={{ paddingTop: "var(--topbar-h)", flex: 1 }}>
        <div className="pricing-wrap">

          {/* Header */}
          <div className="pricing-header">
            <h1 className="pricing-title">Simple, transparent pricing</h1>
            <p className="pricing-sub">
              Start free. Upgrade when you need more — no hidden fees, cancel anytime.
            </p>
          </div>

          {/* Cards */}
          <div className="pricing-grid">

            {/* Free */}
            <div className="plan-card">
              <div className="plan-name">{freePlan.name}</div>
              <div className="plan-price">{freePlan.priceLabel}</div>
              <div className="plan-desc">Everything you need to get started.</div>
              <ul className="plan-features">
                {freePlan.features.map((f) => (
                  <li key={f}><span className="plan-check">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/" className="plan-cta plan-cta-ghost">{freePlan.cta}</Link>
            </div>

            {/* Pro */}
            <div className="plan-card plan-card-pro">
              <div className="plan-badge">Most Popular</div>
              <div className="plan-name">{proPlan.name}</div>
              <div className="plan-price-wrap">
                <span className="plan-price-big">$7</span>
                <span className="plan-price-period">/ month</span>
              </div>
              <div className="plan-desc">For power users who want everything.</div>
              <ul className="plan-features">
                {proPlan.features.map((f) => (
                  <li key={f}><span className="plan-check plan-check-pro">✓</span>{f}</li>
                ))}
              </ul>

              {error && <div className="plan-error">⚠ {error}</div>}

              {user?.isPro ? (
                <div className="plan-cta-active">✦ You're on Pro</div>
              ) : (
                <button
                  className="plan-cta plan-cta-pro"
                  onClick={handleUpgrade}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? "Redirecting…" : proPlan.cta}
                </button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="pricing-faq">
            <h2 className="faq-title">Frequently asked questions</h2>
            <div className="faq-grid">
              {[
                ["Can I cancel anytime?", "Yes — cancel from your dashboard with one click. You keep Pro access until the end of your billing period."],
                ["What payment methods are accepted?", "All major credit and debit cards via Stripe. Your payment info is never stored on our servers."],
                ["What happens to my bookmarks if I cancel?", "Your bookmarks stay saved. Free plan limits apply, but you keep everything you saved while Pro."],
                ["Do you offer refunds?", "Yes — if you're not satisfied within the first 7 days, contact us for a full refund."],
                ["Is there a team or family plan?", "Not yet — but it's on our roadmap. Sign up for Pro and you'll be first to know."],
                ["How does the free plan work?", "Free forever. Save up to 20 bookmarks, browse all 76+ websites, use dark/light mode."],
              ].map(([q, a]) => (
                <div key={q} className="faq-item">
                  <div className="faq-q">{q}</div>
                  <div className="faq-a">{a}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
