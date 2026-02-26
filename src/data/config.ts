export interface DataSourceConfig {
  owner: string
  repo: string
  branch: string
  paymentsPath: string
  clockinsPath: string
}

export interface DataSourcePrivateConfig {
  token?: string
}

const PUBLIC_KEY = 'promax_data_source_public'
const PRIVATE_KEY = 'promax_data_source_private'

export function getPublicConfig(): DataSourceConfig | null {
  const raw = localStorage.getItem(PUBLIC_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DataSourceConfig
  } catch {
    return null
  }
}

export function setPublicConfig(cfg: DataSourceConfig) {
  localStorage.setItem(PUBLIC_KEY, JSON.stringify(cfg))
}

export function getPrivateConfig(): DataSourcePrivateConfig {
  const raw = localStorage.getItem(PRIVATE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as DataSourcePrivateConfig
  } catch {
    return {}
  }
}

export function setPrivateConfig(cfg: DataSourcePrivateConfig) {
  localStorage.setItem(PRIVATE_KEY, JSON.stringify(cfg))
}

export function clearPrivateConfig() {
  localStorage.removeItem(PRIVATE_KEY)
}

export function getEffectiveConfig(): DataSourceConfig | null {
  const ls = getPublicConfig()
  if (ls) return ls

  const owner = import.meta.env.VITE_DATA_REPO_OWNER
  const repo = import.meta.env.VITE_DATA_REPO_NAME
  // Default (hardcoded) data repo for lowest-cost setup.
  // Can be overridden by /data-source or VITE_* env vars.
  if (!owner || !repo) {
    return {
      owner: 'AiXialu',
      repo: 'public_data',
      branch: 'main',
      paymentsPath: 'data/payments.json',
      clockinsPath: 'data/clockins.json',
    }
  }

  return {
    owner,
    repo,
    branch: import.meta.env.VITE_DATA_REPO_BRANCH || 'main',
    paymentsPath: import.meta.env.VITE_DATA_PAYMENTS_PATH || 'data/payments.json',
    clockinsPath: import.meta.env.VITE_DATA_CLOCKINS_PATH || 'data/clockins.json',
  }
}

