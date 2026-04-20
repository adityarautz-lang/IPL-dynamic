let latestData: any = {
  updatedAt: null,
  leaders: [],
};

// GET → frontend reads data
export async function GET() {
  console.log("API HIT (LOCAL MODE)");
  return Response.json(latestData);
}

// POST → scraper sends data
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming:", body?.leaders?.length);

    if (!body?.leaders || !Array.isArray(body.leaders)) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    latestData = body;

    console.log("✅ Data stored in memory");

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}