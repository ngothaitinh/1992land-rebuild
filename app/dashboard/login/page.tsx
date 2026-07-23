import { Suspense } from "react";
import LoginForm from "@/components/dashboard/LoginForm";

export default function DashboardLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
