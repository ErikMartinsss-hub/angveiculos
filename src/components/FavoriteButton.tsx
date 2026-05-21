"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
  vehicleId: string;
  size?: number;
  className?: string;
};

export default function FavoriteButton({
  vehicleId,
  size = 20,
  className = "",
}: Props) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .maybeSingle()
      .then(({ data }) => {
        setFavorited(!!data);
      });
  }, [userId, vehicleId]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId);
      setFavorited(false);
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: userId, vehicle_id: vehicleId }]);
      setFavorited(true);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-full transition ${
        favorited
          ? "bg-red-50 text-red-600"
          : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
      } ${className}`}
      title={favorited ? "Remover dos favoritos" : "Favoritar"}
    >
      <Heart
        size={size}
        className={favorited ? "fill-red-600" : ""}
      />
    </button>
  );
}
