'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Enter your email and password.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Invalid credentials. Contact your administrator.'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080E18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: 20,
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: '#E8541A', zIndex: 10 }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#111C30',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,.6)',
      }}>
        {/* Header */}
        <div style={{ background: '#0A1220', padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#E8541A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 16px',
          }}>OSS</div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Opponent <span style={{ color: '#E8541A' }}>Scouting System</span>
          </div>
          <div style={{ color: '#4A5A6A', fontSize: 13 }}>Brand Velocity Co. Baseball Intelligence</div>
        </div>

        {/* Form */}
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: '#6A7A8A', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="coach@yourschool.edu"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,.08)', background: '#080E18',
                color: '#fff', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#6A7A8A', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,.08)', background: '#080E18',
                color: '#fff', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(232,84,26,.12)', border: '1px solid rgba(232,84,26,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#E8541A', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: loading ? '#9A3010' : '#E8541A', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#2A3A4A', lineHeight: 1.7 }}>
            Access is by invitation only.<br />Contact your administrator to get access.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: '#1A2A3A', textAlign: 'center' }}>
        Built by Brand Velocity Co. · brandvelocityco.com
      </div>
    </div>
  )
}
