// Low-level Apify REST helpers. Used by scrape.js and scrape-status.js.
// The underscore prefix means Vercel does NOT expose this as an API endpoint.

const API = 'https://api.apify.com/v2'

function actorPath(actorId) {
  return actorId.replace('/', '~')
}

export async function startRun(actorId, input, token) {
  const res = await fetch(
    `${API}/acts/${actorPath(actorId)}/runs?token=${token}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Apify start failed: ${res.status} — ${body.slice(0, 300)}`)
  }
  const json = await res.json()
  return { runId: json.data.id, datasetId: json.data.defaultDatasetId }
}

export async function getRunStatus(runId, token) {
  const res = await fetch(`${API}/actor-runs/${runId}?token=${token}`)
  if (!res.ok) throw new Error(`Apify status check failed: ${res.status}`)
  const json = await res.json()
  return json.data.status
}

export async function getDatasetItems(datasetId, token) {
  const res = await fetch(`${API}/datasets/${datasetId}/items?token=${token}`)
  if (!res.ok) throw new Error(`Apify dataset read failed: ${res.status}`)
  return res.json()
}
