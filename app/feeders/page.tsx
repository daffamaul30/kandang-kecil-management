import Page from "@/components/layout/Page";
import { requireAuth } from "@/lib/auth";
import DataForm from "@/components/DataForm";
import Records from "@/components/Records";
import AutomaticFeederClient from "./AutomaticFeederClient";

export default async function Feeders() {
  await requireAuth();

  return (
    <Page>
      <AutomaticFeederClient
        scheduleContent={
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-800">
                Jadwal Pakan
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Atur waktu pemberian pakan yang berlaku untuk seluruh wadah.
              </p>
            </div>

            <section className="w-full max-w-2xl rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
              <DataForm
                collection="feederSchedules"
                fields={[
                  {
                    name: "feederName",
                    label: "Nama jadwal",
                    required: true,
                  },
                  {
                    name: "time",
                    label: "Waktu pemberian (HH:mm)",
                    required: true,
                    type: "time",
                  },
                  {
                    name: "enabled",
                    label: "Status jadwal",
                    required: true,
                    options: [
                      { label: "Aktif", value: "true" },
                      { label: "Nonaktif", value: "false" },
                    ],
                  },
                ]}
              />
            </section>

            <Records collection="feederSchedules" />
          </div>
        }
      />
    </Page>
  );
}
