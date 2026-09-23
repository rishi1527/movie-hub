import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import https from 'node:https'
import process from 'node:process'

/**
 * Custom Vite Plugin to proxy TMDB API requests directly to TMDB's CloudFront CDN,
 * injecting the server-side API key from environment variables and bypassing ISP DNS blocks.
 */
function tmdbDevProxyPlugin(env) {
  // Primary CloudFront CDN IPs for api.themoviedb.org
  const tmdbIps = ['65.9.130.53', '65.9.130.24', '65.9.130.126', '65.9.130.129']

  return {
    name: 'tmdb-dev-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', (req, res) => {
        // Handle preflight OPTIONS
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          })
          res.end()
          return
        }

        const apiKey =
          env.TMDB_API_KEY ||
          process.env.TMDB_API_KEY ||
          env.VITE_TMDB_API_KEY ||
          process.env.VITE_TMDB_API_KEY

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'TMDB_API_KEY is not configured in server environment.' }))
          return
        }

        // Parse path and incoming query parameters
        const parsedUrl = new URL(req.url, 'http://localhost')
        let endpoint = parsedUrl.pathname.replace(/^\/api\/tmdb/, '')
        if (!endpoint || endpoint === '/') {
          endpoint = ''
        } else if (!endpoint.startsWith('/')) {
          endpoint = `/${endpoint}`
        }
        const searchParams = parsedUrl.searchParams

        // Automatically inject server-side api_key and default language
        if (!searchParams.has('api_key')) {
          searchParams.set('api_key', apiKey)
        }
        if (!searchParams.has('language')) {
          searchParams.set('language', 'en-US')
        }

        const targetPath = `/3${endpoint}?${searchParams.toString()}`
        const targetIp = tmdbIps[Math.floor(Math.random() * tmdbIps.length)]

        const proxyReq = https.request(
          {
            host: targetIp,
            port: 443,
            path: targetPath,
            method: req.method || 'GET',
            headers: {
              Host: 'api.themoviedb.org',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MovieHub/1.0',
              Accept: 'application/json',
            },
            servername: 'api.themoviedb.org',
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, {
              'Content-Type': proxyRes.headers['content-type'] || 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            })
            proxyRes.pipe(res)
          }
        )

        proxyReq.on('error', (err) => {
          console.error('TMDB Dev Proxy Error:', err.message)
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'TMDB proxy connection error', details: err.message }))
          }
        })

        req.pipe(proxyReq)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      tmdbDevProxyPlugin(env),
    ],
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor'
              }
              if (id.includes('lucide-react')) {
                return 'icons-vendor'
              }
              if (id.includes('@supabase')) {
                return 'supabase-vendor'
              }
            }
          },
        },
      },
    },
  }
})
