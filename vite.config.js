import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function readEnv(dir, key) {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(dir, f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`).exec(line)
      if (m) return m[1].trim().replace(/^["']|["']$/g, '')
    }
  }
  return process.env[key] || ''
}

function devApi() {
  const routes = {
    '/api/scrape':        { module: '/api/scrape.js',        method: 'POST' },
    '/api/scrape-status': { module: '/api/scrape-status.js', method: 'GET'  },
    '/api/adapt':         { module: '/api/adapt.js',         method: 'POST' },
    '/api/save':          { module: '/api/save.js',          method: 'POST' },
  }
  return {
    name: 'dev-api',
    configureServer(server) {
      for (const [routePath, route] of Object.entries(routes)) {
        server.middlewares.use(routePath, (req, res) => {
          let raw = ''
          req.on('data', (c) => (raw += c))
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            try {
              const env = {
                APIFY_TOKEN:       readEnv(server.config.root, 'APIFY_TOKEN'),
                JAIS_API_KEY:      readEnv(server.config.root, 'JAIS_API_KEY'),
                ANTHROPIC_API_KEY: readEnv(server.config.root, 'ANTHROPIC_API_KEY'),
                SUPABASE_URL:      readEnv(server.config.root, 'SUPABASE_URL'),
                SUPABASE_SERVICE_KEY: readEnv(server.config.root, 'SUPABASE_SERVICE_KEY'),
              }
              const url = new URL(req.url, 'http://localhost')
              const mod = await server.ssrLoadModule(route.module)
              const mockReq = {
                method: req.method,
                query: Object.fromEntries(url.searchParams),
                body: raw ? JSON.parse(raw) : {},
                headers: req.headers,
                env,
              }
              const mockRes = {
                status: (code) => { res.statusCode = code; return mockRes },
                json: (data) => res.end(JSON.stringify(data)),
                end: (data) => res.end(data),
              }
              await mod.default(mockReq, mockRes)
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err?.message || 'Dev API error' }))
            }
          })
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  server: { port: 5190 },
})
