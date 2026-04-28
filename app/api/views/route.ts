export const runtime = "nodejs";

let localViews = 0;

export async function GET() {
  // 🔹 Local fallback always available
  const useKV = !!process.env.KV_REST_API_URL;

  if (useKV) {
    try {
      // 👇 Avoid TS build error by using eval (runtime-only import)
      const kvModule = await eval('import("@vercel/kv")');
      const views = await kvModule.kv.incr("page_views");

      return new Response(JSON.stringify({ views }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log("KV failed, falling back to local:", err);
    }
  }

  // 🔹 Fallback (dev or KV failure)
  localViews += 1;

  return new Response(JSON.stringify({ views: localViews }), {
    headers: { "Content-Type": "application/json" },
  });
}