'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'

type PendingUser = Profile & {
  idImageUrl?: string
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const supabase = createClient()

  const loadPendingUsers = async () => {
    setLoading(true)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })

    if (error || !profiles) {
      console.error(error)
      setLoading(false)
      return
    }

    // Fetch signed URLs for the ID images
    const usersWithImages = await Promise.all(
      profiles.map(async (profile) => {
        let idImageUrl = undefined
        if (profile.campus_id_url) {
          const { data } = await supabase.storage
            .from('campus-ids')
            .createSignedUrl(profile.campus_id_url, 60 * 60) // 1 hour
          
          if (data?.signedUrl) {
            idImageUrl = data.signedUrl
          }
        }
        return { ...profile, idImageUrl } as PendingUser
      })
    )

    setPendingUsers(usersWithImages)
    setLoading(false)
  }

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const handleAction = async (userId: string, action: 'approved' | 'rejected') => {
    setProcessingId(userId)
    
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: action })
      .eq('id', userId)

    if (!error) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } else {
      console.error(error)
      alert("Failed to update user")
    }
    
    setProcessingId(null)
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
          <div>
            <h1 className="text-3xl font-bold text-red-400 flex items-center gap-3">
              <span>🛡️</span> Admin Dashboard
            </h1>
            <p className="text-white/60 mt-1">Review and approve pending student verifications</p>
          </div>
          <div className="bg-surface-card px-4 py-2 rounded-xl border border-surface-border">
            <span className="text-white/60 text-sm mr-2">Pending Queue:</span>
            <span className="font-bold text-neon-cyan">{pendingUsers.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center p-20 bg-surface-card border border-surface-border rounded-2xl">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">Queue is empty!</h2>
            <p className="text-white/50">All students have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="h-48 bg-surface-muted relative border-b border-surface-border group">
                  {user.idImageUrl ? (
                    <img 
                      src={user.idImageUrl} 
                      alt="Campus ID" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-zoom-in"
                      onClick={() => window.open(user.idImageUrl, '_blank')}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/30 text-sm">
                      No Image Provided
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                    Click to enlarge
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-white/50">{user.anonymous_alias}</p>
                    </div>
                    <span className="px-2 py-1 bg-surface-muted rounded text-xs font-medium text-white/70">
                      {user.gender}
                    </span>
                  </div>

                  <div className="mb-6 flex-1">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Hobbies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.hobbies.map(h => (
                        <span key={h} className="text-xs px-2 py-1 bg-surface-muted rounded-full border border-surface-border/50 text-white/70">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button 
                      variant="danger" 
                      onClick={() => handleAction(user.id, 'rejected')}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="primary" 
                      className="bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-500 shadow-emerald-500/20"
                      onClick={() => handleAction(user.id, 'approved')}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
