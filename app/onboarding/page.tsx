"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/onboarding/SignUpForm";
import { WaitingRoom } from "@/components/onboarding/WaitingRoom";

export default function OnboardingPage() {
  const [step, setStep] = useState<"signup" | "waiting">("signup");
  const router = useRouter();

  // DEMO MODE: Auto-approve after 4 seconds in waiting room
  const handleSignupComplete = () => {
    setStep("waiting");
    setTimeout(() => {
      router.push("/interests");
    }, 4000);
  };

  if (step === "waiting") {
    return <WaitingRoom />;
  }

  return <SignUpForm onComplete={handleSignupComplete} />;
}
