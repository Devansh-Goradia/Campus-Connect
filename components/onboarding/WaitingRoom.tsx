"use client";

import { Shield, Clock, Sparkles } from "lucide-react";

export function WaitingRoom() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-6 text-center">
      {/* Radar animation */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Rings */}
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-neon-cyan/20 animate-radar"
            style={{
              width: `${i * 60}px`,
              height: `${i * 60}px`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
        <div className="relative z-10 h-16 w-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center shadow-neon-cyan">
          <Shield className="h-8 w-8 text-neon-cyan" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        Verifying Your Student Status
      </h1>
      <p className="text-white/50 max-w-sm mb-10 leading-relaxed">
        Our team is reviewing your campus ID. This usually takes a few minutes.
        You&apos;ll be notified the moment you&apos;re approved.
      </p>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3">
        {[
          { icon: Clock, label: "ID submitted for review", done: true },
          { icon: Shield, label: "Admin verification in progress", done: false, active: true },
          { icon: Sparkles, label: "Access to the campus network", done: false },
        ].map(({ icon: Icon, label, done, active }) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-xl p-3 border ${
              done
                ? "border-neon-green/30 bg-neon-green/5"
                : active
                ? "border-neon-cyan/30 bg-neon-cyan/5 animate-pulse-slow"
                : "border-surface-border bg-surface-muted opacity-40"
            }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${
                done ? "text-neon-green" : active ? "text-neon-cyan" : "text-white/30"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                done ? "text-neon-green" : active ? "text-neon-cyan" : "text-white/30"
              }`}
            >
              {label}
            </span>
            {done && <span className="ml-auto text-neon-green text-xs">✓</span>}
            {active && (
              <span className="ml-auto flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
