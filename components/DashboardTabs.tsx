
"use client";

import { useState, ReactNode } from "react";

export default function DashboardTabs({
  production,
  feeder,
}: {
  production: ReactNode;
  feeder: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"production" | "feeder">(
    "production"
  );

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-stone-200">
        <button
          key="tab-production"
          onClick={() => setActiveTab("production")}
          className={`px-5 py-3 text-sm font-medium transition ${
            activeTab === "production"
              ? "border-b-2 border-orange-600 text-orange-700"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Produksi
        </button>

        <button
          key="tab-feeder"
          onClick={() => setActiveTab("feeder")}
          className={`px-5 py-3 text-sm font-medium transition ${
            activeTab === "feeder"
              ? "border-b-2 border-orange-600 text-orange-700"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Automatic Feeder
        </button>
      </div>

      {activeTab === "production" ? (
        <div key="production-content">{production}</div>
      ) : (
        <div key="feeder-content">{feeder}</div>
      )}
    </div>
  );
}
