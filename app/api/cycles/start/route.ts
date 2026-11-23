
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const expenses = body.expenses;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: "Masukkan minimal satu pengeluaran awal." },
        { status: 400 }
      );
    }

    for (const expense of expenses) {
      if (
        !expense.description ||
        !expense.date ||
        !Number.isFinite(Number(expense.amount)) ||
        Number(expense.amount) <= 0
      ) {
        return NextResponse.json(
          { error: "Data pengeluaran awal tidak valid." },
          { status: 400 }
        );
      }
    }

    const d = await db();

    // Pastikan belum ada siklus aktif
    const active = await d.collection("cycles").findOne({
      status: "active",
    });

    if (active) {
      return NextResponse.json(
        { error: `${active.name} masih aktif.` },
        { status: 409 }
      );
    }

    const now = new Date();
    const count = await d.collection("cycles").countDocuments();
    const cycleName = `Siklus ${count + 1}`;

    // Buat siklus
    const cycleResult = await d.collection("cycles").insertOne({
      name: cycleName,
      status: "active",
      startDate: now,
      endDate: null,
      createdAt: now,
    });

    const cycleId = String(cycleResult.insertedId);

    // Simpan pengeluaran awal yang terhubung ke siklus
    const expenseRecords = expenses.map((expense: any) => ({
      description: String(expense.description),
      amount: Number(expense.amount),
      date: expense.date,
      category: expense.category || "Pakan",
      cycleId,
      cycleName,
      createdAt: now,
    }));

    await d.collection("expenses").insertMany(expenseRecords);

    return NextResponse.json({
      ok: true,
      cycleId,
      message: `${cycleName} berhasil dimulai.`,
    });
  } catch (error) {
    console.error("Start cycle error:", error);

    return NextResponse.json(
      { error: "Gagal memulai siklus." },
      { status: 500 }
    );
  }
}
