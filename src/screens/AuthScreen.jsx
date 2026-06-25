import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen({ onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    onSuccess?.()
  }

  const inputStyle = (focused) => ({
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 10,
    border: `2px solid ${focused ? '#c8860a' : '#e8dcc8'}`,
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    width: '100%',
  })

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fffbf5', minHeight: '100vh' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </h2>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 36,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1px solid #f0e8d8',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            required
            style={inputStyle(emailFocused)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
            style={inputStyle(passwordFocused)}
          />
          {error && <p style={{ color: '#c0392b', fontSize: 14, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 16px',
              background: '#c8860a',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
      <p style={{ marginTop: 20, fontSize: 14, color: '#666', textAlign: 'center' }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{ background: 'none', border: 'none', color: '#c8860a', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
