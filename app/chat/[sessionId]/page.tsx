"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { RevealButton } from "@/components/chat/RevealButton";
import { RevealModal } from "@/components/chat/RevealModal";
import { MOCK_CURRENT_USER, MOCK_MESSAGES, MOCK_PEER, MOCK_SESSION } from "@/lib/mock/mockData";
import { Message, RevealState } from "@/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [revealState, setRevealState] = useState<RevealState>("idle");
  // Tracks whether peer (simulated) has also clicked reveal
  const [peerWantsReveal, setPeerWantsReveal] = useState(false);

  const session = MOCK_SESSION;
  const currentUser = MOCK_CURRENT_USER;

  // ── Transition to revealed when both parties agree ─────────────────────────
  useEffect(() => {
    if (peerWantsReveal && revealState === "waiting") {
      setRevealState("revealed");
    }
  }, [peerWantsReveal, revealState]);

  // ── Derive display names (swap on reveal) ──────────────────────────────────
  const myAlias    = revealState === "revealed" ? currentUser.display_name : session.alias_a;
  const peerAlias  = revealState === "revealed" ? MOCK_PEER.real_name      : session.alias_b;
  const myAvatar   = revealState === "revealed" ? "🙂"                    : session.avatar_a;
  const peerAvatar = revealState === "revealed" ? "🙂"                    : session.avatar_b;

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (content: string) => {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        session_id: session.id,
        sender_id: currentUser.id,
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    },
    [session.id, currentUser.id]
  );

  // ── Reveal click handler ───────────────────────────────────────────────────
  // STRICT RULE: No notification sent to peer. They have no idea we clicked.
  // DEMO MODE: Peer auto-agrees after 3 seconds (simulates Supabase real-time)
  // Phase 2: Replace setTimeout with supabase.from('chat_sessions').update({user_a_wants_reveal: true})
  const handleReveal = useCallback(async () => {
    if (revealState !== "idle") return;

    // Immediately show "waiting" state to user who clicked
    setRevealState("waiting");

    // DEMO: Simulate peer accepting after 3 seconds
    setTimeout(() => {
      setPeerWantsReveal(true);
    }, 3000);
  }, [revealState]);

  return (
    <div className="flex flex-col h-dvh bg-surface max-w-2xl mx-auto relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <ChatHeader
        peerAlias={peerAlias}
        peerAvatar={peerAvatar}
        myAlias={myAlias}
        myAvatar={myAvatar}
        sharedInterests={session.shared_interests}
        revealState={revealState}
      />

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        myAlias={myAlias}
        myAvatar={myAvatar}
        peerAlias={peerAlias}
        peerAvatar={peerAvatar}
      />

      {/* ── Reveal button (hidden once revealed) ────────────────────────── */}
      {revealState !== "revealed" && (
        <RevealButton revealState={revealState} onReveal={handleReveal} />
      )}

      {/* ── Message input ───────────────────────────────────────────────── */}
      <MessageInput onSend={handleSend} />

      {/* ── Reveal modal overlay ────────────────────────────────────────── */}
      {revealState === "revealed" && (
        <RevealModal
          me={{
            name: currentUser.display_name,
            photo: currentUser.avatar_url,
            avatar_emoji: "🐯",
            instagram: currentUser.instagram_handle,
            linkedin: currentUser.linkedin_url,
          }}
          peer={{
            name: MOCK_PEER.real_name,
            photo: null,
            avatar_emoji: MOCK_PEER.avatar,
            instagram: MOCK_PEER.instagram,
            linkedin: MOCK_PEER.linkedin,
          }}
        />
      )}
    </div>
  );
}
