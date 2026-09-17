import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Fetch all user profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, biography")
    .order("display_name", { ascending: true });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Users</TypographyH2>
      </div>
      <Separator className="my-4" />
      <p className="mb-6 text-sm text-muted-foreground">
        Browse researcher and contributor profiles across Biodiversity Hub.
      </p>

      {error ? (
        <p className="text-sm text-destructive">Failed to load profiles: {error.message}</p>
      ) : profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col justify-between rounded-lg border bg-card p-5 shadow-sm"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">{profile.display_name}</h3>
                <p className="text-sm text-muted-foreground break-all">{profile.email}</p>
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500">Biography</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {profile.biography ? profile.biography : "No biography provided."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No user profiles found.</p>
      )}
    </>
  );
}