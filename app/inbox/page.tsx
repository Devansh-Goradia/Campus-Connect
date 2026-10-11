export default function InboxEmptyPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
        <span className="text-3xl">💬</span>
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-xl font-extrabold text-white">
          Your Conversations
        </h2>
        <p className="text-sm font-medium text-zinc-400">
          Pick a chat from the sidebar or head over to Discover to start meeting new people on campus!
        </p>
      </div>
    </div>
  )
}
