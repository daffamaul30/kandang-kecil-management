import Page from "@/components/layout/Page";
import { requireAuth } from "@/lib/auth";
import CycleControls from "@/components/CycleControls";
import Records from "@/components/Records";
export default async function Cycles() {
  await requireAuth();
  return (
    <Page>
      <h1 className="text-3xl font-bold text-brand-900">Siklus</h1>
      <p className="mt-1 text-stone-500">Kelola siklus pakan dan histori.</p>
      <section className="mt-6 max-w-2xl rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <CycleControls />
      </section>
      <Records
        collection="cycles"
        labels={{
          name: "Nama siklus",
          status: "Status",
          startDate: "Mulai",
          endDate: "Selesai",
          closingReason: "Alasan",
        }}
      />
    </Page>
  );
}
