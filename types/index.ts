// ─── Shared TypeScript Types ──────────────────────────────────────────────────

export type VerificationStatus = "pending" | "approved" | "rejected";
export type RevealState = "idle" | "waiting" | "revealed";
export type SessionStatus = "active" | "revealed" | "ended";

export interface User {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  campus_id_url: string | null;
  verification_status: VerificationStatus;
  instagram_handle: string | null;
  linkedin_url: string | null;
  created_at: string;
}

export interface Interest {
  id: number;
  label: string;
  emoji: string;
  color: string;
}

export interface ChatSession {
  id: string;
  user_a_id: string;
  user_b_id: string;
  alias_a: string;
  alias_b: string;
  avatar_a: string;
  avatar_b: string;
  shared_interests: string[];
  user_a_wants_reveal: boolean;
  user_b_wants_reveal: boolean;
  revealed_at: string | null;
  status: SessionStatus;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface PendingUser {
  id: string;
  display_name: string;
  email: string;
  campus_id_url: string;
  avatar_url: string | null;
  created_at: string;
}

export interface PublicProfile {
  display_name: string;
  avatar_url: string;
  instagram_handle: string | null;
  linkedin_url: string | null;
}
