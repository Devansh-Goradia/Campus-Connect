'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { MessageInput } from '@/components/chat/MessageInput'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { Button } from '@/components/ui/Button'
import { Shield, PartyPopper, Sparkles, AtSign } from 'lucide-react'
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!profile) return

    let mounted = true

    async function loadData() {
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
        if (mounted) router.push('/inbox')
        return
      }

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
    // Energetic colorful confetti burst
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981']
    })
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 5000)
  }

  const handleSendMessage = async (content: string) => {
    if (!profile || !session) return
    
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
    
    await supabase
      .from('chat_sessions')
      .update({ [updateField]: !currentValue })
      .eq('id', sessionId)
  }

  if (loading || !session) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isUser1 = session.user1_id === profile!.id
  const myRevealWants = isUser1 ? session.user1_wants_reveal : session.user2_wants_reveal
  
  const displayName = session.is_revealed ? session.peer.name : session.peer.anonymous_alias
  const avatarGradient = getAvatarColor(session.peer.anonymous_alias)

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 w-full relative font-sans">
      
      {/* Celebration Popup */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-zinc-900 border-2 border-indigo-500 p-8 rounded-3xl text-center shadow-2xl shadow-indigo-500/30 max-w-sm w-full space-y-3">
            <PartyPopper className="w-12 h-12 text-pink-400 mx-auto" />
            <h2 className="text-2xl font-extrabold text-white">
              Identities Unveiled! 🎉
            </h2>
            <p className="text-sm font-medium text-zinc-300">
              You both agreed to reveal! You are now chatting with:
            </p>
            <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              {session.peer.name}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {session.is_revealed && session.peer.real_photo_url ? (
              <img src={session.peer.real_photo_url} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400 shadow-md" />
            ) : (
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-md", avatarGradient)}>
                {getInitials(displayName)}
              </div>
            )}
            <div className={clsx(
              "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950",
              session.is_revealed ? "bg-pink-500" : "bg-emerald-400"
            )}></div>
          </div>
          
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              {displayName}
            </h2>
            {session.is_revealed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <span className="text-pink-400 font-bold">Mutual Match 💖</span>
                {session.peer.social_handles?.instagram && (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <AtSign className="h-3 w-3" /> {session.peer.social_handles.instagram}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Verified Student • Anonymous
              </p>
            )}
          </div>
        </div>

        <div>
          {!session.is_revealed ? (
            <Button 
              variant={myRevealWants ? "secondary" : "primary"}
              size="sm"
              onClick={handleRevealToggle}
              className={myRevealWants ? "text-zinc-300 border-white/20" : ""}
            >
              {myRevealWants ? "Waiting for peer... ⏳" : "Reveal Identity ✨"}
            </Button>
          ) : (
            <span className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Revealed!
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === profile!.id
          const showAvatar = !isMe && (idx === 0 || messages[idx-1].sender_id !== msg.sender_id)
          
          return (
            <div key={msg.id} className={clsx("flex gap-3", isMe ? "justify-end" : "justify-start")}>
              {!isMe && (
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm", avatarGradient)}>
                      {getInitials(displayName)}
                    </div>
                  )}
                </div>
              )}
              
              <div className={clsx(
                "max-w-[75%] rounded-3xl px-4.5 py-3 text-sm font-medium leading-relaxed shadow-sm",
                isMe 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-indigo-500/10" 
                  : "bg-zinc-900 border border-white/10 text-zinc-100 rounded-bl-sm"
              )}>
                {msg.content}
                <div className={clsx(
                  "text-[10px] mt-1 font-semibold text-right",
                  isMe ? "text-indigo-200" : "text-zinc-500"
                )}>
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
