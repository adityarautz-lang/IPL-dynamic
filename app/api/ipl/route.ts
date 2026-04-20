import fs from "fs";

const FILE = "/tmp/data.json";

// GET → frontend reads data
export async function GET() {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    return Response.json(JSON.parse(data));
  } catch {
    return Response.json({ leaders: [], updatedAt: null });
  }
}

// POST → scraper sends data
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.leaders || !Array.isArray(body.leaders)) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    fs.writeFileSync(FILE, JSON.stringify(body));

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}