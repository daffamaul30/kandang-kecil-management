import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const allowed = [
  "colonies",
  "eggProductions",
  "expenses",
  "cycles",
  "feeders",
  "feederSchedules",
  "feederLogs",
  "settings",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  const d = await db();

  const rows = await d
    .collection(collection)
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  return NextResponse.json(
    rows.map((x) => ({ ...x, _id: String(x._id) })),
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const d = await db();
    const now = new Date();

    const active = await d.collection("cycles").findOne({
      status: "active",
    });

    if (["eggProductions", "expenses"].includes(collection) && !active) {
      return NextResponse.json(
        { error: "Tidak ada siklus aktif." },
        { status: 409 },
      );
    }

    if (collection === "eggProductions") {
      const date = String(body.date || "");
      const colonyName = String(body.colonyName || "").trim();
      const count = Number(body.count);

      if (!date || !colonyName || !Number.isFinite(count) || count < 0) {
        return NextResponse.json(
          { error: "Tanggal, koloni, dan jumlah telur harus valid." },
          { status: 400 },
        );
      }

      const cycleId = String(active!._id);
      const cycleName = active!.name;

      // Cari catatan produksi dengan siklus, tanggal, dan koloni yang sama.
      const existing = await d.collection(collection).findOne({
        cycleId,
        date,
        colonyName,
      });

      if (existing) {
        await d.collection(collection).updateOne(
          { _id: existing._id },
          {
            $set: {
              count,
              updatedAt: now,
            },
          },
        );

        return NextResponse.json({
          ok: true,
          updated: true,
          id: String(existing._id),
          message: "Catatan produksi sebelumnya diperbarui.",
        });
      }

      const result = await d.collection(collection).insertOne({
        date,
        colonyName,
        count,
        cycleId,
        cycleName,
        createdAt: now,
      });

      return NextResponse.json({
        ok: true,
        updated: false,
        id: String(result.insertedId),
        message: "Catatan produksi berhasil disimpan.",
      });
    }

    if (collection === "expenses" && !body.cycleId && active) {
      body.cycleId = String(active._id);
      body.cycleName = active.name;
    }

    if (collection === "colonies") {
      body.active = true;
      body.males = Number(body.males || 0);
      body.females = Number(body.females || 0);
    }

    if (collection === "expenses") {
      body.amount = Number(body.amount || 0);
    }

    body.createdAt = now;

    const result = await d.collection(collection).insertOne(body);

    return NextResponse.json({
      ok: true,
      id: String(result.insertedId),
    });
  } catch (error) {
    console.error("POST data error:", error);

    return NextResponse.json(
      { error: "Data tidak valid" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;

  if (collection !== "eggProductions") {
    return NextResponse.json(
      { error: "Edit tidak diizinkan untuk collection ini." },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();

    const { _id, date, colonyName, count } = body;

    if (!_id || !ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "ID catatan tidak valid." },
        { status: 400 },
      );
    }

    if (
      !date ||
      !colonyName ||
      !Number.isFinite(Number(count)) ||
      Number(count) < 0
    ) {
      return NextResponse.json(
        { error: "Tanggal, koloni, dan jumlah telur harus valid." },
        { status: 400 },
      );
    }

    const d = await db();
    const id = new ObjectId(_id);

    const existing = await d.collection(collection).findOne({
      _id: id,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Catatan produksi tidak ditemukan." },
        { status: 404 },
      );
    }

    // Pastikan tidak ada catatan lain yang memiliki tanggal dan koloni sama
    // dalam siklus yang sama.
    const duplicate = await d.collection(collection).findOne({
      _id: { $ne: id },
      cycleId: existing.cycleId,
      date,
      colonyName: String(colonyName).trim(),
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Tanggal dan koloni tersebut sudah memiliki catatan produksi dalam siklus yang sama.",
        },
        { status: 409 },
      );
    }

    await d.collection(collection).updateOne(
      { _id: id },
      {
        $set: {
          date,
          colonyName: String(colonyName).trim(),
          count: Number(count),
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      ok: true,
      message: "Catatan produksi berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH production error:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui catatan produksi." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;

  if (!allowed.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const { _id } = await req.json();

    if (!_id || !ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const d = await db();

    await d.collection(collection).deleteOne({
      _id: new ObjectId(_id),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 },
    );
  }
}