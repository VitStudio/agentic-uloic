'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the login link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-[#313338] rounded-lg shadow-xl text-[#dbdee1]">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back!</h1>
        <p className="text-sm">We're so excited to see you again!</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-2 text-[#b5bac1]">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-[#1e1f22] text-[#dbdee1] rounded border-none outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-2 text-[#b5bac1]">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 bg-[#1e1f22] text-[#dbdee1] rounded border-none outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={(e) => handleAuth('login', e)}
            disabled={loading}
            className="w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Log In
          </button>

          <button
            onClick={(e) => handleAuth('signup', e)}
            disabled={loading}
            className="w-full py-2.5 bg-transparent border border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            Register
          </button>
        </div>
      </form>
    </div>
  )
}
