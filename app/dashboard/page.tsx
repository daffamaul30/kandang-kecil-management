import Page from "@/components/layout/Page";
import DashboardTabs from "@/components/DashboardTabs";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/mongodb";
import { Egg, Bird, TrendingUp, CircleDollarSign, Wheat } from "lucide-react";
import AutomaticFeederPanel from "@/components/AutomaticFeederPanel";

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function Dashboard() {
  await requireAuth();

  const database = await db();

  const cycle = await database
    .collection("cycles")
    .findOne({ status: "active" });

  const colonies = await database
    .collection("colonies")
    .find({ active: true })
    .toArray();

  const productions = cycle
    ? await database
        .collection("eggProductions")
        .find({ cycleId: String(cycle._id) })
        .toArray()
    : [];

  const expenses = cycle
    ? await database
        .collection("expenses")
        .find({ cycleId: String(cycle._id) })
        .toArray()
    : [];

  const eggs = productions.reduce((s, p) => s + Number(p.count || 0), 0);

  const cost = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const population = colonies.reduce(
    (s, c) => s + Number(c.males || 0) + Number(c.females || 0),
    0,
  );

  const margin25 = eggs * 2500 - cost;
  const margin30 = eggs * 3000 - cost;

  const cards = [
    {
      title: "Telur siklus ini",
      value: eggs.toLocaleString("id-ID"),
      icon: Egg,
    },
    {
      title: "Populasi ayam",
      value: population.toLocaleString("id-ID"),
      icon: Bird,
    },
    {
      title: "Simulasi @ Rp2.500",
      value: rupiah(margin25),
      icon: CircleDollarSign,
    },
    {
      title: "Simulasi @ Rp3.000",
      value: rupiah(margin30),
      icon: CircleDollarSign,
    },
  ];

  return (
    <Page>
      <header className="mb-6">
        <p className="text-sm text-brand-600">Ringkasan siklus aktif</p>

        <h1 className="text-3xl font-bold text-brand-900">Dashboard</h1>

        <p className="mt-1 text-stone-500">Pantau kondisi kandang hari ini.</p>
      </header>

      <DashboardTabs
        production={
          <section className="space-y-6">
            {/* HEADER PRODUKSI */}
            <header>
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-orange-50 p-3 text-orange-700">
                  <Egg size={24} />
                </span>

                <div>
                  <h2 className="text-2xl font-bold text-brand-900">
                    Produksi
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Pantau produksi telur dan ringkasan siklus aktif.
                  </p>
                </div>
              </div>
            </header>

            {/* KPI CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(({ title, value, icon: Icon }) => (
                <section
                  key={title}
                  className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-500">{title}</p>

                    <span className="rounded-xl bg-brand-50 p-2 text-brand-600">
                      <Icon size={18} />
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-brand-900">
                    {value}
                  </p>
                </section>
              ))}
            </div>

            {/* PRODUKSI DAN PENGELUARAN */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* PRODUKSI TERBARU */}
              <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft lg:col-span-2">
                <h2 className="font-semibold text-brand-900">
                  Produksi terbaru
                </h2>

                {productions.length === 0 ? (
                  <p className="mt-4 text-sm text-stone-500">
                    Belum ada catatan produksi pada siklus aktif.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {productions
                      .slice(-7)
                      .reverse()
                      .map((p: any) => (
                        <div
                          key={String(p._id)}
                          className="flex justify-between border-b border-stone-100 py-2 text-sm"
                        >
                          <span>
                            {new Date(p.date).toLocaleDateString("id-ID")} ·{" "}
                            {p.colonyName || "Koloni"}
                          </span>

                          <b>{p.count} telur</b>
                        </div>
                      ))}
                  </div>
                )}
              </section>

              {/* RINGKASAN PENGELUARAN */}
              <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
                <h2 className="font-semibold text-brand-900">
                  Ringkasan pengeluaran
                </h2>

                <p className="mt-4 text-sm text-stone-500">
                  Total pengeluaran siklus
                </p>

                <p className="mt-1 text-xl font-bold">{rupiah(cost)}</p>

                <p className="mt-6 text-sm text-stone-500">Koloni aktif</p>

                <p className="mt-1 text-xl font-bold">{colonies.length}</p>
              </section>
            </div>
          </section>
        }
        feeder={
          <AutomaticFeederPanel />
        }
      />
    </Page>
  );
}
