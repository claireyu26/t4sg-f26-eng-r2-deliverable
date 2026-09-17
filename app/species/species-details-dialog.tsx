"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Kingdom = Database["public"]["Enums"]["kingdom"];

const kingdoms = ["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"] as const;

interface SpeciesDetailsDialogProps {
  species: Species;
  sessionId: string;
}

export default function SpeciesDetailsDialog({ species, sessionId }: SpeciesDetailsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scientificName, setScientificName] = useState(species.scientific_name);
  const [commonName, setCommonName] = useState(species.common_name ?? "");
  const [kingdom, setKingdom] = useState(species.kingdom);
  const [totalPopulation, setTotalPopulation] = useState(
    species.total_population !== null ? species.total_population.toString() : "",
  );
  const [image, setImage] = useState(species.image ?? "");
  const [description, setDescription] = useState(species.description ?? "");
  const isAuthor = sessionId === species.author;

  const resetForm = () => {
    setScientificName(species.scientific_name);
    setCommonName(species.common_name ?? "");
    setKingdom(species.kingdom);
    setTotalPopulation(species.total_population !== null ? species.total_population.toString() : "");
    setImage(species.image ?? "");
    setDescription(species.description ?? "");
    setImageError(false);
  };

  useEffect(() => {
    setScientificName(species.scientific_name);
    setCommonName(species.common_name ?? "");
    setKingdom(species.kingdom);
    setTotalPopulation(species.total_population !== null ? species.total_population.toString() : "");
    setImage(species.image ?? "");
    setDescription(species.description ?? "");
    setImageError(false);
  }, [species]);

  const handleCancel = () => {
    if (window.confirm("Revert all unsaved changes?")) {
      resetForm();
      setIsEditing(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthor) return;

    setLoading(true);
    // Update the species record through the browser Supabase client.
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: scientificName.trim(),
        common_name: commonName.trim() || null,
        kingdom,
        total_population: totalPopulation.trim() ? Number(totalPopulation) : null,
        image: image.trim() || null,
        description: description.trim() || null,
      })
      .eq("id", species.id);

    setLoading(false);
    if (error) {
      alert(`Error updating species: ${error.message}`);
      return;
    }

    setIsEditing(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setIsEditing(false);
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? "Edit Species" : species.scientific_name}
          </DialogTitle>
          <DialogDescription className="italic">
            {isEditing ? "Update species details and confirm when finished." : species.common_name ?? "No common name provided"}
          </DialogDescription>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-4 py-2 text-sm">
            {species.image && !imageError ? (
              <div className="relative h-48 w-full overflow-hidden rounded-md border">
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
              <div className="flex h-48 w-full items-center justify-center rounded-md border bg-slate-100 text-sm text-slate-400">
                No image provided
              </div>
            )}

            <div className="space-y-2 border-t pt-2">
              <p><strong>Kingdom:</strong> {species.kingdom}</p>
              <p>
                <strong>Total Population:</strong>{" "}
                {species.total_population !== null ? species.total_population.toLocaleString() : "Not specified"}
              </p>
              <div>
                <strong>Description:</strong>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{species.description ?? "None provided."}</p>
              </div>
            </div>

            {isAuthor && (
              <Button type="button" variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
                Edit Species
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 pt-2 text-sm">
            <div>
              <Label htmlFor={`scientific-name-${species.id}`}>Scientific Name *</Label>
              <Input
                id={`scientific-name-${species.id}`}
                required
                value={scientificName}
                onChange={(event) => setScientificName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`common-name-${species.id}`}>Common Name</Label>
              <Input
                id={`common-name-${species.id}`}
                value={commonName}
                onChange={(event) => setCommonName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`kingdom-${species.id}`}>Kingdom *</Label>
              <Select value={kingdom} onValueChange={(value) => setKingdom(value as Kingdom)}>
                <SelectTrigger id={`kingdom-${species.id}`}>
                  <SelectValue placeholder="Select a kingdom" />
                </SelectTrigger>
                <SelectContent>
                  {kingdoms.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`population-${species.id}`}>Total Population</Label>
              <Input
                id={`population-${species.id}`}
                type="number"
                value={totalPopulation}
                onChange={(event) => setTotalPopulation(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`image-${species.id}`}>Image URL</Label>
              <Input id={`image-${species.id}`} value={image} onChange={(event) => setImage(event.target.value)} />
            </div>
            <div>
              <Label htmlFor={`description-${species.id}`}>Description</Label>
              <Textarea
                id={`description-${species.id}`}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
