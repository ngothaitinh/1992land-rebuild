// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { checkDashboardSession, dashboardLogout } from "@/lib/dashboard-api.mjs";

const API_BASE = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "https://api.1992land.com";

const NAV = [
  { href: "/dashboard/du-an/", label: "Dự án" },
  { href: "/dashboard/tin-tuc/", label: "Tin tức" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/login/") {
      setChecked(true);
      return;
    }
    checkDashboardSession(API_BASE).then((ok) => {
      if (!ok) router.push(`/dashboard/login/?next=${encodeURIComponent(pathname)}`);
      else setChecked(true);
    });
  }, [pathname, router]);

  if (pathname === "/dashboard/login/") return <>{children}</>;
  if (!checked) return <div className="p-8 text-navy-600">Đang kiểm tra đăng nhập...</div>;

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-40 flex items-center gap-1 border-b border-border-soft bg-surface px-6 py-2">
        <Link href="/dashboard/" className="mr-4 text-sm font-bold text-navy-900">
          Dashboard
        </Link>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith(href) ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
            }`}
          >
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={async () => {
            await dashboardLogout(API_BASE);
            router.push("/dashboard/login/");
          }}
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          Đăng xuất
        </button>
      </div>
      {children}
    </div>
  );
}
