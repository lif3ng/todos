import type { Issue, Label } from './types'

const BASE = 'https://api.github.com/repos/lif3ng/todos'
const HEADERS = { Accept: 'application/vnd.github.v3+json' }

export async function fetchIssues(params: {
  state?: 'open' | 'closed' | 'all'
  label?: string
  page?: number
  per_page?: number
  q?: string
} = {}): Promise<{ issues: Issue[]; total: number }> {
  const { state = 'all', label, page = 1, per_page = 30, q } = params

  if (q) {
    // Use search API
    const query = `${q} repo:lif3ng/todos is:issue${state !== 'all' ? ` is:${state}` : ''}${
      label ? ` label:"${label}"` : ''
    }`
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`
    const res = await fetch(url, { headers: HEADERS })
    const data = await res.json()
    return { issues: data.items ?? [], total: data.total_count ?? 0 }
  }

  const qs = new URLSearchParams({
    state,
    page: String(page),
    per_page: String(per_page),
    ...(label ? { labels: label } : {}),
  })
  const res = await fetch(`${BASE}/issues?${qs}`, { headers: HEADERS })
  // GitHub returns total via Link header; use 999 as fallback for open/all
  const issues: Issue[] = await res.json()
  // Parse total from Link header if available
  const link = res.headers.get('Link') ?? ''
  const lastMatch = link.match(/page=(\d+)&per_page=[^>]*>;\s*rel="last"/)
  const lastPage = lastMatch ? parseInt(lastMatch[1]) : page
  return { issues, total: lastPage * per_page }
}

export async function fetchIssue(number: number): Promise<Issue> {
  const res = await fetch(`${BASE}/issues/${number}`, { headers: HEADERS })
  return res.json()
}

export async function fetchLabels(): Promise<Label[]> {
  const res = await fetch(`${BASE}/labels?per_page=100`, { headers: HEADERS })
  return res.json()
}
