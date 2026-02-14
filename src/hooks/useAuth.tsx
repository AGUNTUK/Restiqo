"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
      return false;
    }
    return true;
  }, [isLoading, isAuthenticated, router]);

  const requireHost = useCallback(() => {
    if (!requireAuth()) return false;
    if (!user?.hostProfile || user.hostProfile.status !== "APPROVED") {
      router.push("/host/register");
      return false;
    }
    return true;
  }, [requireAuth, user, router]);

  const requireAdmin = useCallback(() => {
    if (!requireAuth()) return false;
    if (user?.role !== "ADMIN") {
      router.push("/");
      return false;
    }
    return true;
  }, [requireAuth, user, router]);

  return {
    session,
    status,
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    requireHost,
    requireAdmin,
    update,
  };
}