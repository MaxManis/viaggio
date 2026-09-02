import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'

function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabaseEnabled)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, ready }
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !email) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">Viaggio</h1>
        <p className="auth__sub">Sign in to open your shared trip</p>
        {sent ? (
          <p className="auth__msg">
            Check <strong>{email}</strong> for a magic link, then open it on this device.
          </p>
        ) : (
          <form onSubmit={send}>
            <input
              className="auth__input"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="auth__btn" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send magic link'}
            </button>
            {error && <p className="auth__error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { session, ready } = useSession()

  // No Supabase configured → pure local mode, no login needed.
  if (!supabaseEnabled) return <>{children}</>

  if (!ready) {
    return (
      <div className="auth">
        <div className="auth__card">
          <p className="auth__msg">Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) return <LoginScreen />
  return <>{children}</>
}
