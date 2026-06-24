import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './screens/AuthScreen'
import HomeScreen from './screens/HomeScreen'
import CollectionScreen from './screens/CollectionScreen'
import ResultScreen from './screens/ResultScreen'
import NavBar from './components/NavBar'

// Simple client-side router — no external library needed for 4 screens
function Router() {
  const { loading } = useAuth()
  const [page, setPage] = useState('home')  // 'home' | 'result' | 'collection' | 'auth'
  const [resultData, setResultData] = useState(null)

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>

  function navigate(to, data) {
    setPage(to)
    if (data) setResultData(data)
  }

  return (
    <>
      <NavBar onNavigate={navigate} currentPage={page} />
      {page === 'home'       && <HomeScreen onResult={(data) => navigate('result', data)} />}
      {page === 'result'     && <ResultScreen data={resultData} onNavigate={navigate} />}
      {page === 'collection' && <CollectionScreen onSelect={(data) => navigate('result', data)} />}
      {page === 'auth'       && <AuthScreen onSuccess={() => navigate('home')} />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
