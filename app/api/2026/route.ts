import getDb from "@/app/lib/useDb";
import { NextResponse } from "next/server";
import { broadcast } from "@/app/server/wsServer";

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ✅ GET
export async function GET() {
  try {
    const db = await getDb();

    const data = await db.collection("ipl").findOne({ type: "dashboard" });

    // ✅ correct null check
    if (!data) {
      return errorResponse("No data found", 404);
    }

    // ✅ return RAW data (matches your frontend)
    return NextResponse.json(data, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("GET /api error:", error);
    return errorResponse("Failed to fetch data", 500);
  }
}

// ✅ POST
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return errorResponse("Invalid payload", 400);
    }

    const db = await getDb();

    const result = await db.collection("ipl").updateOne(
      { type: "dashboard" },
      {
        $set: {
          ...body,
          type: "dashboard", // ✅ ensure consistency
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    broadcast(body);
    return NextResponse.json(
      {
        success: true,
        acknowledged: result.acknowledged,
        upsertedId: result.upsertedId ?? null,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }, // ✅ use 200 (update or insert)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("POST /api error:", error);

    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON body", 400);
    }

    return errorResponse("Failed to insert/update data", 500);
  }
}
