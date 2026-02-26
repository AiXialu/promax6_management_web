import { getEffectiveConfig, getPrivateConfig } from './config'

function toBase64Utf8(str: string) {
  // btoa expects binary string
  return btoa(unescape(encodeURIComponent(str)))
}

function fromBase64Utf8(b64: string) {
  return decodeURIComponent(escape(atob(b64)))
}

export type GithubFileReadResult<T> = { ok: true; data: T } | { ok: false; error: string }

function rawUrl(owner: string, repo: string, branch: string, path: string) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.replace(/^\//, '')}`
}

async function readJsonRaw<T>(owner: string, repo: string, branch: string, path: string): Promise<GithubFileReadResult<T>> {
  const url = rawUrl(owner, repo, branch, path)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    return { ok: false, error: `read_failed_${res.status}` }
  }
  try {
    const json = (await res.json()) as T
    return { ok: true, data: json }
  } catch {
    return { ok: false, error: 'invalid_json' }
  }
}

async function getContents(owner: string, repo: string, path: string, branch: string, token?: string) {
  const cleanPath = path.replace(/^\//, '')
  // NOTE: do NOT encode slashes in the path segment for GitHub Contents API
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url, { headers })
  return res
}

async function putContents(params: {
  owner: string
  repo: string
  path: string
  branch: string
  token: string
  message: string
  contentUtf8: string
  sha?: string
}) {
  const cleanPath = params.path.replace(/^\//, '')
  const url = `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${cleanPath}`

  const body: Record<string, unknown> = {
    message: params.message,
    content: toBase64Utf8(params.contentUtf8),
    branch: params.branch,
  }
  if (params.sha) body.sha = params.sha

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${params.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return res
}

async function readJsonViaApi<T>(owner: string, repo: string, branch: string, path: string, token: string): Promise<T | null> {
  const res = await getContents(owner, repo, path, branch, token)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`github_read_${res.status}`)
  const json = (await res.json()) as { content?: string; encoding?: string }
  if (!json.content || json.encoding !== 'base64') throw new Error('github_read_invalid_content')
  const text = fromBase64Utf8(json.content.replace(/\n/g, ''))
  return JSON.parse(text) as T
}

async function writeJsonViaApi<T>(
  owner: string,
  repo: string,
  branch: string,
  path: string,
  token: string,
  value: T,
  message: string,
) {
  const existing = await getContents(owner, repo, path, branch, token)
  let sha: string | undefined
  if (existing.ok) {
    const meta = (await existing.json()) as { sha?: string }
    sha = meta.sha
  } else if (existing.status !== 404) {
    throw new Error(`github_meta_${existing.status}`)
  }

  const contentUtf8 = JSON.stringify(value, null, 2)
  const res = await putContents({ owner, repo, path, branch, token, message, contentUtf8, sha })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`github_write_${res.status}:${body}`)
  }
}

export async function readPayments<T>(): Promise<GithubFileReadResult<T>> {
  const cfg = getEffectiveConfig()
  if (!cfg) return { ok: false, error: 'missing_config' }

  const { token } = getPrivateConfig()
  if (token) {
    try {
      const data = await readJsonViaApi<T>(cfg.owner, cfg.repo, cfg.branch, cfg.paymentsPath, token)
      return { ok: true, data: (data ?? ([] as unknown as T)) }
    } catch (e) {
      console.error(e)
      // fall back to raw read (might still work if public)
    }
  }

  const raw = await readJsonRaw<T>(cfg.owner, cfg.repo, cfg.branch, cfg.paymentsPath)
  if (!raw.ok && raw.error === 'read_failed_404') {
    return { ok: true, data: [] as unknown as T }
  }
  return raw
}

export async function writePayments<T>(value: T, message: string) {
  const cfg = getEffectiveConfig()
  if (!cfg) throw new Error('missing_config')
  const { token } = getPrivateConfig()
  if (!token) throw new Error('missing_token')

  await writeJsonViaApi(cfg.owner, cfg.repo, cfg.branch, cfg.paymentsPath, token, value, message)
}

export async function readClockins<T>(): Promise<GithubFileReadResult<T>> {
  const cfg = getEffectiveConfig()
  if (!cfg) return { ok: false, error: 'missing_config' }

  const { token } = getPrivateConfig()
  if (token) {
    try {
      const data = await readJsonViaApi<T>(cfg.owner, cfg.repo, cfg.branch, cfg.clockinsPath, token)
      return { ok: true, data: (data ?? ([] as unknown as T)) }
    } catch (e) {
      console.error(e)
    }
  }

  const raw = await readJsonRaw<T>(cfg.owner, cfg.repo, cfg.branch, cfg.clockinsPath)
  if (!raw.ok && raw.error === 'read_failed_404') {
    return { ok: true, data: [] as unknown as T }
  }
  return raw
}

export async function writeClockins<T>(value: T, message: string) {
  const cfg = getEffectiveConfig()
  if (!cfg) throw new Error('missing_config')
  const { token } = getPrivateConfig()
  if (!token) throw new Error('missing_token')

  await writeJsonViaApi(cfg.owner, cfg.repo, cfg.branch, cfg.clockinsPath, token, value, message)
}

