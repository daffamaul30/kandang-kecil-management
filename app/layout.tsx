import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Kandang Kecil",
  description: "Manajemen kandang dan produksi telur",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
