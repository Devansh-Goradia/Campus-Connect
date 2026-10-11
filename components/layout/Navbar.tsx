'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { getAvatarColor, getInitials } from '@/utils/avatar'
import { LogOut, MessageSquare, Compass, Sparkles } from 'lucide-react'
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
    <nav className="bg-zinc-950/75 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                CampusConnect
              </span>
              <span className="text-[10px] font-bold text-zinc-400 -mt-0.5">
                Exclusive Student Club
              </span>
            </div>
          </Link>

          {/* Navigation Pills */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link 
                  key={href} 
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
                    active 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Badge & Signout */}
        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm">
              <div className={clsx("h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm", getAvatarColor(profile?.anonymous_alias))}>
                {getInitials(profile?.anonymous_alias)}
              </div>
              <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px] sm:max-w-none">
                {profile?.anonymous_alias}
              </span>
            </div>
          )}

          <button 
            onClick={handleSignOut}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors active:scale-95 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </nav>
  )
}
