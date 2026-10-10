'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { clsx } from 'clsx'
import { MessageSquare } from 'lucide-react'

// Basic type for our conversation list
export type ChatSessionItem = {
  id: string
  peerId: string
  peerAlias: string
  peerName: string
  peerRealPhoto: string | null
  isRevealed: boolean
  lastMessageAt: string
}

export default function InboxLayout({ children }: { children: React.ReactNode }) {
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
      // We need to join with profiles to get peer info.
      // Since user1_id could be me or peer, and user2_id could be me or peer,
      // it's a bit tricky to query nicely in one go with PostgREST without a view.
      // For MVP, fetch all where I'm involved, then map them.
      
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

    // Realtime subscription for sessions (to update order on new message or reveal)
    const channel = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_sessions',
        filter: `user1_id=eq.${profile.id}` // Wait, realtime filter on OR isn't supported easily.
      }, () => {
        // Just refetch on any change for simplicity in this MVP
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
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full border-x border-surface-border">
        
        {/* Sidebar (Conversations List) */}
        <div className={clsx(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-surface-border bg-surface-card",
          activeId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-surface-border">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neon-purple" />
              Conversations
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-surface-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-surface-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                No active chats yet. Go to Discover to find someone!
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {sessions.map(session => {
                  // If revealed, use real name, otherwise alias
                  const displayName = session.isRevealed ? session.peerName : session.peerAlias
                  const avatarClasses = getAvatarColor(session.peerAlias)
                  const initials = getInitials(displayName)
                  
                  return (
                    <Link 
                      key={session.id} 
                      href={`/inbox/${session.id}`}
                      className={clsx(
                        "flex items-center gap-3 p-4 hover:bg-surface-muted/50 transition-colors cursor-pointer",
                        activeId === session.id ? "bg-surface-muted border-l-2 border-neon-cyan" : ""
                      )}
                    >
                      <div className="relative">
                        {session.isRevealed && session.peerRealPhoto ? (
                          <img src={session.peerRealPhoto} alt="" className="w-12 h-12 rounded-full object-cover border border-surface-border" />
                        ) : (
                          <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-inner", avatarClasses)}>
                            {initials}
                          </div>
                        )}
                        {session.isRevealed && (
                          <div className="absolute -bottom-1 -right-1 bg-neon-pink w-4 h-4 rounded-full border-2 border-surface-card" title="Identity Revealed!"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={clsx(
                            "font-semibold truncate", 
                            session.isRevealed ? "text-neon-pink" : "text-white"
                          )}>
                            {displayName}
                          </h3>
                          <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">
                            {new Date(session.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {session.isRevealed ? "Real identity unlocked 🔓" : "Anonymous Chat"}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={clsx(
          "flex-1 flex flex-col bg-surface relative",
          !activeId ? "hidden md:flex" : "flex"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
