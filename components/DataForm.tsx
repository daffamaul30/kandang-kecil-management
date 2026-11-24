"use client";

import { useEffect, useRef, useState } from "react";
import CurrencyInput from "@/components/CurrencyInput";

export type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

function DateField({ name, required }: { name: string; required?: boolean }) {
  const textRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  function formatDate(value: string) {
    if (!value) return "";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function handlePickerChange(value: string) {
    if (textRef.current) {
      textRef.current.value = formatDate(value);
    }
  }

  return (
    <div className="mt-1 flex gap-2">
      <input
        ref={textRef}
        name={name}
        type="text"
        placeholder="DD/MM/YYYY"
        required={required}
        inputMode="numeric"
        autoComplete="off"
        className="w-full rounded-xl border border-stone-200 bg-white p-3"
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
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => handlePickerChange(e.target.value)}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      </button>
    </div>
  );
}

function convertDateToISO(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

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

export default function DataForm({
  collection,
  fields,
  button = "Simpan",
}: {
  collection: string;
  fields: Field[];
  button?: string;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [colonies, setColonies] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (collection !== "eggProductions") return;

    async function loadColonies() {
      try {
        const res = await fetch("/api/data/colonies");

        if (res.ok) {
          const data = await res.json();
          setColonies(data);
        }
      } catch (error) {
        console.error("Gagal memuat koloni:", error);
      }
    }

    loadColonies();
  }, [collection]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    setBusy(true);
    setMsg("");

    try {
      const f = new FormData(form);
      const data: Record<string, any> = {};

      for (const x of fields) {
        const val = f.get(x.name);

        if (val !== null && val !== "") {
          if (x.type === "currency") {
            data[x.name] = Number(String(val).replace(/\./g, ""));
          } else if (x.type === "number") {
            data[x.name] = Number(val);
          } else if (x.type === "date") {
            const converted = convertDateToISO(String(val));

            if (!converted) {
              setMsg(`Tanggal ${x.label} tidak valid. Gunakan DD/MM/YYYY.`);
              setBusy(false);
              return;
            }

            data[x.name] = converted;
          } else {
            data[x.name] = val;
          }
        }
      }

      const res = await fetch("/api/data/" + collection, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();

        setMsg(
          result.updated
            ? "Catatan produksi sebelumnya berhasil diperbarui."
            : "Berhasil disimpan.",
        );
        form.reset();

        window.dispatchEvent(
          new CustomEvent("data-saved", {
            detail: { collection },
          }),
        );

        const currencyInputs = form.querySelectorAll<HTMLInputElement>(
          'input[data-currency="true"]',
        );

        currencyInputs.forEach((input) => {
          input.value = "";
        });
      } else {
        setMsg("Gagal menyimpan.");
      }
    } catch (error) {
      console.error(error);
      setMsg("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 w-full">
      {fields.map((x) => (
        <label key={x.name} className="block text-sm font-medium">
          {x.label}

          {x.name === "colonyName" && collection === "eggProductions" ? (
            <select
              name={x.name}
              required={x.required}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
              defaultValue=""
            >
              <option value="" disabled>
                {colonies.length === 0
                  ? "Belum ada koloni terdaftar"
                  : "Pilih koloni"}
              </option>

              {colonies.map((colony: any) => (
                <option value={colony.name} key={colony._id}>
                  {colony.name}
                </option>
              ))}
            </select>
          ) : x.options ? (
            <select
              name={x.name}
              required={x.required}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
            >
              {x.options.map((o) => (
                <option value={o.value} key={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : x.type === "currency" ? (
            <CurrencyInput
              name={x.name}
              required={x.required}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
            />
          ) : x.type === "date" ? (
            <DateField name={x.name} required={x.required} />
          ) : (
            <input
              name={x.name}
              type={x.type || "text"}
              required={x.required}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-3"
            />
          )}
        </label>
      ))}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Menyimpan…" : button}
      </button>

      {msg && <p className="text-sm text-stone-500">{msg}</p>}
    </form>
  );
}
