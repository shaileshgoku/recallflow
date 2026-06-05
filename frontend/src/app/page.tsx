"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth().then(() => {
      // checkAuth will set isLoading to false
    });
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading RecallFlow...</p>
      </div>
    </div>
  );
}
