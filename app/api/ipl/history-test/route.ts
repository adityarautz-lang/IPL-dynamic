import { kv } from "@vercel/kv";

export async function GET() {
  const data = await kv.get("history-test");
  return Response.json(data || {});
}

export async function PUT(req: Request) {
  const body = await req.json();

  await kv.set("history-test", body);

  return Response.json({ success: true });
}