"use client";

import { useState, ReactNode } from "react";
import {
  CalendarClock,
  SlidersHorizontal,
  History,
  Wifi,
  Cpu,
  Radio,
  Signal,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

type Tab = "schedule" | "settings" | "history" | "device";

export default function AutomaticFeederClient({
  scheduleContent,
}: {
  scheduleContent: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  const tabs = [
    { id: "schedule" as Tab, label: "Jadwal Pakan", icon: CalendarClock },
    {
      id: "settings" as Tab,
      label: "Pengaturan Pakan",
      icon: SlidersHorizontal,
    },
    { id: "history" as Tab, label: "Riwayat", icon: History },
    { id: "device" as Tab, label: "Perangkat", icon: Wifi },
  ];

  const statusBadge = (connected: boolean) => (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        connected
          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
          : "bg-stone-100 text-stone-500 ring-1 ring-stone-200"
      }`}
    >
      {connected ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {connected ? "Terhubung" : "Belum terhubung"}
    </span>
  );

  const sectionHeading = (title: string, description: string) => (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  );

  const infoCard = (icon: ReactNode, title: string, description: string) => (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-medium text-stone-800">{title}</p>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
      </div>
    </div>
  );

  const statusRow = (label: string, value: ReactNode) => (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 py-3 last:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <div className="text-sm font-medium text-stone-700">{value}</div>
    </div>
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold text-brand-900">Automatic Feeder</h1>
        <p className="mt-1 text-stone-500">
          Pengaturan dan pengelolaan pemberian pakan otomatis.
        </p>
      </header>

      {/* TAB NAVIGATION */}
      <div className="w-full min-w-0">
        <div className="flex w-full gap-2 overflow-x-auto rounded-xl bg-stone-100 p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  selected
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-stone-500 hover:bg-white/60 hover:text-stone-800"
                }`}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="w-full min-w-0">
        {/* JADWAL */}
        {activeTab === "schedule" && (
          <div className="w-full min-w-0 space-y-6">{scheduleContent}</div>
        )}

        {/* PENGATURAN */}
        {/* FEED SETTINGS */}
        {activeTab === "settings" && (
          <div className="w-full min-w-0 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pengaturan Durasi Motor
              </h2>
              <p className="text-sm text-gray-500">
                Atur durasi motor untuk setiap wadah pakan secara terpisah.
              </p>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              {/* WADAH 1 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Wadah Pakan 1
                    </h3>
                    <p className="text-sm text-gray-500">Durasi motor</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Pengaturan durasi motor belum terhubung dengan perangkat.
                  </p>
                </div>
              </div>

              {/* WADAH 2 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Wadah Pakan 2
                    </h3>
                    <p className="text-sm text-gray-500">Durasi motor</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Pengaturan durasi motor belum terhubung dengan perangkat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIWAYAT */}
        {activeTab === "history" && (
          <div className="w-full min-w-0">
            {sectionHeading(
              "Riwayat Pemberian Pakan",
              "Telusuri seluruh pemberian pakan manual maupun otomatis.",
            )}

            <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <History size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-stone-800">
                Belum ada riwayat
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                Riwayat pemberian pakan akan tersedia setelah perangkat
                terintegrasi dan mulai melakukan pemberian pakan.
              </p>
            </div>
          </div>
        )}

        {/* KONFIGURASI PERANGKAT */}
        {activeTab === "device" && (
          <div className="w-full min-w-0 space-y-6">
            {sectionHeading(
              "Konfigurasi Perangkat",
              "Pantau konektivitas perangkat Automatic Feeder.",
            )}

            {/* STATUS PERANGKAT */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Cpu size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-800">
                    Status Perangkat
                  </h3>
                  <p className="text-sm text-stone-500">
                    Automatic Feeder ESP32
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {statusRow("Status perangkat", statusBadge(false))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Clock size={16} />
                    Terakhir aktif
                  </div>
                  <p className="mt-2 font-medium text-stone-700">
                    Belum tersedia
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Cpu size={16} />
                    Firmware
                  </div>
                  <p className="mt-2 font-medium text-stone-700">
                    Belum tersedia
                  </p>
                </div>
              </div>
            </section>

            {/* WIFI */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Wifi size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-800">
                    Koneksi Jaringan
                  </h3>
                  <p className="text-sm text-stone-500">
                    Informasi jaringan Wi-Fi perangkat
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {statusRow("Status jaringan", statusBadge(false))}
                {statusRow("SSID", "Belum tersedia")}
                {statusRow(
                  "Kekuatan sinyal",
                  <span className="inline-flex items-center gap-2">
                    <Signal size={16} />
                    Belum tersedia
                  </span>,
                )}
              </div>
            </section>

            {/* MQTT */}
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Radio size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-800">
                    Koneksi MQTT Broker
                  </h3>
                  <p className="text-sm text-stone-500">
                    Komunikasi antara aplikasi dan perangkat
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {statusRow("Status broker", statusBadge(false))}
                {statusRow("Alamat broker", "Belum dikonfigurasi")}
                {statusRow("Port", "Belum dikonfigurasi")}
              </div>

              <div className="mt-5 border-t border-stone-100 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Tes koneksi belum tersedia. MQTT Broker belum diintegrasikan.",
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 active:scale-[0.98]"
                >
                  <RefreshCw size={16} />
                  Tes Koneksi
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
