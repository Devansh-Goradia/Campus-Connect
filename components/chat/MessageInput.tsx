"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="shrink-0 px-4 pb-5 pt-3 border-t border-surface-border bg-surface-card/80 backdrop-blur-sm">
      <div className="flex items-end gap-3 bg-surface-muted rounded-2xl border border-surface-border focus-within:border-neon-cyan/40 focus-within:ring-1 focus-within:ring-neon-cyan/20 transition-all px-4 py-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Say something anonymous..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none focus:outline-none min-h-[22px] leading-snug disabled:opacity-40"
        />
        <button
          onClick={send}
          disabled={!value.trim() || disabled}
          className="shrink-0 h-9 w-9 rounded-xl bg-neon-cyan text-black flex items-center justify-center hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-neon-cyan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="text-center text-xs text-white/20 mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
