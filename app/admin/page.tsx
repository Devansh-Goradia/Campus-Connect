'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { ShieldCheck, UserX, Clock, ExternalLink } from 'lucide-react'

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

    const usersWithImages = await Promise.all(
      profiles.map(async (profile) => {
        let idImageUrl = undefined
        if (profile.campus_id_url) {
          const { data } = await supabase.storage
            .from('campus-ids')
            .createSignedUrl(profile.campus_id_url, 60 * 60)
          
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
      alert("Failed to update user authorization")
    }
    
    setProcessingId(null)
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                Verification Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student ID Queue 🎓
            </h1>
            <p className="text-sm font-medium text-zinc-400 mt-1">
              Review and approve pending student identification cards for admission.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-400">Pending Review:</span>
            <span className="text-sm font-extrabold text-indigo-400">
              {pendingUsers.length}
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center p-16 sm:p-24 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="text-4xl">🎉</div>
            <h2 className="text-xl font-extrabold text-white">
              Queue is Empty!
            </h2>
            <p className="text-sm font-medium text-zinc-400">
              All student ID verifications have been approved or rejected.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map(user => (
              <div key={user.id} className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl hover:border-white/20 transition-all">
                
                {/* ID Photo Preview */}
                <div className="h-52 bg-zinc-900 relative border-b border-white/10 group overflow-hidden">
                  {user.idImageUrl ? (
                    <img 
                      src={user.idImageUrl} 
                      alt="Submitted Campus ID" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                      onClick={() => window.open(user.idImageUrl, '_blank')}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs font-semibold">
                      No Photo Uploaded
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 bg-black/80 px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 backdrop-blur-sm">
                    <ExternalLink className="w-3 h-3" /> Zoom
                  </div>
                </div>
                
                {/* Dossier Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-base text-white">{user.name}</h3>
                        <p className="text-xs font-bold text-indigo-400 mt-0.5">{user.anonymous_alias}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs font-bold text-zinc-300 capitalize">
                        {user.gender}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-zinc-400 mb-1.5">Hobbies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.hobbies.map(h => (
                          <span key={h} className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleAction(user.id, 'rejected')}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleAction(user.id, 'approved')}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve
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
