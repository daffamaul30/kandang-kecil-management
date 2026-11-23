
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() {
  if (!(await isLoggedIn())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const d = await db();

    const active = await d.collection("cycles").findOne({
      status: "active",
    });

    return NextResponse.json({
      active: active
        ? {
            name: active.name,
            status: active.status,
            startDate: active.startDate,
            endDate: active.endDate ?? null,
          }
        : null,
    });
  } catch (error) {
    console.error("Get active cycle error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil status siklus." },
      { status: 500 },
    );
  }
}
