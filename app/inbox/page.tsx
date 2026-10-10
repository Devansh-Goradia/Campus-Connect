export default function InboxEmptyPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neon-grid opacity-80 h-full">
      <div className="w-20 h-20 bg-surface-muted rounded-full flex items-center justify-center mb-6 border border-surface-border animate-pulse-slow">
        <span className="text-3xl">💬</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
      <p className="text-white/50 max-w-sm">
        Select a conversation from the sidebar or go to Discover to start a new anonymous chat.
      </p>
    </div>
  )
}
