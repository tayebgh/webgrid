/**
 * Stripe utilities (server-side only)
 * Import ONLY in API routes / server actions — never in client components.
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
  typescript: false,
});

// ── Plan Configuration ────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free forever",
    features: [
      "Browse 76+ websites",
      "Save up to 20 bookmarks",
      "Dark & light mode",
      "Basic search & filters",
      "Download bookmarks (HTML)",
    ],
    limits: { bookmarks: 20 },
    cta: "Get Started",
    highlighted: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 7,
    priceLabel: "$7 / month",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Everything in Free",
      "Unlimited bookmarks",
      "Custom bookmark categories",
      "Priority support",
      "Early access to new features",
      "Remove ads",
      "✦ Pro badge",
    ],
    limits: { bookmarks: Infinity },
    cta: "Upgrade to Pro",
    highlighted: true,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Create or retrieve a Stripe customer for a user.
 * Stores the customer ID back in the Supabase profiles table.
 */
export async function getOrCreateCustomer(userId, email, name, supabaseAdmin) {
  // Check if customer ID already exists in profiles
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId },
  });

  // Save to Supabase
  await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

/**
 * Create a Stripe Checkout session for the Pro plan.
 */
export async function createCheckoutSession({ customerId, userId, email, successUrl, cancelUrl }) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { supabase_user_id: userId },
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
    allow_promotion_codes: true,
  });
}

/**
 * Create a Stripe Customer Portal session (manage/cancel subscription).
 */
export async function createPortalSession({ customerId, returnUrl }) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Mark a user as Pro in Supabase (called from webhook).
 */
export async function setUserPro(supabaseAdmin, userId, subscription) {
  await supabaseAdmin.from("profiles").update({
    is_pro: true,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    subscription_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  }).eq("id", userId);
}

/**
 * Remove Pro status from a user in Supabase (called from webhook on cancel).
 */
export async function removeUserPro(supabaseAdmin, subscriptionId) {
  await supabaseAdmin.from("profiles").update({
    is_pro: false,
    stripe_subscription_id: null,
    stripe_price_id: null,
    subscription_status: "canceled",
    current_period_end: null,
  }).eq("stripe_subscription_id", subscriptionId);
}
