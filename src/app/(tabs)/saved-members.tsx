import { EmptyState } from "@/components/empty-state";
import { FilterChips, SavedMemberRow, SavedSubScreen, SearchField } from "@/components/saved-ui";
import { findMember } from "@/data/members";
import { useSettings } from "@/lib/profile-store";
import { useSavedMembers } from "@/lib/saved-store";
import { router } from "expo-router";
import { useState } from "react";

const FILTERS = ["All", "Verified", "Same City", "Same Industry"] as const;
type Filter = (typeof FILTERS)[number];

const norm = (s: string) => s.trim().toLowerCase();

export default function SavedMembers() {
  const { members } = useSavedMembers();
  const { profile } = useSettings();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const q = norm(query);
  const rows = members
    .map((n) => findMember(n))
    .filter((m): m is NonNullable<typeof m> => !!m)
    .filter((m) => {
      if (filter === "Verified") return m.verified;
      if (filter === "Same City") return norm(m.city) === norm(profile.city);
      if (filter === "Same Industry") return norm(profile.industry).includes(norm(m.industry));
      return true;
    })
    .filter((m) => !q || [m.name, m.role, m.company, m.location, m.industry].join(" ").toLowerCase().includes(q));

  return (
    <SavedSubScreen
      title="Saved Members"
      controls={
        members.length ? (
          <>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search saved members..." />
            <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} style={{ marginTop: 12 }} />
          </>
        ) : undefined
      }
    >
      {!members.length ? (
        <EmptyState inline icon="person-outline" title="No Saved Members" text="Bookmark a member's profile to find them here quickly." cta={{ label: "Browse Network", onPress: () => router.navigate("/network") }} />
      ) : rows.length ? (
        rows.map((m) => <SavedMemberRow key={m.name} m={m} />)
      ) : (
        <EmptyState inline icon="search-outline" title="No matches" text="Try a different search or filter." />
      )}
    </SavedSubScreen>
  );
}
