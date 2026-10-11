'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, Profile } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { Filter, MessageCircle, Sparkles, Flame } from 'lucide-react'
import { clsx } from 'clsx'

const HOBBY_DATA: Record<string, { bg: string; text: string; border: string }> = {
  'AI & Data Science': { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  'Gym & Fitness':     { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'Drums & Music':     { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  'Event Management': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
  'Trading & Finance': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Gaming':            { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'Photography':       { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
  'Art & Design':      { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/30' },
  'Anime':             { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30' },
  'Startups':          { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30' },
};

const HOBBY_OPTIONS = Object.keys(HOBBY_DATA);

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

    // Check if session already exists
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
      router.push(`/inbox/${existingSessions[0].id}`)
      return
    }

    // Create new session
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
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* Bento Filter Header */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Filter className="h-4 w-4" />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Discover Campus Peers ✨
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
                Filter verified students by interests & gender. Everything is blind until mutual reveal!
              </p>
            </div>
            
            <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 self-start sm:self-auto text-xs font-bold text-zinc-300">
              {filteredPeers.length} Active Students
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-56">
              <label className="text-xs font-bold text-zinc-300 mb-2 block">
                Filter by Gender
              </label>
              <select
                className="w-full bg-zinc-900/80 border border-white/10 text-xs sm:text-sm font-semibold text-white px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  Filter by Hobbies
                </label>
                {hobbyFilters.length > 0 && (
                  <button 
                    onClick={() => setHobbyFilters([])}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map(hobby => {
                  const active = hobbyFilters.includes(hobby);
                  const style = HOBBY_DATA[hobby] || { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' };
                  
                  return (
                    <button
                      key={hobby}
                      onClick={() => toggleHobbyFilter(hobby)}
                      className={clsx(
                        "rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all duration-200 cursor-pointer active:scale-95",
                        active
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/30"
                          : `${style.bg} ${style.text} ${style.border} hover:brightness-125`
                      )}
                    >
                      {hobby}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Cards Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse"></div>
              ))}
            </div>
          ) : filteredPeers.length === 0 ? (
            <div className="text-center p-16 sm:p-24 rounded-3xl bg-white/5 border border-white/10 h-full flex flex-col items-center justify-center space-y-3">
              <div className="text-4xl mb-1">👀</div>
              <h3 className="text-lg font-extrabold text-white">
                No matching students found
              </h3>
              <p className="text-sm font-medium text-zinc-400 max-w-sm">
                Try switching up your filters to discover more awesome campus peers!
              </p>
              {hobbyFilters.length > 0 && (
                <div className="pt-2">
                  <Button variant="secondary" onClick={() => setHobbyFilters([])} size="sm">
                    Reset Hobby Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPeers.map(peer => {
                const avatarGradient = getAvatarColor(peer.anonymous_alias)
                const sharedHobbies = peer.hobbies.filter(h => profile?.hobbies.includes(h))

                return (
                  <div 
                    key={peer.id} 
                    className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-white/20 transition-all duration-300 relative group"
                  >
                    <div>
                      {/* Top profile header: Big friendly avatar + Name */}
                      <div className="flex gap-4 items-center mb-4">
                        <div className={clsx("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-lg shadow-indigo-500/20 shrink-0", avatarGradient)}>
                          {getInitials(peer.anonymous_alias)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-base text-white truncate group-hover:text-indigo-300 transition-colors">
                            {peer.anonymous_alias}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-zinc-400 capitalize px-2 py-0.5 rounded-full bg-white/10">
                              {peer.gender}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Overlapping focus hype tag */}
                      {sharedHobbies.length > 0 && (
                        <div className="mb-4 px-3 py-1.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-pink-400 shrink-0" />
                          <span className="text-xs font-bold text-indigo-300">
                            {sharedHobbies.length} Shared {sharedHobbies.length === 1 ? 'Interest' : 'Interests'}!
                          </span>
                        </div>
                      )}

                      {/* Colorful Hobby Chips */}
                      <div className="mb-6 flex flex-wrap gap-1.5">
                        {peer.hobbies.map(h => {
                          const isShared = profile?.hobbies.includes(h);
                          const style = HOBBY_DATA[h] || { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' };
                          
                          return (
                            <span 
                              key={h} 
                              className={clsx(
                                "rounded-full px-3 py-1 text-xs font-bold border transition-all",
                                isShared 
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-sm" 
                                  : `${style.bg} ${style.text} ${style.border}`
                              )}
                            >
                              {h}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button 
                        variant="primary" 
                        fullWidth 
                        size="md"
                        onClick={() => handleStartChat(peer.id)}
                        loading={initiatingId === peer.id}
                        disabled={initiatingId !== null && initiatingId !== peer.id}
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Start Chatting
                      </Button>
                    </div>
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
