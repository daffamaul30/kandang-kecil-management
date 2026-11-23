import ModulePage from "@/components/ModulePage";
export default function Expenses() {
  return (
    <ModulePage
      title="Pengeluaran"
      description="Catat pembelian pakan dan kebutuhan tambahan."
      collection="expenses"
      fields={[
        { name: "date", label: "Tanggal", type: "date", required: true },
        {
          name: "type",
          label: "Jenis pengeluaran",
          required: true,
          options: [
            { label: "Pakan", value: "feed" },
            { label: "Add-on", value: "addon" },
          ],
        },
        { name: "item", label: "Nama barang", required: true },
        { name: "quantity", label: "Jumlah / satuan (opsional)" },
        {
          name: "amount",
          label: "Nominal (Rp)",
          type: "currency",
          required: true,
        },
        { name: "notes", label: "Catatan" },
      ]}
    />
  );
}
