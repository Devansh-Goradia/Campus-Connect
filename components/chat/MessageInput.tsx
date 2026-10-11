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
    <div className="shrink-0 px-4 sm:px-6 pb-5 pt-3 border-t border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="flex items-end gap-3 bg-zinc-900/90 border border-white/10 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 transition-all rounded-3xl px-4 py-2.5 shadow-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Say something nice..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none min-h-[24px] leading-snug disabled:opacity-40 font-medium"
        />
        <button
          onClick={send}
          disabled={!value.trim() || disabled}
          className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-indigo-500/25 cursor-pointer"
          title="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="text-center text-[11px] font-semibold text-zinc-500 mt-2">
        Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
}
