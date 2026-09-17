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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Kingdom = Database["public"]["Enums"]["kingdom"];
const KINGDOMS = ["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"] as const;

export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Grouped form state for clean handling
  const defaultForm = {
    scientific_name: species.scientific_name,
    common_name: species.common_name ?? "",
    kingdom: species.kingdom,
    total_population: species.total_population?.toString() ?? "",
    image: species.image ?? "",
    description: species.description ?? "",
  };
  const [formData, setFormData] = useState(defaultForm);
  const isAuthor = sessionId === species.author;

  useEffect(() => setFormData(defaultForm), [species]);

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setIsEditing(false);
      setFormData(defaultForm);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Revert all unsaved changes?")) {
      setFormData(defaultForm);
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthor) return;

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: formData.scientific_name.trim(),
        common_name: formData.common_name.trim() || null,
        kingdom: formData.kingdom,
        total_population: formData.total_population.trim() ? Number(formData.total_population) : null,
        image: formData.image.trim() || null,
        description: formData.description.trim() || null,
      })
      .eq("id", species.id);

    setLoading(false);
    if (error) return alert(error.message);

    setIsEditing(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      <div className="relative h-40 w-full overflow-hidden rounded bg-slate-100">
        {species.image ? (
          <Image src={species.image} alt={species.scientific_name} fill className="object-cover" unoptimized />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-slate-400">No image</span>
        )}
      </div>

      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? `${species.description.slice(0, 150).trim()}...` : ""}</p>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isEditing ? "Edit Species" : species.scientific_name}
            </DialogTitle>
            <DialogDescription className="italic">
              {isEditing ? "Update details and save." : species.common_name ?? "No common name"}
            </DialogDescription>
          </DialogHeader>

          {!isEditing ? (
            <div className="space-y-3 py-2 text-sm">
              {isAuthor && (
                <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
                  Edit Species
                </Button>
              )}
              <p><strong>Kingdom:</strong> {species.kingdom}</p>
              <p><strong>Population:</strong> {species.total_population?.toLocaleString() ?? "Not specified"}</p>
              <p><strong>Description:</strong></p>
              <p className="whitespace-pre-wrap text-slate-700">{species.description ?? "None provided."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-sm">
              <div>
                <Label>Scientific Name *</Label>
                <Input required value={formData.scientific_name} onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })} />
              </div>
              <div>
                <Label>Common Name</Label>
                <Input value={formData.common_name} onChange={(e) => setFormData({ ...formData, common_name: e.target.value })} />
              </div>
              <div>
                <Label>Kingdom *</Label>
                <Select value={formData.kingdom} onValueChange={(val) => setFormData({ ...formData, kingdom: val as Kingdom })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINGDOMS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Total Population</Label>
                <Input type="number" value={formData.total_population} onChange={(e) => setFormData({ ...formData, total_population: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
