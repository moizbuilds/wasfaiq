import { startRun } from './_apify.js'

// TikTok actor: clockworks/tiktok-scraper
// Instagram actor: apify/instagram-reel-scraper
const ACTORS = {
  tiktok:    'clockworks/tiktok-scraper',
  instagram: 'apify/instagram-reel-scraper',
}

const INPUTS = {
  tiktok: (url) => ({
    postURLs: [url],
    resultsPerPage: 1,
    shouldDownloadVideos: false,
    shouldDownloadAvatars: false,
  }),
  instagram: (url) => ({
    directUrls: [url],
    resultsType: 'posts',
    resultsLimit: 1,
  }),
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url, type } = req.body
  if (!url || !type) return res.status(400).json({ error: 'url and type are required' })
  if (!ACTORS[type]) return res.status(400).json({ error: `Unsupported type: ${type}` })

  const token = process.env.APIFY_TOKEN
  if (!token) return res.status(500).json({ error: 'APIFY_TOKEN not configured' })

  try {
    const { runId, datasetId } = await startRun(ACTORS[type], INPUTS[type](url), token)
    return res.status(200).json({ jobId: runId, datasetId })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
