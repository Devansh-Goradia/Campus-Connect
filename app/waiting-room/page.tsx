'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WaitingRoomPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // Optional: Auto-refresh or subscribe to profile changes
  // In our AuthProvider, we listen to auth state, but maybe not deep profile changes.
  // For the MVP, a simple manual refresh or relying on them logging back in is okay,
  // but let's add a basic interval to check.
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
    }, 5000)

    return () => clearInterval(interval)
  }, [profile, router, supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neon-grid relative overflow-hidden">
      
      {/* Decorative radar background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[600px] h-[600px] border border-neon-cyan rounded-full animate-radar"></div>
        <div className="w-[400px] h-[400px] border border-neon-purple rounded-full animate-radar" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="z-10 bg-surface-card/80 backdrop-blur-xl border border-surface-border p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
        
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-surface-muted rounded-full mx-auto flex items-center justify-center border border-neon-cyan/50 animate-glow">
            <span className="text-4xl">⏳</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Verification Pending</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          Your Campus ID is currently under review by our admin team. This usually takes a few hours. 
          We'll let you in as soon as you're approved!
        </p>

        <div className="bg-surface-muted/50 rounded-xl p-4 mb-8 text-sm text-left border border-surface-border">
          <div className="flex justify-between mb-2">
            <span className="text-white/50">Status:</span>
            <span className="text-neon-cyan font-medium flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
              </span>
              In Review
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Alias:</span>
            <span className="text-white">{profile?.anonymous_alias || 'Assigning...'}</span>
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout} className="text-white/50">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
