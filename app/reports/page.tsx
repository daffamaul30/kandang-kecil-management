"use client";

import { useEffect, useRef, useState } from "react";
import Page from "@/components/layout/Page";
import { Download } from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/format";

type Cycle = {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string | null;
};

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
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
    <div>
      <label className="mb-1 block text-sm">{label}</label>

      <div className="flex gap-2">
        <input
          ref={textRef}
          type="text"
          defaultValue={formatDate(value)}
          placeholder="DD/MM/YYYY"
          inputMode="numeric"
          autoComplete="off"
          className="w-full rounded-lg border p-2"
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
          className="relative flex shrink-0 items-center justify-center rounded-lg border bg-white px-3"
          aria-label={`Pilih tanggal ${label}`}
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
    </div>
  );
}

export default function Reports() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [prod, setProd] = useState<any[]>([]);
  const [cost, setCost] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // Ambil daftar siklus
  useEffect(() => {
    async function loadCycles() {
      try {
        const r = await fetch("/api/data/cycles");
        const data = r.ok ? await r.json() : [];

        setCycles(data);

        const active = data.find((c: Cycle) => c.status === "active");

        if (active) {
          setSelectedCycle(active._id);
        } else if (data.length > 0) {
          setSelectedCycle(data[0]._id);
        }
      } catch (error) {
        console.error("Gagal memuat siklus:", error);
      }
    }

    loadCycles();
  }, []);

  // Tanggal default berdasarkan transaksi dalam siklus
  useEffect(() => {
    async function setCycleDateRange() {
      if (!selectedCycle || cycles.length === 0) return;

      try {
        const [p, e] = await Promise.all([
          fetch("/api/data/eggProductions"),
          fetch("/api/data/expenses"),
        ]);

        const productionData = p.ok ? await p.json() : [];
        const expenseData = e.ok ? await e.json() : [];

        const cycleProduction = productionData.filter(
          (x: any) => String(x.cycleId) === selectedCycle,
        );

        const cycleExpenses = expenseData.filter(
          (x: any) => String(x.cycleId) === selectedCycle,
        );

        const dates = [
          ...cycleProduction.map((x: any) => x.date),
          ...cycleExpenses.map((x: any) => x.date),
        ]
          .filter(Boolean)
          .map((date: string) => date.slice(0, 10))
          .sort();

        if (dates.length > 0) {
          setFrom(dates[0]);
          setTo(dates[dates.length - 1]);
        } else {
          const cycle = cycles.find((c) => c._id === selectedCycle);

          if (cycle) {
            const today = new Date().toLocaleDateString("en-CA");

            setFrom(cycle.startDate.slice(0, 10));
            setTo(
              cycle.status === "active"
                ? today
                : (cycle.endDate || cycle.startDate).slice(0, 10),
            );
          }
        }
      } catch (error) {
        console.error("Gagal menentukan rentang tanggal laporan:", error);
      }
    }

    setCycleDateRange();
  }, [selectedCycle, cycles]);

  // Ambil data berdasarkan siklus dan tanggal
  useEffect(() => {
    async function load() {
      if (!selectedCycle || !from || !to) {
        setProd([]);
        setCost([]);
        return;
      }

      setBusy(true);

      try {
        const [p, e] = await Promise.all([
          fetch("/api/data/eggProductions"),
          fetch("/api/data/expenses"),
        ]);

        const productionData = p.ok ? await p.json() : [];
        const expenseData = e.ok ? await e.json() : [];

        setProd(
          productionData.filter(
            (x: any) =>
              String(x.cycleId) === selectedCycle &&
              x.date >= from &&
              x.date <= to,
          ),
        );

        setCost(
          expenseData.filter(
            (x: any) =>
              String(x.cycleId) === selectedCycle &&
              x.date >= from &&
              x.date <= to,
          ),
        );
      } catch (error) {
        console.error("Gagal memuat laporan:", error);
        setProd([]);
        setCost([]);
      } finally {
        setBusy(false);
      }
    }

    load();
  }, [selectedCycle, from, to]);

  // Perhitungan statistik
  const eggs = prod.reduce((a, x) => a + Number(x.count || 0), 0);

  const feed = cost
    .filter((x) => x.category === "Pakan")
    .reduce((a, x) => a + Number(x.amount || 0), 0);

  const addon = cost
    .filter((x) => x.category !== "Pakan")
    .reduce((a, x) => a + Number(x.amount || 0), 0);

  const tot = feed + addon;

  const colonies = Array.from(
    new Set(prod.map((x) => x.colonyName || "Koloni")),
  );

  const daily = Array.from(new Set(prod.map((x) => x.date))).sort();

  // CSV helper
  function csvEscape(value: any) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  // Export CSV
  function exportCSV() {
    const cycleName =
      cycles.find((c) => c._id === selectedCycle)?.name || "Siklus";

    const csv = [
      `Laporan ${csvEscape(cycleName)}`,
      "",
      "Tanggal,Koloni,Telur",
      ...prod.map(
        (x) =>
          `${csvEscape(x.date)},${csvEscape(x.colonyName)},${csvEscape(x.count)}`,
      ),
      "",
      "Tanggal,Kategori,Keterangan,Nominal",
      ...cost.map(
        (x) =>
          `${csvEscape(x.date)},${csvEscape(x.category)},${csvEscape(x.description)},${csvEscape(x.amount)}`,
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kandang-kecil-${cycleName.replace(/\s+/g, "-")}.csv`;
    a.click();

    URL.revokeObjectURL(a.href);
  }

  const selectedCycleData = cycles.find((c) => c._id === selectedCycle);

  return (
    <Page>
      <h1 className="text-3xl font-bold text-brand-900">Laporan</h1>

      <p className="mt-1 text-stone-500">
        Analisis produksi dan pengeluaran berdasarkan siklus.
      </p>

      {/* Filter */}
      <section className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm">Siklus</label>

          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="min-w-48 rounded-lg border p-2"
          >
            <option value="">Pilih siklus</option>

            {cycles.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.status === "active" ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>

        <DateFilter label="Dari" value={from} onChange={setFrom} />

        <DateFilter label="Sampai" value={to} onChange={setTo} />

        <button
          onClick={exportCSV}
          disabled={!selectedCycle}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-white disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </section>

      {selectedCycleData && (
        <p className="mt-3 text-sm text-stone-500">
          Menampilkan laporan {selectedCycleData.name}
          {selectedCycleData.status === "active" ? " (Aktif)" : " (Selesai)"}
        </p>
      )}

      {busy && <p className="mt-3 text-sm text-stone-500">Memuat laporan...</p>}

      {!selectedCycle && cycles.length === 0 && (
        <p className="mt-4 text-sm text-stone-500">
          Belum ada siklus yang tercatat.
        </p>
      )}

      {/* Statistik */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total telur" value={formatNumber(eggs)} />

        <Stat label="Pengeluaran pakan" value={formatRupiah(feed)} />

        <Stat label="Pengeluaran add-on" value={formatRupiah(addon)} />

        <Stat label="Total pengeluaran" value={formatRupiah(tot)} />
      </div>

      {/* Produksi dan koloni */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">Produksi harian</h2>

          {daily.length === 0 && (
            <p className="mt-3 text-sm text-stone-400">
              Belum ada data produksi.
            </p>
          )}

          {daily.map((d) => {
            const dailyEggs = prod
              .filter((x) => x.date === d)
              .reduce((s, x) => s + Number(x.count || 0), 0);

            const percentage = Math.max(
              3,
              (dailyEggs / Math.max(1, eggs)) * 100,
            );

            return (
              <div key={d} className="mt-3">
                <div className="flex justify-between text-sm">
                  <span>{d}</span>
                  <b>{formatNumber(dailyEggs)} telur</b>
                </div>

                <div className="mt-1 h-2 rounded bg-stone-100">
                  <div
                    className="h-2 rounded bg-brand-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold">Per koloni</h2>

          {colonies.length === 0 && (
            <p className="mt-3 text-sm text-stone-400">
              Belum ada data koloni.
            </p>
          )}

          {colonies.map((c) => {
            const colonyEggs = prod
              .filter((x) => (x.colonyName || "Koloni") === c)
              .reduce((s, x) => s + Number(x.count || 0), 0);

            return (
              <div className="mt-3 flex justify-between border-b py-2" key={c}>
                <span>{c}</span>
                <b>{formatNumber(colonyEggs)} telur</b>
              </div>
            );
          })}
        </section>
      </div>

      {/* Simulasi margin */}
      <section className="mt-5 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Simulasi margin</h2>

        <p className="mt-2">
          @ Rp2.500/egg: <b>{formatRupiah(eggs * 2500 - tot)}</b>
        </p>

        <p className="mt-2">
          @ Rp3.000/egg: <b>{formatRupiah(eggs * 3000 - tot)}</b>
        </p>

        <p className="mt-3 text-xs text-stone-400">
          Simulasi sederhana nilai telur dikurangi pengeluaran tercatat, bukan
          laba akuntansi.
        </p>
      </section>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>

      <p className="mt-2 text-xl font-bold text-brand-900">{value}</p>
    </section>
  );
}
