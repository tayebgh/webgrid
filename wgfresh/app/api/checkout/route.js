import { NextResponse } from "next/server";
import { createClient }  from "@supabase/supabase-js";
import { stripe, getOrCreateCustomer, createCheckoutSession } from "../../../lib/stripe";

export async function POST(req) {
  try {
    // 1. Auth — verify the user via Supabase service role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await sbAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Get or create a Stripe customer for this user
    const customerId = await getOrCreateCustomer(
      user.id,
      user.email,
      user.user_metadata?.name || user.email,
      sbAdmin
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Create Checkout session
    const session = await createCheckoutSession({
      customerId,
      userId:     user.id,
      email:      user.email,
      successUrl: `${appUrl}/dashboard`,
      cancelUrl:  `${appUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
