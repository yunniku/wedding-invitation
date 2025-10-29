"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
    });
  }, [pathname]);

  return null;
}
