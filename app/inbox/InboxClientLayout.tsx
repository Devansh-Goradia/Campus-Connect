'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { clsx } from 'clsx'
import { MessageSquare, Sparkles, PartyPopper } from 'lucide-react'

export type ChatSessionItem = {
  id: string
  peerId: string
  peerAlias: string
  peerName: string
  peerRealPhoto: string | null
  isRevealed: boolean
  lastMessageAt: string
}

export default function InboxClientLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [sessions, setSessions] = useState<ChatSessionItem[]>([])
  const [loading, setLoading] = useState(true)

  const activeId = params.id as string | undefined

  useEffect(() => {
    if (!profile) return

    async function fetchSessions() {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          user1_id,
          user2_id,
          is_revealed,
          last_message_at,
          user1:profiles!user1_id(id, name, anonymous_alias, real_photo_url),
          user2:profiles!user2_id(id, name, anonymous_alias, real_photo_url)
        `)
        .or(`user1_id.eq.${profile!.id},user2_id.eq.${profile!.id}`)
        .order('last_message_at', { ascending: false })

      if (error || !data) {
        console.error(error)
        setLoading(false)
        return
      }

      const mapped = data.map((session: any) => {
        const isUser1 = session.user1_id === profile!.id
        const peer = isUser1 ? session.user2 : session.user1
        
        return {
          id: session.id,
          peerId: peer.id,
          peerAlias: peer.anonymous_alias,
          peerName: peer.name,
          peerRealPhoto: peer.real_photo_url,
          isRevealed: session.is_revealed,
          lastMessageAt: session.last_message_at
        }
      })

      setSessions(mapped)
      setLoading(false)
    }

    fetchSessions()

    const channel = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_sessions',
        filter: `user1_id=eq.${profile.id}`
      }, () => {
        fetchSessions()
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_sessions',
        filter: `user2_id=eq.${profile.id}`
      }, () => {
        fetchSessions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, supabase])

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full border-x border-white/10">
        
        {/* Sidebar */}
        <div className={clsx(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-white/10 bg-zinc-950/60 backdrop-blur-xl",
          activeId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Your Chats
            </h2>
            <span className="text-xs font-bold text-zinc-400 px-2.5 py-0.5 rounded-full bg-white/10">
              {sessions.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse p-3 rounded-2xl bg-white/5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
                      <div className="h-2 bg-white/5 rounded-full w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-zinc-400 space-y-2">
                <div className="text-3xl mb-1">💬</div>
                <p>No active chats yet!</p>
                <p className="text-xs text-zinc-500">Hit Discover to connect with someone.</p>
              </div>
            ) : (
              sessions.map(session => {
                const displayName = session.isRevealed ? session.peerName : session.peerAlias
                const avatarClasses = getAvatarColor(session.peerAlias)
                const initials = getInitials(displayName)
                const isActive = activeId === session.id
                
                return (
                  <Link 
                    key={session.id} 
                    href={`/inbox/${session.id}`}
                    className={clsx(
                      "flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer relative",
                      isActive 
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-md" 
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      {session.isRevealed && session.peerRealPhoto ? (
                        <img src={session.peerRealPhoto} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400 shadow-md" />
                      ) : (
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-md", avatarClasses)}>
                          {initials}
                        </div>
                      )}
                      {session.isRevealed && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-1 rounded-full border-2 border-zinc-950" title="Identity Unlocked!">
                          <PartyPopper className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={clsx(
                          "font-bold text-sm truncate", 
                          session.isRevealed ? "text-pink-300 font-extrabold" : "text-white"
                        )}>
                          {displayName}
                        </h3>
                        <span className="text-[10px] font-semibold text-zinc-500 whitespace-nowrap ml-2">
                          {new Date(session.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-400 truncate">
                        {session.isRevealed ? "Real identity revealed! 🎉" : "Anonymous conversation"}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={clsx(
          "flex-1 flex flex-col bg-zinc-950/40 relative",
          !activeId ? "hidden md:flex" : "flex"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
