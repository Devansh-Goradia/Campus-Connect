'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  name: string
  gender: string
  hobbies: string[]
  social_handles: Record<string, string>
  verification_status: 'pending' | 'approved' | 'rejected'
  campus_id_url: string | null
  avatar_url: string | null
  real_photo_url: string | null
  anonymous_alias: string
  is_admin: boolean
}

type AuthState = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
  })

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        if (mounted) setState({ user: null, profile: null, isLoading: false, isAdmin: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (mounted) {
        setState({
          user: session.user,
          profile: profile as Profile | null,
          isLoading: false,
          isAdmin: profile?.is_admin || false
        })
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        if (mounted) setState({ user: null, profile: null, isLoading: false, isAdmin: false })
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (mounted) {
          setState({
            user: session.user,
            profile: profile as Profile | null,
            isLoading: false,
            isAdmin: profile?.is_admin || false
          })
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
