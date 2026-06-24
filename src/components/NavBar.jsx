import { useAuth } from '../context/AuthContext'

export default function NavBar({ onNavigate, currentPage }) {
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    onNavigate('home')
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', borderBottom: '1px solid #e8dcc8',
      background: '#fffbf5', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <button
        onClick={() => onNavigate('home')}
        style={{ background: 'none', border: 'none', fontSize: 18, fontWeight: 700, color: '#c8860a', cursor: 'pointer' }}
      >
        WasfaIQ 🍳
      </button>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <button
              onClick={() => onNavigate('collection')}
              style={{
                background: currentPage === 'collection' ? '#c8860a' : 'none',
                color: currentPage === 'collection' ? '#fff' : '#666',
                border: '1px solid #ddd', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              }}
            >
              My Recipes
            </button>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 14 }}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('auth')}
            style={{ background: '#c8860a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}
