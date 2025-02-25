import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import WarppedApp from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
<WarppedApp />
  </StrictMode>,
)
