"use client";

import { formatDateTime, formatRupiah } from "@/lib/format";
import { Fragment, useEffect, useState } from "react";

export default function Records({
  collection,
  labels,
}: {
  collection: string;
  labels?: Record<string, string>;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const [productions, setProductions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [detailBusy, setDetailBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editColony, setEditColony] = useState("");
  const [editCount, setEditCount] = useState("");
  const [colonies, setColonies] = useState<any[]>([]);
  const [editBusy, setEditBusy] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  async function load() {
    setBusy(true);

    const r = await fetch("/api/data/" + collection);
    setRows(r.ok ? await r.json() : []);

    setBusy(false);
  }

  useEffect(() => {
    load();

    function handleDataSaved(event: Event) {
      const customEvent = event as CustomEvent<{ collection: string }>;

      if (customEvent.detail?.collection === collection) {
        load();
      }
    }

    window.addEventListener("data-saved", handleDataSaved);

    return () => {
      window.removeEventListener("data-saved", handleDataSaved);
    };
  }, [collection]);

  useEffect(() => {
    if (collection !== "eggProductions") return;

    async function loadColonies() {
      try {
        const r = await fetch("/api/data/colonies");

        if (r.ok) {
          setColonies(await r.json());
        }
      } catch (error) {
        console.error("Gagal memuat koloni:", error);
      }
    }

    loadColonies();
  }, [collection]);

  function startEdit(row: any) {
    setEditingId(String(row._id));
    setEditDate(String(row.date || "").slice(0, 10));
    setEditColony(row.colonyName || "");
    setEditCount(String(row.count ?? ""));
    setEditMsg("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditMsg("");
  }

  async function saveEdit(id: string) {
    setEditBusy(true);
    setEditMsg("");

    try {
      const r = await fetch("/api/data/" + collection, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          date: editDate,
          colonyName: editColony,
          count: Number(editCount),
        }),
      });

      const result = await r.json();

      if (!r.ok) {
        setEditMsg(result.error || "Gagal memperbarui catatan.");
        return;
      }

      setEditingId(null);

      await load();

      window.dispatchEvent(
        new CustomEvent("data-saved", {
          detail: { collection },
        }),
      );
    } catch (error) {
      console.error(error);
      setEditMsg("Terjadi kesalahan saat memperbarui data.");
    } finally {
      setEditBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Hapus data ini?")) return;

    const r = await fetch("/api/data/" + collection, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });

    if (r.ok) {
      await load();

      window.dispatchEvent(
        new CustomEvent("data-saved", {
          detail: { collection },
        }),
      );
    }
  }

  async function toggleCycle(cycle: any) {
    const id = String(cycle._id);

    if (expandedCycle === id) {
      setExpandedCycle(null);
      return;
    }

    setExpandedCycle(id);
    setDetailBusy(true);

    try {
      const [p, e] = await Promise.all([
        fetch("/api/data/eggProductions"),
        fetch("/api/data/expenses"),
      ]);

      const productionData = p.ok ? await p.json() : [];
      const expenseData = e.ok ? await e.json() : [];

      setProductions(
        productionData.filter((row: any) => String(row.cycleId) === id),
      );

      setExpenses(
        expenseData.filter((row: any) => String(row.cycleId) === id),
      );
    } catch {
      setProductions([]);
      setExpenses([]);
    } finally {
      setDetailBusy(false);
    }
  }

  const cols = rows.length
    ? Object.keys(rows[0])
        .filter(
          (k) =>
            !["_id", "createdAt", "updatedAt", "cycleId"].includes(k),
        )
        .slice(0, 6)
    : [];

  return (
    <section className="mt-6 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <h2 className="font-semibold text-brand-900">Data tersimpan</h2>

      {busy ? (
        <p className="mt-3 text-sm text-stone-500">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">Belum ada data.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th className="p-2 capitalize text-stone-500" key={c}>
                    {labels?.[c] || c}
                  </th>
                ))}
                <th className="p-2 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <Fragment key={row._id}>
                  <tr className="border-t border-stone-100">
                    {cols.map((c) => (
                      <td className="p-2" key={c}>
                        {typeof row[c] === "object" && row[c] !== null
                          ? JSON.stringify(row[c])
                          : c.toLowerCase().includes("date")
                            ? formatDateTime(row[c])
                            : c === "amount"
                              ? formatRupiah(row[c])
                              : String(row[c] ?? "")}
                      </td>
                    ))}

                    <td className="p-2 text-right whitespace-nowrap">
                      {collection === "cycles" && (
                        <button
                          className="mr-3 text-brand-700"
                          onClick={() => toggleCycle(row)}
                        >
                          {expandedCycle === String(row._id)
                            ? "Tutup detail"
                            : "Detail"}
                        </button>
                      )}

                      {collection === "eggProductions" && (
                        <button
                          className="mr-3 text-brand-700"
                          onClick={() => startEdit(row)}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        className="text-red-600"
                        onClick={() => del(row._id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>

                  {collection === "eggProductions" &&
                    editingId === String(row._id) && (
                      <tr>
                        <td colSpan={cols.length + 1} className="bg-stone-50 p-4">
                          <div className="space-y-3">
                            <h3 className="font-semibold text-brand-900">
                              Edit Catatan Produksi
                            </h3>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <label className="text-sm font-medium">
                                Tanggal
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) =>
                                    setEditDate(e.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
                                />
                              </label>

                              <label className="text-sm font-medium">
                                Koloni
                                <select
                                  value={editColony}
                                  onChange={(e) =>
                                    setEditColony(e.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
                                >
                                  <option value="" disabled>
                                    Pilih koloni
                                  </option>

                                  {colonies.map((colony: any) => (
                                    <option
                                      key={colony._id}
                                      value={colony.name}
                                    >
                                      {colony.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="text-sm font-medium">
                                Jumlah telur
                                <input
                                  type="number"
                                  min="0"
                                  value={editCount}
                                  onChange={(e) =>
                                    setEditCount(e.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
                                />
                              </label>
                            </div>

                            {editMsg && (
                              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {editMsg}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => saveEdit(String(row._id))}
                                disabled={editBusy}
                                className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                              >
                                {editBusy ? "Menyimpan…" : "Simpan perubahan"}
                              </button>

                              <button
                                onClick={cancelEdit}
                                disabled={editBusy}
                                className="rounded-xl border border-stone-200 px-4 py-2"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                  {collection === "cycles" &&
                    expandedCycle === String(row._id) && (
                      <tr>
                        <td
                          colSpan={cols.length + 1}
                          className="bg-stone-50 p-4"
                        >
                          {detailBusy ? (
                            <p className="text-sm text-stone-500">
                              Memuat detail…
                            </p>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-white border p-3">
                                  <p className="text-xs text-stone-500">
                                    Total Produksi
                                  </p>
                                  <p className="mt-1 font-semibold text-brand-900">
                                    {productions.reduce(
                                      (sum, item) =>
                                        sum + Number(item.count || 0),
                                      0,
                                    )}{" "}
                                    telur
                                  </p>
                                </div>

                                <div className="rounded-xl bg-white border p-3">
                                  <p className="text-xs text-stone-500">
                                    Total Pengeluaran
                                  </p>
                                  <p className="mt-1 font-semibold text-brand-900">
                                    {formatRupiah(
                                      expenses.reduce(
                                        (sum, item) =>
                                          sum + Number(item.amount || 0),
                                        0,
                                      ),
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-white border p-3">
                                  <p className="text-xs text-stone-500">
                                    Jumlah Catatan
                                  </p>
                                  <p className="mt-1 font-semibold text-brand-900">
                                    {productions.length} produksi /{" "}
                                    {expenses.length} pengeluaran
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-medium text-brand-900">
                                  Rincian Pengeluaran
                                </h3>

                                {expenses.length === 0 ? (
                                  <p className="mt-2 text-sm text-stone-500">
                                    Belum ada pengeluaran.
                                  </p>
                                ) : (
                                  <div className="mt-2 space-y-2">
                                    {expenses.map((expense) => (
                                      <div
                                        key={expense._id}
                                        className="flex flex-wrap justify-between gap-2 rounded-lg bg-white border p-3 text-sm"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {expense.description}
                                          </p>
                                          <p className="text-xs text-stone-500">
                                            {expense.category || "Lainnya"} ·{" "}
                                            {formatDateTime(expense.date)}
                                          </p>
                                        </div>

                                        <p className="font-medium">
                                          {formatRupiah(expense.amount)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h3 className="font-medium text-brand-900">
                                  Rincian Produksi
                                </h3>

                                {productions.length === 0 ? (
                                  <p className="mt-2 text-sm text-stone-500">
                                    Belum ada produksi.
                                  </p>
                                ) : (
                                  <div className="mt-2 space-y-2">
                                    {productions.map((production) => (
                                      <div
                                        key={production._id}
                                        className="flex flex-wrap justify-between gap-2 rounded-lg bg-white border p-3 text-sm"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {production.colonyName}
                                          </p>
                                          <p className="text-xs text-stone-500">
                                            {formatDateTime(production.date)}
                                          </p>
                                        </div>

                                        <p className="font-medium">
                                          {production.count} telur
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}