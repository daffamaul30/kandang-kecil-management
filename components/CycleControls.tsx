"use client";

import { useEffect, useRef, useState } from "react";
import CurrencyInput from "./CurrencyInput";

type Cycle = {
  name: string;
  status: "active" | "closed";
  startDate: string;
  endDate?: string | null;
};

type ExpenseInput = {
  date: string;
  description: string;
  category: string;
  amount: string;
};

function today() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyExpense(): ExpenseInput {
  return {
    date: today(),
    description: "",
    category: "Pakan",
    amount: "",
  };
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  function formatDate(value: string) {
    if (!value) return "";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function parseDate(input: string) {
    const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) return null;

    const [, day, month, year] = match;

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return `${year}-${month}-${day}`;
  }

  function handlePickerChange(date: string) {
    onChange(date);

    if (textRef.current) {
      textRef.current.value = formatDate(date);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={textRef}
        type="text"
        defaultValue={formatDate(value)}
        placeholder="DD/MM/YYYY"
        inputMode="numeric"
        autoComplete="off"
        className="w-full rounded-xl border border-stone-200 bg-white p-3"
        onChange={(e) => {
          const parsed = parseDate(e.target.value);

          if (parsed) {
            onChange(parsed);
          }
        }}
        onBlur={(e) => {
          const parsed = parseDate(e.target.value);

          if (parsed) {
            onChange(parsed);
            e.target.value = formatDate(parsed);
          } else {
            e.target.value = formatDate(value);
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          const picker = pickerRef.current;

          if (!picker) return;

          if (typeof picker.showPicker === "function") {
            picker.showPicker();
          } else {
            picker.click();
          }
        }}
        className="relative flex shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-4"
        aria-label="Pilih tanggal"
      >
        <span className="text-xl">📅</span>

        <input
          ref={pickerRef}
          type="date"
          value={value}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => handlePickerChange(e.target.value)}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      </button>
    </div>
  );
}

export default function CycleControls() {
  const [active, setActive] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState("");

  const [initialExpenses, setInitialExpenses] = useState<ExpenseInput[]>([
    emptyExpense(),
  ]);

  const [extraExpense, setExtraExpense] =
    useState<ExpenseInput>(emptyExpense());

  const [showExtraForm, setShowExtraForm] = useState(false);

  async function loadActiveCycle() {
    try {
      const r = await fetch("/api/cycles/active");
      const data = await r.json();

      if (r.ok) {
        setActive(data.active || null);
      }
    } catch (error) {
      console.error("Load active cycle error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActiveCycle();

    function handleDataSaved(event: Event) {
      const customEvent = event as CustomEvent<{ collection: string }>;

      if (customEvent.detail?.collection === "cycles") {
        loadActiveCycle();
      }
    }

    window.addEventListener("data-saved", handleDataSaved);

    return () => {
      window.removeEventListener("data-saved", handleDataSaved);
    };
  }, []);

  function updateInitialExpense(
    index: number,
    field: keyof ExpenseInput,
    value: string,
  ) {
    setInitialExpenses((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addInitialExpenseRow() {
    setInitialExpenses((prev) => [...prev, emptyExpense()]);
  }

  function removeInitialExpenseRow(index: number) {
    setInitialExpenses((prev) => prev.filter((_, i) => i !== index));
  }

  async function startCycle() {
    const validExpenses = initialExpenses.filter(
      (e) => e.description.trim() && e.amount && Number(e.amount) > 0,
    );

    if (validExpenses.length === 0) {
      setMsg("Masukkan minimal satu pengeluaran awal.");
      return;
    }

    if (!confirm("Mulai siklus baru dengan pengeluaran yang telah diisi?")) {
      return;
    }

    setProcessing(true);
    setMsg("");

    try {
      const r = await fetch("/api/cycles/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenses: validExpenses.map((e) => ({
            date: e.date,
            description: e.description.trim(),
            category: e.category,
            amount: Number(e.amount),
          })),
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        setMsg(data.error || "Gagal memulai siklus.");
        return;
      }

      setMsg(data.message || "Siklus berhasil dimulai.");
      setInitialExpenses([emptyExpense()]);

      window.dispatchEvent(
        new CustomEvent("data-saved", {
          detail: { collection: "cycles" },
        }),
      );

      window.dispatchEvent(
        new CustomEvent("data-saved", {
          detail: { collection: "expenses" },
        }),
      );

      await loadActiveCycle();
    } catch (error) {
      console.error("Start cycle error:", error);
      setMsg("Terjadi kesalahan koneksi.");
    } finally {
      setProcessing(false);
    }
  }

  async function saveExtraExpense() {
    if (
      !extraExpense.description.trim() ||
      !extraExpense.amount ||
      Number(extraExpense.amount) <= 0
    ) {
      setMsg("Lengkapi keterangan dan jumlah pengeluaran.");
      return;
    }

    setProcessing(true);
    setMsg("");

    try {
      const r = await fetch("/api/data/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: extraExpense.date,
          description: extraExpense.description.trim(),
          category: extraExpense.category,
          amount: Number(extraExpense.amount),
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        setMsg(data.error || "Gagal menyimpan pengeluaran.");
        return;
      }

      setMsg("Pengeluaran berhasil ditambahkan.");
      setExtraExpense(emptyExpense());
      setShowExtraForm(false);

      window.dispatchEvent(
        new CustomEvent("data-saved", {
          detail: { collection: "expenses" },
        }),
      );
    } catch (error) {
      console.error("Save extra expense error:", error);
      setMsg("Terjadi kesalahan koneksi.");
    } finally {
      setProcessing(false);
    }
  }

  async function closeCycle() {
    if (!confirm("Tutup siklus saat ini karena stok pakan habis?")) {
      return;
    }

    setProcessing(true);
    setMsg("");

    try {
      const r = await fetch("/api/cycles/close", {
        method: "POST",
      });

      const data = await r.json();

      if (!r.ok) {
        setMsg(data.error || "Gagal menutup siklus.");
        return;
      }

      setMsg(data.message || "Siklus berhasil ditutup.");
      setShowExtraForm(false);
      await loadActiveCycle();
    } catch (error) {
      console.error("Close cycle error:", error);
      setMsg("Terjadi kesalahan koneksi.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Memuat status siklus...</p>;
  }

  return (
    <div>
      <h2 className="font-semibold text-brand-900">Manajemen Siklus</h2>

      {active ? (
        <>
          <div className="my-3 rounded-xl bg-green-50 p-4">
            <p className="text-sm text-stone-600">Siklus sedang berjalan</p>
            <p className="font-semibold text-green-800">{active.name}</p>
          </div>

          <p className="my-3 text-sm text-stone-500">
            Catat pengeluaran tambahan selama siklus berjalan, atau tutup siklus
            ketika stok pakan habis.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShowExtraForm(!showExtraForm);
                setMsg("");
              }}
              disabled={processing}
              className="rounded-xl border border-brand-200 px-4 py-3 font-semibold text-brand-700 disabled:opacity-50"
            >
              {showExtraForm ? "Batal" : "Tambah Pengeluaran"}
            </button>

            <button
              onClick={closeCycle}
              disabled={processing}
              className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Stok Pakan Habis"}
            </button>
          </div>

          {showExtraForm && (
            <div className="mt-4 rounded-xl border border-brand-100 p-4">
              <h3 className="mb-3 font-semibold text-brand-900">
                Pengeluaran Tambahan
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm">Tanggal</label>
                  <input
                    type="date"
                    value={extraExpense.date}
                    onChange={(e) =>
                      setExtraExpense({
                        ...extraExpense,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Keterangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pakan tambahan"
                    value={extraExpense.description}
                    onChange={(e) =>
                      setExtraExpense({
                        ...extraExpense,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Kategori</label>
                  <select
                    value={extraExpense.category}
                    onChange={(e) =>
                      setExtraExpense({
                        ...extraExpense,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2"
                  >
                    <option value="Pakan">Pakan</option>
                    <option value="Tambahan">Suplemen / Tambahan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Jumlah (Rp)</label>
                  <CurrencyInput
                    name="amount"
                    value={extraExpense.amount}
                    onValueChange={(value) =>
                      setExtraExpense({
                        ...extraExpense,
                        amount: value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2"
                  />
                </div>

                <button
                  onClick={saveExtraExpense}
                  disabled={processing}
                  className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {processing ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="my-3 rounded-xl bg-amber-50 p-4">
            <p className="text-sm text-stone-600">Belum ada siklus aktif.</p>
          </div>

          <p className="my-3 text-sm text-stone-500">
            Masukkan pengeluaran awal pakan dan kebutuhan lainnya sebelum
            memulai siklus.
          </p>

          <div className="space-y-4">
            {initialExpenses.map((expense, index) => (
              <div
                key={index}
                className="rounded-xl border border-brand-100 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-brand-900">
                    Pengeluaran {index + 1}
                  </h3>

                  {initialExpenses.length > 1 && (
                    <button
                      onClick={() => removeInitialExpenseRow(index)}
                      className="text-sm text-red-600"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm">Tanggal</label>
                    <DateInput
                      value={expense.date}
                      onChange={(value) =>
                        updateInitialExpense(index, "date", value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Keterangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pakan 1 karung"
                      value={expense.description}
                      onChange={(e) =>
                        updateInitialExpense(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-stone-200 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Kategori</label>
                    <select
                      value={expense.category}
                      onChange={(e) =>
                        updateInitialExpense(index, "category", e.target.value)
                      }
                      className="w-full rounded-xl border border-stone-200 px-3 py-2"
                    >
                      <option value="Pakan">Pakan</option>
                      <option value="Tambahan">Suplemen / Tambahan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm">Jumlah (Rp)</label>
                    <CurrencyInput
                      name={`expense-${index}`}
                      value={expense.amount}
                      onValueChange={(value) =>
                        updateInitialExpense(index, "amount", value)
                      }
                      className="w-full rounded-xl border border-stone-200 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addInitialExpenseRow}
            disabled={processing}
            className="mt-3 rounded-xl border border-brand-200 px-4 py-3 font-semibold text-brand-700 disabled:opacity-50"
          >
            + Tambah Pengeluaran
          </button>

          <button
            onClick={startCycle}
            disabled={processing}
            className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Memproses..." : "Konfirmasi & Mulai Siklus"}
          </button>
        </>
      )}

      {msg && <p className="mt-3 text-sm text-stone-700">{msg}</p>}
    </div>
  );
}
