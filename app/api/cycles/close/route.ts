
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST() {
  if (!(await isLoggedIn())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const d = await db();
    const now = new Date();

    const active = await d.collection("cycles").findOne({
      status: "active",
    });

    if (!active) {
      return NextResponse.json(
        { error: "Tidak ada siklus aktif yang dapat ditutup." },
        { status: 409 },
      );
    }

    const result = await d.collection("cycles").updateOne(
      {
        _id: active._id,
        status: "active",
      },
      {
        $set: {
          status: "closed",
          endDate: now,
          closingReason: "feed-stock-empty",
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { error: "Siklus gagal ditutup." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `${active.name} berhasil ditutup.`,
    });
  } catch (error) {
    console.error("Cycle closing error:", error);

    return NextResponse.json(
      { error: "Gagal menutup siklus." },
      { status: 500 },
    );
  }
}
