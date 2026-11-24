
"use client";

import { useState } from "react";
import { Wheat, Power, HandHelping, LoaderCircle } from "lucide-react";

export default function AutomaticFeederPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFeed = async () => {
    setLoading(true);
    setMessage("");

    // Placeholder sebelum integrasi ESP32
    await new Promise((resolve) => setTimeout(resolve, 800));

    setMessage(
      "Kontrol pemberian pakan belum terhubung ke perangkat ESP32."
    );

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-orange-50 p-3 text-orange-700">
            <Wheat size={24} />
          </span>

          <div>
            <h2 className="text-2xl font-bold text-brand-900">
              Automatic Feeder
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Pantau sisa pakan dan riwayat pemberian pakan.
            </p>
          </div>
        </div>
      </header>

      {/* STATUS PERANGKAT */}
      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-stone-100 p-3 text-stone-500">
            <Power size={22} />
          </span>

          <div>
            <h3 className="font-semibold text-brand-900">
              Status Perangkat
            </h3>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-stone-400" />

              <p className="text-sm text-stone-500">
                Belum terhubung
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PEMBERIAN PAKAN MANUAL */}
      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-brand-900">
              Pemberian Pakan Manual
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Jalankan pemberian pakan langsung melalui website.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFeed}
            disabled={loading}
            title="Beri Pakan Sekarang"
            aria-label="Beri Pakan Sekarang"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <HandHelping size={22} />
            )}
          </button>
        </div>

        {message && (
          <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
            {message}
          </p>
        )}
      </section>

      {/* SISA PAKAN */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((wadah) => (
          <section
            key={wadah}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brand-900">
                Wadah {wadah}
              </h3>

              <span className="rounded-xl bg-orange-50 p-2 text-orange-700">
                <Wheat size={20} />
              </span>
            </div>

            <p className="mt-5 text-sm text-stone-500">
              Sisa pakan
            </p>

            <p className="mt-1 text-3xl font-bold text-brand-900">
              --%
            </p>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: "0%" }}
              />
            </div>

            <p className="mt-3 text-xs text-stone-400">
              Data sensor belum terhubung.
            </p>
          </section>
        ))}
      </div>

      {/* RIWAYAT PEMBERIAN PAKAN */}
      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <h3 className="font-semibold text-brand-900">
          Riwayat Pemberian Pakan
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          Catatan pemberian pakan dari automatic feeder.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-3 pr-4">Tanggal</th>
                <th className="py-3 pr-4">Waktu</th>
                <th className="py-3 pr-4">Wadah</th>
                <th className="py-3 text-right">Jumlah</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-stone-400"
                >
                  Riwayat pemberian pakan akan ditampilkan di sini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
