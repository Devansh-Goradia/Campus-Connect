'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function WaitingRoomPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  useEffect(() => {
    if (!profile) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', profile.id)
        .single()
        
      if (data?.verification_status === 'approved') {
        router.refresh()
        router.push('/dashboard')
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [profile, router, supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="fixed top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-pink-500/20 blur-[100px] pointer-events-none" />

      {/* Main Hype Drop Card */}
      <div className="z-10 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl shadow-indigo-500/20 max-w-md w-full text-center space-y-6 animate-fade-in relative">
        
        {/* Pulsing Colorful Glowing Ring around Icon */}
        <div className="flex justify-center my-2">
          <div className="relative">
            {/* Outer animated gradient glow rings */}
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-md animate-pulse-glow" />
            <div className="relative h-20 w-20 rounded-full bg-zinc-950 border-2 border-white/20 flex items-center justify-center shadow-2xl">
              <Sparkles className="h-9 w-9 text-indigo-400 stroke-[2.2] animate-bounce" />
            </div>
          </div>
        </div>

        {/* Hype Queue Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-pink-400" />
            <span>VIP Drop Queue Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            You&apos;re on the{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Guestlist! 🎟️
            </span>
          </h1>
          <p className="text-sm font-medium text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Our campus admins are speed-checking your Student ID right now. As soon as you&apos;re approved, you&apos;ll be instantly dropped into the discovery pool!
          </p>
        </div>

        {/* Live Queue Status Bento Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 text-left space-y-3 font-sans">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
            <span className="text-xs font-bold text-zinc-400">Queue Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              In Review
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-zinc-400">Your Anonymous Alias</span>
            <span className="font-bold text-white bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {profile?.anonymous_alias || 'Assigning...'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-zinc-400">Live Sync</span>
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Auto-unlocks when ready
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button variant="ghost" onClick={handleLogout} fullWidth size="md">
            Sign Out
          </Button>
        </div>

      </div>

      <p className="mt-8 text-xs font-semibold text-zinc-500">
        Exclusive Walled Garden • Real Students Only
      </p>
    </div>
  )
}
