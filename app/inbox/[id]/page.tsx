'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { MessageInput } from '@/components/chat/MessageInput'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { Button } from '@/components/ui/Button'
import { ShieldAlert, PartyPopper } from 'lucide-react'
import confetti from 'canvas-confetti'
import { clsx } from 'clsx'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
}

type SessionDetails = {
  id: string
  is_revealed: boolean
  user1_id: string
  user2_id: string
  user1_wants_reveal: boolean
  user2_wants_reveal: boolean
  peer: {
    id: string
    name: string
    anonymous_alias: string
    real_photo_url: string | null
    social_handles: Record<string, string>
  }
}

export default function ChatRoomPage() {
  const params = useParams()
  const sessionId = params.id as string
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat and messages
  useEffect(() => {
    if (!profile) return

    let mounted = true

    async function loadData() {
      // Fetch session
      const { data: sData, error: sError } = await supabase
        .from('chat_sessions')
        .select(`
          id, is_revealed, user1_id, user2_id, user1_wants_reveal, user2_wants_reveal,
          user1:profiles!user1_id(id, name, anonymous_alias, real_photo_url, social_handles),
          user2:profiles!user2_id(id, name, anonymous_alias, real_photo_url, social_handles)
        `)
        .eq('id', sessionId)
        .single()

      if (sError || !sData) {
        if (mounted) {
          router.push('/inbox')
        }
        return
      }

      // Check if user is part of this chat
      if (sData.user1_id !== profile!.id && sData.user2_id !== profile!.id) {
        if (mounted) router.push('/inbox')
        return
      }

      const isUser1 = sData.user1_id === profile!.id
      const peer = isUser1 ? sData.user2 : sData.user1

      if (mounted) {
        setSession({
          id: sData.id,
          is_revealed: sData.is_revealed,
          user1_id: sData.user1_id,
          user2_id: sData.user2_id,
          user1_wants_reveal: sData.user1_wants_reveal,
          user2_wants_reveal: sData.user2_wants_reveal,
          peer: peer as any
        })
      }

      // Fetch messages
      const { data: mData } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true })

      if (mData && mounted) {
        setMessages(mData)
        setLoading(false)
      }
    }

    loadData()

    // Subscriptions
    const msgChannel = supabase
      .channel(`messages:${sessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_session_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    const sessionChannel = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        setSession(prev => {
          if (!prev) return prev
          
          // Trigger celebration if it just got revealed
          if (!prev.is_revealed && payload.new.is_revealed) {
            triggerCelebration()
          }
          
          return {
            ...prev,
            is_revealed: payload.new.is_revealed,
            user1_wants_reveal: payload.new.user1_wants_reveal,
            user2_wants_reveal: payload.new.user2_wants_reveal,
          }
        })
      })
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(sessionChannel)
    }
  }, [sessionId, profile, supabase, router])

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5ff', '#ff10f0', '#bf5fff']
    })
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 5000)
  }

  const handleSendMessage = async (content: string) => {
    if (!profile || !session) return
    
    // Optimistic UI could go here, but for MVP we rely on realtime return.
    // Let's just insert.
    await supabase.from('messages').insert({
      chat_session_id: sessionId,
      sender_id: profile.id,
      content
    })
  }

  const handleRevealToggle = async () => {
    if (!profile || !session) return
    
    const isUser1 = session.user1_id === profile.id
    const updateField = isUser1 ? 'user1_wants_reveal' : 'user2_wants_reveal'
    const currentValue = isUser1 ? session.user1_wants_reveal : session.user2_wants_reveal
    
    // Toggle the reveal flag
    await supabase
      .from('chat_sessions')
      .update({ [updateField]: !currentValue })
      .eq('id', sessionId)
  }

  if (loading || !session) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isUser1 = session.user1_id === profile!.id
  const myRevealWants = isUser1 ? session.user1_wants_reveal : session.user2_wants_reveal
  
  const displayName = session.is_revealed ? session.peer.name : session.peer.anonymous_alias
  const avatarClasses = getAvatarColor(session.peer.anonymous_alias)

  return (
    <div className="flex flex-col h-full bg-surface-card w-full relative">
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-surface border-2 border-neon-cyan p-8 rounded-3xl text-center shadow-neon-cyan animate-bounce-in">
            <PartyPopper className="w-16 h-16 text-neon-pink mx-auto mb-4" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-2">
              Identity Revealed!
            </h2>
            <p className="text-white">You are now chatting with {session.peer.name}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-border bg-surface/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            {session.is_revealed && session.peer.real_photo_url ? (
              <img src={session.peer.real_photo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-neon-cyan" />
            ) : (
              <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg", avatarClasses)}>
                {getInitials(displayName)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface-card"></div>
          </div>
          
          <div>
            <h2 className={clsx("font-bold text-lg", session.is_revealed ? "text-neon-cyan" : "text-white")}>
              {displayName}
            </h2>
            {session.is_revealed ? (
              <div className="flex items-center gap-2 text-xs text-white/60">
                {session.peer.social_handles?.instagram && (
                  <span>IG: {session.peer.social_handles.instagram}</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/50 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-neon-purple" />
                Anonymous Peer
              </p>
            )}
          </div>
        </div>

        <div>
          {!session.is_revealed ? (
            <Button 
              variant={myRevealWants ? "secondary" : "neon"}
              size="sm"
              onClick={handleRevealToggle}
              className={myRevealWants ? "text-white/50" : ""}
            >
              {myRevealWants ? "Waiting for peer..." : "Reveal Identity"}
            </Button>
          ) : (
            <span className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium rounded-full flex items-center gap-2">
              <PartyPopper className="w-4 h-4" /> Revealed
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === profile!.id
          const showAvatar = !isMe && (idx === 0 || messages[idx-1].sender_id !== msg.sender_id)
          
          return (
            <div key={msg.id} className={clsx("flex gap-3", isMe ? "justify-end" : "justify-start")}>
              {!isMe && (
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white", avatarClasses)}>
                      {getInitials(displayName)}
                    </div>
                  )}
                </div>
              )}
              
              <div className={clsx(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                isMe 
                  ? "bg-neon-cyan/20 border border-neon-cyan/30 text-white rounded-br-sm" 
                  : "bg-surface border border-surface-border text-white rounded-bl-sm"
              )}>
                {msg.content}
                <div className={clsx("text-[10px] mt-1 opacity-50 text-right", isMe ? "text-neon-cyan" : "text-white")}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
