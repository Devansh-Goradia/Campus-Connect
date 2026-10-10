"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Users, Eye } from "lucide-react";
import { PendingUser } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MOCK_PENDING_USERS } from "@/lib/mock/mockData";

interface PendingCardProps {
  user: PendingUser;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  status: "pending" | "approved" | "rejected";
  nowMs: number;
}

function formatAgo(iso: string, nowMs: number) {
  const diff = nowMs - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function PendingCard({ user, onApprove, onReject, status, nowMs }: PendingCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    await new Promise((r) => setTimeout(r, 800)); // Phase 2: Supabase update
    onApprove(user.id);
    setApproving(false);
  };

  return (
    <Card
      className={`space-y-4 transition-all ${
        status === "approved"
          ? "border-neon-green/30 bg-neon-green/5"
          : status === "rejected"
          ? "border-red-500/20 opacity-50"
          : ""
      }`}
    >
      {/* User info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{user.display_name}</p>
          <p className="text-xs text-white/40 truncate">{user.email}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-white/30" />
            <span className="text-xs text-white/30">Submitted {formatAgo(user.created_at, nowMs)}</span>
          </div>
        </div>
        {status === "approved" && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-neon-green font-semibold">
            <CheckCircle className="h-4 w-4" /> Approved
          </span>
        )}
        {status === "rejected" && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-red-400 font-semibold">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        )}
      </div>

      {/* ID Image */}
      <div className="relative rounded-xl overflow-hidden border border-surface-border bg-surface-muted aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.campus_id_url}
          alt="Campus ID"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => setPreviewOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group"
        >
          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={approving}
            onClick={handleApprove}
            className="bg-neon-green text-black hover:brightness-110"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={() => onReject(user.id)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      )}

      {/* Full-screen preview */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setPreviewOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.campus_id_url}
            alt="Campus ID Full"
            className="max-w-full max-h-full rounded-2xl border border-surface-border"
          />
        </div>
      )}
    </Card>
  );
}

export function AdminDashboard() {
  const [statuses, setStatuses] = useState<Record<string, "pending" | "approved" | "rejected">>(
    Object.fromEntries(MOCK_PENDING_USERS.map((u) => [u.id, "pending"]))
  );
  // Compute current time client-side only to avoid prerender Date.now() error
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => { setNowMs(Date.now()); }, []);

  const approve = (id: string) => setStatuses((s) => ({ ...s, [id]: "approved" }));
  const reject = (id: string) => setStatuses((s) => ({ ...s, [id]: "rejected" }));

  const pending = MOCK_PENDING_USERS.filter((u) => statuses[u.id] === "pending").length;
  const approved = MOCK_PENDING_USERS.filter((u) => statuses[u.id] === "approved").length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-surface-border bg-surface-card/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-neon-cyan">⚡</span> Admin · CampusConnect
            </h1>
            <p className="text-xs text-white/40 mt-0.5">Verification Dashboard · Hidden Route</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-neon-orange/10 border border-neon-orange/30">
              <p className="text-xl font-bold text-neon-orange">{pending}</p>
              <p className="text-xs text-white/40">Pending</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/30">
              <p className="text-xl font-bold text-neon-green">{approved}</p>
              <p className="text-xs text-white/40">Approved</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
              <p className="text-xl font-bold text-neon-cyan">{MOCK_PENDING_USERS.length}</p>
              <p className="text-xs text-white/40">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Pending Verifications
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_PENDING_USERS.map((user) => (
            <PendingCard
              key={user.id}
              user={user}
              status={statuses[user.id]}
              onApprove={approve}
              onReject={reject}
              nowMs={nowMs}
            />
          ))}
        </div>
        {MOCK_PENDING_USERS.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <p className="text-4xl mb-3">✅</p>
            <p>All caught up! No pending verifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
