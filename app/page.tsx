"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, UserCheck, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      
      {/* Hero Container */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-8 animate-fade-in">
        
        {/* Floating Hype Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-lg shadow-indigo-500/10">
          <Flame className="h-3.5 w-3.5 text-pink-400" />
          <span>Exclusive Campus Drop • Verified Students Only</span>
        </div>

        {/* Main Title with Gradient */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Meet campus peers.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Zero awkwardness.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
            Chat anonymously based on shared passions. Double opt-in to unveil your true profiles together! 🚀
          </p>
        </div>

        {/* Bento Feature Badges */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShieldCheck, title: "100% ID Verified", color: "from-indigo-500 to-cyan-400", bg: "bg-indigo-500/10" },
            { icon: Sparkles, title: "Blind Matching", color: "from-purple-400 to-pink-400", bg: "bg-purple-500/10" },
            { icon: UserCheck, title: "Mutual Reveal", color: "from-pink-400 to-rose-400", bg: "bg-pink-500/10" },
          ].map(({ icon: Icon, title, color, bg }) => (
            <div
              key={title}
              className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className={`w-9 h-9 rounded-2xl ${bg} flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-zinc-100" />
              </div>
              <span className="text-xs font-bold text-zinc-200">
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Chunky CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto shadow-xl shadow-indigo-500/30"
            onClick={() => router.push("/register")}
          >
            Claim Your Spot <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.push("/login")}
          >
            Student Sign In
          </Button>
        </div>

        {/* Footer Subtext */}
        <p className="text-xs font-semibold text-zinc-500">
          Locked to enrolled campus students • Real IDs checked by admins
        </p>
      </div>
    </main>
  );
}
