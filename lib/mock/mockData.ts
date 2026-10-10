import { User, ChatSession, Message, PendingUser, Interest } from "@/types";

// ─── Current Demo User ────────────────────────────────────────────────────────
export const MOCK_CURRENT_USER: User = {
  id: "mock-user-001",
  display_name: "Arjun Mehta",
  email: "arjun.mehta@campus.edu",
  avatar_url: "/avatars/demo-arjun.jpg",
  campus_id_url: "/ids/demo-id.jpg",
  verification_status: "approved",
  instagram_handle: "@arjun.builds",
  linkedin_url: "linkedin.com/in/arjunmehta",
  created_at: new Date().toISOString(),
};

// ─── Mock Peer (the matched user) ─────────────────────────────────────────────
export const MOCK_PEER = {
  id: "mock-user-002",
  alias: "Anonymous Panda",
  avatar: "🐼",
  real_name: "Priya Sharma",
  real_photo: "/avatars/demo-priya.jpg",
  instagram: "@priya.creates",
  linkedin: "linkedin.com/in/priyasharma",
  sharedInterests: ["AI / ML", "Startup Pitching", "Gym"],
};

// ─── Mock Chat Session ────────────────────────────────────────────────────────
export const MOCK_SESSION: ChatSession = {
  id: "mock-session-001",
  user_a_id: "mock-user-001",
  user_b_id: "mock-user-002",
  alias_a: "Anonymous Tiger",
  alias_b: "Anonymous Panda",
  avatar_a: "🐯",
  avatar_b: "🐼",
  shared_interests: ["AI / ML", "Startup Pitching", "Gym"],
  user_a_wants_reveal: false,
  user_b_wants_reveal: false,
  revealed_at: null,
  status: "active",
  created_at: new Date().toISOString(),
};

// ─── Mock Messages ────────────────────────────────────────────────────────────
export const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-001",
    session_id: "mock-session-001",
    sender_id: "mock-user-002",
    content: "Hey! Wild that we both picked AI and gym 😂 Are you actually training a model right now or just vibing?",
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-002",
    session_id: "mock-session-001",
    sender_id: "mock-user-001",
    content: "Lmao both honestly. I'm fine-tuning a small LLM for my startup pitch next week 🚀",
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-003",
    session_id: "mock-session-001",
    sender_id: "mock-user-002",
    content: "No way, what's the pitch about? I'm doing something in the health-tech space",
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-004",
    session_id: "mock-session-001",
    sender_id: "mock-user-001",
    content: "AI workout planning — basically your personal coach that actually knows what it's doing 🏋️",
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-005",
    session_id: "mock-session-001",
    sender_id: "mock-user-002",
    content: "Okay that's actually insane, we need to talk. The overlap here is real 👀",
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

// ─── Mock Pending Admin Users ─────────────────────────────────────────────────
export const MOCK_PENDING_USERS: PendingUser[] = [
  {
    id: "pending-001",
    display_name: "Rishi Kapoor",
    email: "rishi.k@campus.edu",
    campus_id_url: "https://placehold.co/400x250/111111/00f5ff?text=Campus+ID",
    avatar_url: null,
    created_at: "2026-10-10T12:15:00.000Z",
  },
  {
    id: "pending-002",
    display_name: "Anika Patel",
    email: "anika.p@campus.edu",
    campus_id_url: "https://placehold.co/400x250/111111/bf5fff?text=Campus+ID",
    avatar_url: null,
    created_at: "2026-10-10T11:50:00.000Z",
  },
  {
    id: "pending-003",
    display_name: "Dev Sharma",
    email: "dev.s@campus.edu",
    campus_id_url: "https://placehold.co/400x250/111111/39ff14?text=Campus+ID",
    avatar_url: null,
    created_at: "2026-10-10T10:30:00.000Z",
  },
];

// ─── Available Interests ──────────────────────────────────────────────────────
export const INTERESTS: Interest[] = [
  { id: 1,  label: "AI / ML",          emoji: "🤖", color: "blue"   },
  { id: 2,  label: "Coding",           emoji: "💻", color: "cyan"   },
  { id: 3,  label: "Startup Pitching", emoji: "🚀", color: "purple" },
  { id: 4,  label: "Gym",              emoji: "🏋️", color: "green"  },
  { id: 5,  label: "Trading",          emoji: "📈", color: "yellow" },
  { id: 6,  label: "Nightlife",        emoji: "🌃", color: "pink"   },
  { id: 7,  label: "Drums",            emoji: "🥁", color: "orange" },
  { id: 8,  label: "Photography",      emoji: "📸", color: "rose"   },
  { id: 9,  label: "Gaming",           emoji: "🎮", color: "indigo" },
  { id: 10, label: "Music Production", emoji: "🎧", color: "violet" },
  { id: 11, label: "Reading",          emoji: "📚", color: "amber"  },
  { id: 12, label: "Film & Cinema",    emoji: "🎬", color: "red"    },
];
