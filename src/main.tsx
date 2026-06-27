import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AIProviderProvider } from './context/AIProviderContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AIProviderProvider>
      <App />
    </AIProviderProvider>
  </StrictMode>,
)
