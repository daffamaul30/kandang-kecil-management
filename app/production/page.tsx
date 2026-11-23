import ModulePage from "@/components/ModulePage";
export default function Production() {
  return (
    <ModulePage
      title="Produksi Telur"
      description="Catat jumlah telur per koloni per tanggal."
      collection="eggProductions"
      fields={[
        { name: "date", label: "Tanggal", type: "date", required: true },
        { name: "colonyName", label: "Nama koloni", required: true },
        {
          name: "count",
          label: "Jumlah telur",
          type: "number",
          required: true,
        },
      ]}
    />
  );
}
