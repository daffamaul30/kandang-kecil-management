import Image from "next/image";
import LoginForm from "./LoginForm";
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Logo Kandang Kecil"
            width={90}
            height={90}
          />
          <h1 className="mt-3 text-2xl font-bold text-brand-900">
            Kandang Kecil
          </h1>
          <p className="mt-1 text-sm text-stone-500">Masuk ke kandangmu</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
