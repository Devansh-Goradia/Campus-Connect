"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { AtSign, Globe2, Coffee } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface RevealProfile {
  name: string;
  photo: string | null;
  avatar_emoji?: string;
  instagram?: string | null;
  linkedin?: string | null;
}

interface RevealModalProps {
  me: RevealProfile;
  peer: RevealProfile;
}

export function RevealModal({ me, peer }: RevealModalProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Burst of confetti
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const ProfileCard = ({ profile, label }: { profile: RevealProfile; label: string }) => (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-surface-border bg-surface-muted flex-1">
      <Avatar
        src={profile.photo}
        emoji={profile.avatar_emoji}
        size="xl"
        glow="cyan"
      />
      <div className="text-center">
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-white font-bold text-lg leading-tight">{profile.name}</p>
      </div>
        <div className="flex gap-2">
        {profile.instagram && (
          <a
            href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs hover:bg-neon-pink/20 transition-colors"
          >
            <AtSign className="h-3.5 w-3.5" />
            {profile.instagram}
          </a>
        )}
        {profile.linkedin && (
          <a
            href={`https://${profile.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs hover:bg-neon-blue/20 transition-colors"
          >
            <Globe2 className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md px-5 animate-fade-up">
      <div className="w-full max-w-sm space-y-5">
        {/* Title */}
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce-in">🎭✨</div>
          <h2 className="text-2xl font-bold text-white">Identities Revealed!</h2>
          <p className="text-white/50 text-sm mt-1">
            You both chose to unmask. Time to connect for real.
          </p>
        </div>

        {/* Profile cards */}
        <div className="flex gap-3 animate-slide-up">
          <ProfileCard profile={me} label="You" />
          <ProfileCard profile={peer} label="Your Match" />
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-neon-green/30 bg-neon-green/10 p-4 text-center animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="h-5 w-5 text-neon-green" />
            <span className="text-neon-green font-bold">Grab a coffee on campus! ☕</span>
          </div>
          <p className="text-white/50 text-xs">
            You have each other&apos;s socials now. The rest is up to you.
          </p>
        </div>

        <Button variant="primary" fullWidth size="lg">
          Continue Chatting 💬
        </Button>
      </div>
    </div>
  );
}
