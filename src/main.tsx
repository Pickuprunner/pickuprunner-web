import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App, { router } from './App'
import './index.css'

const queryClient = new QueryClient()

document.documentElement.classList.add('dark')

async function mount() {
  // Resolve the same route before hydration so the initial HTML is preserved.
  await router.load()
  const root = document.getElementById('root')!
  const application = (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
    </React.StrictMode>
  )
  if (root.dataset.prerendered === 'true') ReactDOM.hydrateRoot(root, application)
  else ReactDOM.createRoot(root).render(application)
}
void mount()
