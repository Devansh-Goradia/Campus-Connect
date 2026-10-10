"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InterestGrid } from "@/components/interests/InterestGrid";
import { SearchingAnimation } from "@/components/match/SearchingAnimation";
import { Interest } from "@/types";

export default function InterestsPage() {
  const [phase, setPhase] = useState<"select" | "searching">("select");
  const [selected, setSelected] = useState<Interest[]>([]);
  const router = useRouter();

  const handleContinue = (interests: Interest[]) => {
    setSelected(interests);
    setPhase("searching");
  };

  if (phase === "searching") {
    return (
      <SearchingAnimation
        selectedInterests={selected}
        onMatchFound={() => router.push("/chat/demo")}
      />
    );
  }

  return <InterestGrid onContinue={handleContinue} />;
}
