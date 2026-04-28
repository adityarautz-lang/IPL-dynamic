let localViews = 0;

export async function GET() {
  try {
    // ✅ Only use KV if env exists (production)
    if (process.env.KV_REST_API_URL) {
      const { kv } = await import("@vercel/kv");
      const views = await kv.incr("page_views");
      return Response.json({ views });
    }
  } catch (err) {
    console.log("KV failed, fallback to local:", err);
  }

  // ✅ Local fallback (dev)
  localViews += 1;

  return new Response(JSON.stringify({ views: localViews }), {
    headers: { "Content-Type": "application/json" },
  });
}