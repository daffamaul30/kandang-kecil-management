import Page from "@/components/layout/Page";
import { requireAuth } from "@/lib/auth";
import DataForm, { Field } from "@/components/DataForm";
import Records from "@/components/Records";

export default async function ModulePage({
  title,
  description,
  collection,
  fields,
}: {
  title: string;
  description: string;
  collection: string;
  fields: Field[];
}) {
  await requireAuth();
  return (
    <Page>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand-900">{title}</h1>
        <p className="mt-1 text-stone-500">{description}</p>
      </div>
      <section className="max-w-2xl rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <DataForm collection={collection} fields={fields} />
      </section>
      <Records collection={collection} />
    </Page>
  );
}
