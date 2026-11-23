"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Egg,
  RefreshCcw,
  Cpu,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Siklus", href: "/cycles", icon: RefreshCcw },
  { label: "Koloni", href: "/colonies", icon: Users },
  { label: "Produksi Telur", href: "/production", icon: Egg },
  { label: "Automatic Feeder", href: "/feeders", icon: Cpu },
  { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];
export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <button
        className="fixed left-3 top-3 z-50 rounded-xl bg-white p-2 shadow md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <Menu />
      </button>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Tutup menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-brand-100 bg-white px-5 py-6 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/logo.png"
            width={46}
            height={46}
            alt="Logo Kandang Kecil"
            className="rounded-full"
          />
          <div>
            <div className="font-bold text-brand-900">Kandang Kecil</div>
            <div className="text-xs text-stone-500">Manajemen kandang</div>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-50"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <form action="/api/auth/logout" method="POST">
          <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-500 hover:bg-stone-50">
            <LogOut size={18} />
            Keluar
          </button>
        </form>
      </aside>
      <main className="min-h-screen w-full md:pl-64">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:px-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
