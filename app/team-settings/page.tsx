'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../components/AppContext";

// Redirect to the new URL format
export default function TeamSettingsRedirectPage() {
  const router = useRouter();
  const { activeTeam } = useAppContext();

  useEffect(() => {
    if (activeTeam?.url_key) {
      router.replace(`/teams/${activeTeam.url_key}/settings`);
    } else {
      router.replace('/');
    }
  }, [activeTeam, router]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">Redirecting...</div>
    </div>
  );
}