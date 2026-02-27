"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  label?: string;
  className?: string;
}

export function LogoutButton({ label = "تسجيل الخروج", className = "" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`min-h-11 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-subtext transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary disabled:cursor-not-allowed ${className}`}
    >
      {loading ? "..." : label}
    </button>
  );
}
