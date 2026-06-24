// Figures out what kind of link the user pasted.
// Returns one of: 'tiktok', 'instagram', 'url', 'unknown'
export function detectInputType(str) {
  const s = str.trim()
  if (!s) return 'unknown'
  if (/tiktok\.com\/@?.+\/video\/\d+/i.test(s) || /vm\.tiktok\.com\//i.test(s)) return 'tiktok'
  if (/instagram\.com\/reel\//i.test(s) || /instagram\.com\/p\//i.test(s)) return 'instagram'
  try {
    const url = new URL(s)
    if (url.protocol === 'http:' || url.protocol === 'https:') return 'url'
  } catch {}
  return 'unknown'
}
