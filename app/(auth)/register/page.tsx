'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sparkles, Camera, Check, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

const HOBBY_DATA: { name: string; color: string; activeColor: string }[] = [
  { name: 'AI & Data Science', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', activeColor: 'bg-indigo-500 text-white border-indigo-400' },
  { name: 'Gym & Fitness', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', activeColor: 'bg-emerald-500 text-white border-emerald-400' },
  { name: 'Drums & Music', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', activeColor: 'bg-purple-500 text-white border-purple-400' },
  { name: 'Event Management', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30', activeColor: 'bg-pink-500 text-white border-pink-400' },
  { name: 'Trading & Finance', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', activeColor: 'bg-amber-500 text-white border-amber-400' },
  { name: 'Gaming', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', activeColor: 'bg-cyan-500 text-white border-cyan-400' },
  { name: 'Photography', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', activeColor: 'bg-rose-500 text-white border-rose-400' },
  { name: 'Art & Design', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30', activeColor: 'bg-violet-500 text-white border-violet-400' },
  { name: 'Anime', color: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30', activeColor: 'bg-fuchsia-500 text-white border-fuchsia-400' },
  { name: 'Startups', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30', activeColor: 'bg-teal-500 text-white border-teal-400' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Step 2
  const [name, setName] = useState('')
  const [gender, setGender] = useState('prefer-not-to-say')
  const [hobbies, setHobbies] = useState<string[]>([])
  
  // Step 3
  const [idFile, setIdFile] = useState<File | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setStep(2)
    setLoading(false)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || hobbies.length === 0) {
      setError('Please provide your name and pick at least 1 hobby.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session timed out. Please sign in again.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: session.user.id,
        name, 
        gender, 
        hobbies 
      })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    setStep(3)
    setLoading(false)
  }

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile) {
      setError('Please snap or upload a photo of your Campus ID.')
      return
    }
    
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session timed out.')
      setLoading(false)
      return
    }

    const fileExt = idFile.name.split('.').pop()
    const filePath = `${session.user.id}/campus_id.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('campus-ids')
      .upload(filePath, idFile, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { error: finalProfileError } = await supabase
      .from('profiles')
      .update({ campus_id_url: filePath, verification_status: 'pending' })
      .eq('id', session.user.id)

    if (finalProfileError) {
      setError(finalProfileError.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/waiting-room')
  }

  const toggleHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby))
    } else {
      if (hobbies.length >= 5) return
      setHobbies([...hobbies, hobby])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-500/10 animate-fade-in space-y-6">
        
        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={clsx(
                "h-2 flex-1 rounded-full transition-all duration-300",
                s <= step 
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 shadow-sm shadow-indigo-500/30" 
                  : "bg-white/10"
              )} 
            />
          ))}
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              Step {step} of 3
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step === 1 && "Create Your Account ✨"}
            {step === 2 && "Pick Your Vibe 🎨"}
            {step === 3 && "Verify Student Status 🎓"}
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            {step === 1 && "Join the exclusive campus-wide network"}
            {step === 2 && "Peers will only see your shared hobbies & alias at first"}
            {step === 3 && "Snap your student ID so we know you're real"}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-300">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Campus Student Email (.edu)"
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
            <div className="pt-2">
              <Button type="submit" fullWidth size="lg">
                Continue to Profile <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <p className="text-center text-xs font-semibold text-zinc-400 pt-2">
              Already verified?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-5">
            <Input
              id="name"
              label="Real Name (hidden until mutual reveal!)"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 ml-1">Gender</label>
              <select
                className="w-full bg-zinc-900/80 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-300">
                  Select Hobbies & Passions (Pick up to 5)
                </label>
                <span className="text-xs font-bold text-indigo-400">
                  {hobbies.length}/5
                </span>
              </div>
              
              {/* Colorful Pop Hobby Pills */}
              <div className="flex flex-wrap gap-2">
                {HOBBY_DATA.map(({ name: hobbyName, color, activeColor }) => {
                  const active = hobbies.includes(hobbyName);
                  return (
                    <button
                      key={hobbyName}
                      type="button"
                      onClick={() => toggleHobby(hobbyName)}
                      className={clsx(
                        "rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all duration-200 cursor-pointer active:scale-95 shadow-sm",
                        active 
                          ? `${activeColor} shadow-md` 
                          : `${color} hover:brightness-125`
                      )}
                    >
                      {hobbyName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg">
                Next: Upload ID <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-5">
            <div className="border-2 border-dashed border-indigo-500/30 rounded-3xl p-8 text-center bg-indigo-500/5 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all duration-200">
              <input
                type="file"
                id="id-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/25">
                  {idFile ? (
                    <Check className="h-7 w-7 text-white stroke-[2.5]" />
                  ) : (
                    <Camera className="h-7 w-7 text-white stroke-[2]" />
                  )}
                </div>
                <span className="text-sm font-bold text-white">
                  {idFile ? idFile.name : "Tap to Snap or Upload Student ID"}
                </span>
                <span className="text-xs font-semibold text-zinc-400 mt-1">
                  JPG, PNG • Reviewed privately by campus admins
                </span>
              </label>
            </div>
            
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Submit & Join Drop Queue 🚀
            </Button>
          </form>
        )}

      </div>
    </div>
  )
}
