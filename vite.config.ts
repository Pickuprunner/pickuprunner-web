import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), crawlerFilesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
});

/** Vite dev serves source files, not dist. Expose generated crawler resources too. */
function crawlerFilesPlugin(): Plugin {
  return {
    name: 'pickup-runner-crawler-files',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0]
        if (!pathname || !['/sitemap.xml', '/robots.txt', '/llms.txt'].includes(pathname)) return next()
        if (request.method !== 'GET' && request.method !== 'HEAD') return next()
        try {
          // Vite invalidates this module when source metadata changes. No previous
          // build is required and the response cannot become stale behind dist/.
          const { crawlerFiles } = await server.ssrLoadModule('/src/lib/crawlerFiles.ts')
          const file = crawlerFiles()[pathname]
          response.statusCode = 200
          response.setHeader('Content-Type', file.contentType)
          response.setHeader('Cache-Control', 'no-store')
          response.end(request.method === 'HEAD' ? undefined : file.body)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}
