'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Profile } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { Filter, MessageCircle } from 'lucide-react'
import { clsx } from 'clsx'

const HOBBY_OPTIONS = [
  'AI & Data Science', 'Gym & Fitness', 'Drums & Music', 'Event Management', 
  'Trading & Finance', 'Gaming', 'Photography', 'Art & Design', 'Anime', 'Startups'
]

export default function DashboardPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [allPeers, setAllPeers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [initiatingId, setInitiatingId] = useState<string | null>(null)
  
  // Filters
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [hobbyFilters, setHobbyFilters] = useState<string[]>([])

  useEffect(() => {
    async function fetchPeers() {
      if (!profile) return
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'approved')
        .neq('id', profile.id)

      if (!error && data) {
        setAllPeers(data as Profile[])
      }
      setLoading(false)
    }
    
    fetchPeers()
  }, [profile, supabase])

  const filteredPeers = useMemo(() => {
    return allPeers.filter(peer => {
      if (genderFilter !== 'all' && peer.gender !== genderFilter) return false
      
      if (hobbyFilters.length > 0) {
        const hasMatchingHobby = hobbyFilters.some(h => peer.hobbies.includes(h))
        if (!hasMatchingHobby) return false
      }
      
      return true
    })
  }, [allPeers, genderFilter, hobbyFilters])

  const toggleHobbyFilter = (hobby: string) => {
    setHobbyFilters(prev => 
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    )
  }

  const handleStartChat = async (peerId: string) => {
    if (!profile) return
    setInitiatingId(peerId)

    // 1. Check if session already exists
    const { data: existingSessions, error: checkError } = await supabase
      .from('chat_sessions')
      .select('id')
      .or(`and(user1_id.eq.${profile.id},user2_id.eq.${peerId}),and(user1_id.eq.${peerId},user2_id.eq.${profile.id})`)
      .limit(1)

    if (checkError) {
      console.error(checkError)
      setInitiatingId(null)
      return
    }

    if (existingSessions && existingSessions.length > 0) {
      // Chat exists, go to it
      router.push(`/inbox/${existingSessions[0].id}`)
      return
    }

    // 2. Create new session (user1 is always initiator)
    const { data: newSession, error: insertError } = await supabase
      .from('chat_sessions')
      .insert({
        user1_id: profile.id,
        user2_id: peerId,
        user1_wants_reveal: false,
        user2_wants_reveal: false,
      })
      .select('id')
      .single()

    if (insertError || !newSession) {
      console.error(insertError)
      setInitiatingId(null)
      return
    }

    router.push(`/inbox/${newSession.id}`)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header & Filter Bar */}
        <div className="bg-surface-card border border-surface-border p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white/80">
            <Filter className="h-5 w-5 text-neon-cyan" />
            <h2 className="font-semibold text-lg">Filter Campus Pool</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-48">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Gender</label>
              <select
                className="w-full bg-surface-muted border border-surface-border text-sm text-white px-3 py-2 rounded-xl focus:outline-none focus:border-neon-cyan"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="all">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Shared Hobbies</label>
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map(hobby => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobbyFilter(hobby)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      hobbyFilters.includes(hobby)
                        ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                        : "bg-surface border-surface-border text-white/60 hover:border-white/30"
                    )}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-surface-card border border-surface-border rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredPeers.length === 0 ? (
            <div className="text-center p-20 bg-surface-card border border-surface-border rounded-2xl h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4 opacity-50">👻</div>
              <h3 className="text-xl font-medium text-white mb-2">No peers found</h3>
              <p className="text-white/50">Try adjusting your filters to see more people.</p>
              {hobbyFilters.length > 0 && (
                <Button variant="ghost" onClick={() => setHobbyFilters([])} className="mt-4 text-neon-cyan">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeers.map(peer => {
                const avatarColor = getAvatarColor(peer.anonymous_alias)
                const sharedHobbiesCount = peer.hobbies.filter(h => profile?.hobbies.includes(h)).length

                return (
                  <div key={peer.id} className="bg-surface-card border border-surface-border rounded-2xl p-5 flex flex-col hover:border-neon-cyan/50 transition-colors group">
                    <div className="flex gap-4 items-start mb-4">
                      <div className={clsx("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg", avatarColor)}>
                        {getInitials(peer.anonymous_alias)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-neon-cyan transition-colors">
                          {peer.anonymous_alias}
                        </h3>
                        <p className="text-xs text-white/50 uppercase tracking-wider">{peer.gender}</p>
                        {sharedHobbiesCount > 0 && (
                          <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 inline-block px-2 py-0.5 rounded border border-emerald-500/20">
                            {sharedHobbiesCount} shared {sharedHobbiesCount === 1 ? 'hobby' : 'hobbies'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-5">
                      <div className="flex flex-wrap gap-1.5">
                        {peer.hobbies.map(h => {
                          const isShared = profile?.hobbies.includes(h)
                          return (
                            <span 
                              key={h} 
                              className={clsx(
                                "text-[11px] px-2 py-1 rounded-full border",
                                isShared 
                                  ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" 
                                  : "bg-surface border-surface-border text-white/50"
                              )}
                            >
                              {h}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <Button 
                      variant="secondary" 
                      fullWidth 
                      className="group-hover:bg-neon-cyan group-hover:text-black group-hover:border-neon-cyan"
                      onClick={() => handleStartChat(peer.id)}
                      loading={initiatingId === peer.id}
                      disabled={initiatingId !== null && initiatingId !== peer.id}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
