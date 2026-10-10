"use client";

import { useState } from "react";
import { User, Mail, Lock, AtSign, Globe2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IdUploader } from "@/components/onboarding/IdUploader";

// ─── Hoisted to module scope ───────────────────────────────────────────────────
// IMPORTANT: Field must NOT be defined inside SignUpForm. If it were, React
// would see a brand-new component type on every render (every keystroke),
// unmount the old <input>, and mount a fresh one — destroying focus each time.
interface FieldProps {
  icon: React.ElementType;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({ icon: Icon, placeholder, type = "text", value, onChange }: FieldProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-muted border border-surface-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
      />
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

interface SignUpFormProps {
  onComplete: () => void;
}

export function SignUpForm({ onComplete }: SignUpFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    instagram: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!form.name || !form.email || !form.password) return;
    setStep(2);
  };

  const handleUpload = async (_file: File) => {
    // Simulate upload delay (Phase 2: replace with Supabase Storage)
    await new Promise((r) => setTimeout(r, 1800));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate account creation (Phase 2: replace with Supabase auth.signUp)
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onComplete();
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-4xl mb-3">🎓</div>
        <h1 className="text-2xl font-bold text-white">Join CampusConnect</h1>
        <p className="text-white/50 text-sm">
          {step === 1
            ? "Create your account — takes 60 seconds"
            : "Verify you're a student"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? "bg-neon-cyan text-black"
                  : "bg-surface-muted text-white/30 border border-surface-border"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            <span className={`text-xs ${step >= s ? "text-white/70" : "text-white/20"}`}>
              {s === 1 ? "Account" : "Verification"}
            </span>
            {s < 2 && <div className={`flex-1 h-px ${step > s ? "bg-neon-cyan/40" : "bg-surface-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Account details */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-up">
          <Field
            icon={User}
            placeholder="Full Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <Field
            icon={Mail}
            placeholder="Campus Email (.edu)"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          <Field
            icon={Lock}
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          />
          <div className="pt-1 border-t border-surface-border">
            <p className="text-xs text-white/30 mb-3">Optional — shown only after mutual reveal</p>
            <div className="space-y-2">
              <Field
                icon={AtSign}
                placeholder="@instagram_handle"
                value={form.instagram}
                onChange={(v) => setForm((f) => ({ ...f, instagram: v }))}
              />
              <Field
                icon={Globe2}
                placeholder="LinkedIn profile URL"
                value={form.linkedin}
                onChange={(v) => setForm((f) => ({ ...f, linkedin: v }))}
              />
            </div>
          </div>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleNext}
            disabled={!form.name || !form.email || !form.password}
            className="mt-2"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: ID Upload */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-up">
          <div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">
            <p className="text-xs text-neon-cyan font-semibold mb-1">🔒 Why we need this</p>
            <p className="text-xs text-white/50">
              CampusConnect is an exclusive network. Your ID is verified once by an admin,
              then permanently deleted. We never store it long-term.
            </p>
          </div>
          <IdUploader onUpload={handleUpload} />
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={loading}
          >
            Submit for Verification
          </Button>
          <button
            className="w-full text-xs text-white/30 hover:text-white/50 transition-colors"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
