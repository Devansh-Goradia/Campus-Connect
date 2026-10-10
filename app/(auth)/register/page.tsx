'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { clsx } from 'clsx'

const HOBBY_OPTIONS = [
  'AI & Data Science', 'Gym & Fitness', 'Drums & Music', 'Event Management', 
  'Trading & Finance', 'Gaming', 'Photography', 'Art & Design', 'Anime', 'Startups'
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
    
    // We actually create the user right away so we have a session for steps 2/3
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
      setError('Please provide your name and at least one hobby.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session lost. Please log in again.')
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
      setError('Please upload a photo of your Campus ID.')
      return
    }
    
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session lost.')
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

    const { data: urlData } = supabase.storage
      .from('campus-ids')
      .getPublicUrl(filePath)
    
    // Actually, campus-ids is private. Let's just save the file path so admins can generate signed URLs, 
    // or we can save the internal URL. For simplicity, save the path.
    
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
      if (hobbies.length >= 5) return // max 5
      setHobbies([...hobbies, hobby])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-card border border-surface-border p-8 rounded-2xl shadow-xl">
        
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={clsx(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                s <= step ? "bg-neon-cyan" : "bg-surface-muted"
              )} 
            />
          ))}
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {step === 1 && "Create Account"}
            {step === 2 && "Your Profile"}
            {step === 3 && "Verify Status"}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {step === 1 && "Join the exclusive campus network"}
            {step === 2 && "How should people find you?"}
            {step === 3 && "We need to verify you're actually a student"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Student Email"
              placeholder="you@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading}>
              Continue
            </Button>
            <p className="text-center text-sm text-white/50 pt-2">
              Already verified?{' '}
              <Link href="/login" className="text-neon-cyan hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6">
            <Input
              id="name"
              label="Real Name (hidden initially)"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Gender</label>
              <select
                className="w-full bg-surface-card border border-surface-border text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-neon-cyan"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Hobbies (select up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map(hobby => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => toggleHobby(hobby)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                      hobbies.includes(hobby)
                        ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                        : "bg-surface border-surface-border text-white/70 hover:border-white/30"
                    )}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Next Step
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-6">
            <div className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center bg-surface hover:border-neon-cyan/50 transition-colors">
              <input
                type="file"
                id="id-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-3 text-2xl">
                  📸
                </div>
                <span className="text-sm font-medium text-white">
                  {idFile ? idFile.name : "Tap to upload Campus ID"}
                </span>
                <span className="text-xs text-white/50 mt-1">JPEG, PNG up to 5MB</span>
              </label>
            </div>
            
            <Button type="submit" fullWidth variant="neon" loading={loading}>
              Submit for Verification
            </Button>
          </form>
        )}

      </div>
    </div>
  )
}
