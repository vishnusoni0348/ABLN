import { EmptyState } from "@/components/empty-state";
import { QuestionCard } from "@/components/ask-ui";
import { SavedEventCard, SavedOppCard, SavedSubScreen, Segments } from "@/components/saved-ui";
import { EVENTS } from "@/data/events";
import { QUESTIONS } from "@/data/questions";
import { OPPORTUNITIES } from "@/data/opportunities";
import { useEvents } from "@/lib/event-store";
import { useOpportunities } from "@/lib/opportunity-store";
import { useQuestions } from "@/lib/question-store";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

type Tab = "Opportunities" | "Events" | "Questions";
const TABS: readonly string[] = ["Opportunities", "Events", "Questions"];

export default function SavedItems() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { saved: oppIds } = useOpportunities();
  const { saved: eventIds } = useEvents();
  const { saved: questionIds, posted } = useQuestions();
  const [tab, setTab] = useState<Tab>(TABS.includes(params.tab ?? "") ? (params.tab as Tab) : "Opportunities");
  const [seenParam, setSeenParam] = useState(params.tab);

  // Tab screens stay mounted, so follow the param whenever another screen navigates here.
  if (params.tab !== seenParam) {
    setSeenParam(params.tab);
    if (TABS.includes(params.tab ?? "")) setTab(params.tab as Tab);
  }

  const opps = OPPORTUNITIES.filter((o) => oppIds.includes(o.id));
  const events = EVENTS.filter((e) => eventIds.includes(e.id));
  const questions = [...posted, ...QUESTIONS].filter((q) => questionIds.includes(q.id));

  return (
    <SavedSubScreen
      title="Saved Items"
      controls={
        <Segments
          selected={tab}
          onSelect={setTab}
          options={[
            { key: "Opportunities", label: `Opportunities (${opps.length})` },
            { key: "Events", label: `Events (${events.length})` },
            { key: "Questions", label: `Questions (${questions.length})` },
          ]}
        />
      }
    >
      {tab === "Opportunities" ? (
        opps.length ? (
          opps.map((o) => <SavedOppCard key={o.id} o={o} />)
        ) : (
          <EmptyState inline icon="briefcase-outline" title="No Saved Opportunities" text="Tap the bookmark on an opportunity to save it for later." cta={{ label: "Browse Opportunities", onPress: () => router.navigate("/opportunities") }} />
        )
      ) : tab === "Events" ? (
        events.length ? (
          events.map((e) => <SavedEventCard key={e.id} e={e} />)
        ) : (
          <EmptyState inline icon="calendar-outline" title="No Saved Events" text="Tap the bookmark on an event to save it for later." cta={{ label: "Browse Events", onPress: () => router.navigate("/events") }} />
        )
      ) : questions.length ? (
        questions.map((q) => <QuestionCard key={q.id} q={q} />)
      ) : (
        <EmptyState inline icon="help-circle-outline" title="No Saved Questions" text="Tap the bookmark on a question to save it for later." cta={{ label: "Browse Ask Network", onPress: () => router.navigate("/ask-network") }} />
      )}
    </SavedSubScreen>
  );
}
