"use client";

import { useState } from "react";
import Image from "next/image";
import type { Database } from "@/lib/schema";
import SpeciesDetailsDialog from "./species-details-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesCardProps {
  species: Species;
  sessionId: string;
}

export default function SpeciesCard({ species, sessionId }: SpeciesCardProps) {
  const [imageError, setImageError] = useState(false);
  const isAuthor = species.author === sessionId;

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && !imageError ? (
        <div className="relative h-40 w-full">
          <Image
            src={species.image}
            alt={species.scientific_name}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
          No image provided
        </div>
      )}

      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? `${species.description.slice(0, 150).trim()}...` : ""}</p>

      <SpeciesDetailsDialog species={species} sessionId={sessionId} />
    </div>
  );
}