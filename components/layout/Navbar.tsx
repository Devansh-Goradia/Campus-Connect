'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { LogOut, MessageSquare, Compass, User } from 'lucide-react'
import { clsx } from 'clsx'

export function Navbar() {
  const { profile } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Discover', icon: Compass },
    { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  ]

  return (
    <nav className="bg-surface-card border-b border-surface-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-neon-cyan">
              <span className="text-xl">✨</span>
            </div>
            <span className="font-bold text-lg hidden sm:block bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              CampusConnect
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link 
                key={href} 
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(href) 
                    ? "bg-surface-muted text-neon-cyan" 
                    : "text-white/60 hover:text-white hover:bg-surface-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-muted border border-surface-border">
            <div className={clsx("h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", getAvatarColor(profile?.anonymous_alias))}>
              {getInitials(profile?.anonymous_alias)}
            </div>
            <span className="text-sm text-white/90 font-medium pr-1">
              {profile?.anonymous_alias}
            </span>
          </div>

          <button 
            onClick={handleSignOut}
            className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

      </div>
    </nav>
  )
}
