'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 animate-fade-in space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/25 mb-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Back 👋</span>
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            Sign in to unlock your active peer chats
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Campus Email"
            placeholder="you@campus.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In 🚀
            </Button>
          </div>
        </form>

        <p className="text-center text-xs font-semibold text-zinc-400">
          New to CampusConnect?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline underline-offset-4">
            Claim Your Spot
          </Link>
        </p>
      </div>
    </div>
  )
}
