import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, TrendingUp, Building2, Users, FileText, Award, MessageSquare, Settings as SettingsIcon } from 'lucide-react'
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import Branches from './pages/Branches'
import Customers from './pages/Customers'
import Loans from './pages/Loans'
import CreditScoring from './pages/CreditScoring'
import Reports from './pages/Reports'
import Messaging from './components/Messaging'
import Settings from './components/Settings'
import { kechitaColors, kechitaLogo, kechitaTagline } from './kechitaBrand'

function AppContent() {
  const location = useLocation()
  const API_URL = ''
  
  const tabs = [
    { path: '/', label: 'Overview', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/branches', label: 'Branches', icon: Building2 },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/loans', label: 'Loans', icon: FileText },
    { path: '/credit-scoring', label: 'Credit Scoring', icon: Award },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/messaging', label: 'Messaging', icon: MessageSquare },
    { path: '/settings', label: 'Settings', icon: SettingsIcon }
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: kechitaColors.background }}>
      <header style={{ 
        background: `linear-gradient(135deg, ${kechitaColors.primary} 0%, ${kechitaColors.darkBlue} 50%, ${kechitaColors.secondary} 100%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={kechitaLogo} alt="Kechita Capital" style={{ height: '60px', borderRadius: '8px', backgroundColor: 'white', padding: '8px' }} />
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  Kechita Intelligence Platform
                </h1>
                <p style={{ color: kechitaColors.lightGreen, margin: 0, fontStyle: 'italic', fontSize: '14px' }}>{kechitaTagline}</p>
              </div>
            </Link>
          </div>

          <nav style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: isActive(tab.path) ? 'white' : 'rgba(255,255,255,0.15)',
                    color: isActive(tab.path) ? kechitaColors.primary : 'white',
                    boxShadow: isActive(tab.path) ? '0 4px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Overview API_URL={API_URL} />} />
          <Route path="/analytics" element={<Analytics API_URL={API_URL} />} />
          <Route path="/branches" element={<Branches API_URL={API_URL} />} />
          <Route path="/customers" element={<Customers API_URL={API_URL} />} />
          <Route path="/loans" element={<Loans API_URL={API_URL} />} />
          <Route path="/credit-scoring" element={<CreditScoring API_URL={API_URL} />} />
          <Route path="/reports" element={<Reports API_URL={API_URL} />} />
          <Route path="/messaging" element={<Messaging API_URL={API_URL} />} />
          <Route path="/settings" element={<Settings API_URL={API_URL} />} />
        </Routes>
      </main>

      <footer style={{ 
        background: `linear-gradient(135deg, ${kechitaColors.darkBlue} 0%, ${kechitaColors.primary} 100%)`,
        color: 'white',
        padding: '32px 24px',
        marginTop: '48px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>© 2025 Kechita Capital Investment Limited</p>
          <p style={{ margin: 0, opacity: 0.9, fontStyle: 'italic' }}>{kechitaTagline}</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
