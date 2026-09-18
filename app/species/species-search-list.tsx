"use client";

import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/schema";
import { useState } from "react";
import SpeciesCard from "./species-card";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesSearchListProps {
  species: Species[];
  sessionId: string;
}

export default function SpeciesSearchList({ species, sessionId }: SpeciesSearchListProps) {
  const [query, setQuery] = useState("");

  const filteredSpecies = species.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const scientific = item.scientific_name?.toLowerCase() ?? "";
    const common = item.common_name?.toLowerCase() ?? "";
    const description = item.description?.toLowerCase() ?? "";

    return scientific.includes(q) || common.includes(q) || description.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search by scientific name, common name, or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap justify-center">
        {filteredSpecies.length > 0 ? (
          filteredSpecies.map((item) => <SpeciesCard key={item.id} species={item} sessionId={sessionId} />)
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No species found matching &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
