import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './lib/supabase'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App supabase={supabase} />
    </ErrorBoundary>
  </StrictMode>,
)
