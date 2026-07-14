import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, eventName, experimentId, variationId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = new Client({
      connectionString: "postgresql://postgres:postgres@localhost:5432/analytics",
    });

    await client.connect();

    if (experimentId && variationId) {
      // Log exposure event
      await client.query(
        "INSERT INTO viewed_experiment (user_id, experiment_id, variation_id) VALUES ($1, $2, $3)",
        [userId, experimentId, variationId]
      );
    } else if (eventName) {
      // Log conversion event
      await client.query(
        "INSERT INTO events (user_id, event_name) VALUES ($1, $2)",
        [userId, eventName]
      );
    }

    await client.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Database log error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
