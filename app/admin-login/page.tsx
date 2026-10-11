'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        await supabase.auth.signOut()
        setError("Unauthorized. You are not an admin.")
        setLoading(false)
        return
      }
      
      router.refresh()
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6 animate-fade-in">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 items-center justify-center shadow-lg shadow-rose-500/20 mb-2">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Admin Portal 🛡️
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            Institutional verification & ID review
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Admin Email"
            placeholder="admin@campusconnect.edu"
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
            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
              Authenticate Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
