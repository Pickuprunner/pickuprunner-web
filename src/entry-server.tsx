import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from './App'
export { PUBLIC_PATHS, SITE_URL, renderSeoHead, SERVICE_DESCRIPTION } from './lib/seo'
export { crawlerFiles } from './lib/crawlerFiles'

export async function render(path: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  await router.load()
  const queryClient = new QueryClient()
  try {
    return renderToString(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>)
  } finally {
    queryClient.clear()
  }
}
