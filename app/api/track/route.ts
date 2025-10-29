import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pathname } = await request.json();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/pageviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ path: pathname }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Tracking error:", err);
    return NextResponse.json({ success: false });
  }
}
