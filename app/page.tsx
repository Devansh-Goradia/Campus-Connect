"use client";

import { useRouter } from "next/navigation";
import { Zap, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-surface bg-neon-grid flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-neon-cyan/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-neon-purple/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-14 w-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-neon-cyan">
            <span className="text-3xl">✨</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
            Campus
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
              Connect
            </span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Meet verified campus peers anonymously. Real connections, no awkwardness.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Shield, label: "Verified Students Only", color: "text-neon-cyan" },
            { icon: Eye, label: "Anonymous by Default", color: "text-neon-purple" },
            { icon: Zap, label: "Mutual Reveal", color: "text-neon-pink" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-surface-border bg-surface-card text-xs text-white/60"
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Button
            variant="neon"
            size="lg"
            fullWidth
            onClick={() => router.push("/register")}
          >
            Apply for Access
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>

        <p className="text-xs text-white/20">
          Exclusive to verified campus students • No screenshots, no DMs to strangers
        </p>
      </div>
    </main>
  );
}
