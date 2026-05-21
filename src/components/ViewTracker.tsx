"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

type Props = {
  vehicleId: string;
  vehicleInfo: string;
};

export default function ViewTracker({ vehicleId, vehicleInfo }: Props) {
  const logged = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      supabase.from("user_views").insert([
        {
          user_id: userId,
          vehicle_id: vehicleId,
          vehicle_info: vehicleInfo,
        },
      ]).then();
    });
  }, []);

  return null;
}
