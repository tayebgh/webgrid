import { NextResponse } from "next/server";
import { headers }       from "next/headers";
import { createClient }  from "@supabase/supabase-js";
import { stripe, setUserPro, removeUserPro } from "../../../../lib/stripe";

// Disable Next.js body parsing — Stripe needs the raw body
export const runtime = "nodejs";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req) {
  const body      = await req.text();
  const signature = headers().get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] signature error:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const sbAdmin = getAdmin();

  try {
    switch (event.type) {

      // ── Checkout completed → activate Pro ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const userId       = session.metadata?.supabase_user_id;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        if (userId) {
          await setUserPro(sbAdmin, userId, subscription);
          console.log("[webhook] Pro activated for user:", userId);
        }
        break;
      }

      // ── Subscription updated (renewal, plan change) ────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId       = subscription.metadata?.supabase_user_id;

        if (userId) {
          const isActive = ["active", "trialing"].includes(subscription.status);
          await sbAdmin.from("profiles").update({
            is_pro:                 isActive,
            stripe_subscription_id: subscription.id,
            stripe_price_id:        subscription.items.data[0]?.price?.id,
            subscription_status:    subscription.status,
            current_period_end:     new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq("id", userId);
        }
        break;
      }

      // ── Subscription deleted / canceled ───────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await removeUserPro(sbAdmin, subscription.id);
        console.log("[webhook] Pro removed for subscription:", subscription.id);
        break;
      }

      // ── Invoice payment failed ─────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await sbAdmin.from("profiles").update({
            subscription_status: "past_due",
          }).eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      default:
        // Unhandled event type — log and ignore
        console.log("[webhook] unhandled event:", event.type);
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
