'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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

    // Verify they are actually an admin
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-red-900/10">
      <div className="w-full max-w-md bg-surface-card border-2 border-red-500/20 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-400">Admin Portal</h1>
          <p className="text-white/50 mt-2 text-sm">Strictly restricted access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-red-500/30 focus:border-red-500 focus:ring-red-500/50"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-red-500/30 focus:border-red-500 focus:ring-red-500/50"
          />

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-sm text-red-200">
              {error}
            </div>
          )}

          <Button type="submit" variant="danger" fullWidth loading={loading}>
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  )
}
