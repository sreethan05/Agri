import axios from 'axios'

// ── Environment ───────────────────────────────────────────────────────
const isElectronProd = window.location.protocol === 'file:'

const BASE = isElectronProd
  ? 'http://127.0.0.1:8000'
  : (import.meta.env.VITE_API_URL || '/api')

// ── Storage keys ──────────────────────────────────────────────────────
const TOKEN_KEY   = 'agri_access_token'
const REFRESH_KEY = 'agri_refresh_token'
const USER_KEY    = 'agri_user'
const EXPIRY_KEY  = 'agri_token_expiry'

// ── Auth helpers ──────────────────────────────────────────────────────
export const saveAuth = (accessToken, refreshToken, user) => {
  localStorage.setItem(TOKEN_KEY,   accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken || '')
  localStorage.setItem(USER_KEY,    JSON.stringify(user))

  // Decode token to get real expiry time
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    localStorage.setItem(EXPIRY_KEY, String(payload.exp))
  } catch {
    // Default: 7 days from now
    localStorage.setItem(EXPIRY_KEY, String(Math.floor(Date.now()/1000) + 604800))
  }
}

export const getToken        = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)
export const getUser         = () => {
  const u = localStorage.getItem(USER_KEY)
  if (!u) return null
  try {
    return JSON.parse(u)
  } catch {
    // A stale or manually edited value should not prevent the app from loading.
    localStorage.removeItem(USER_KEY)
    return null
  }
}
export const isLoggedIn = () => !!getToken()

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

// Check if token is expired or will expire in next 5 minutes
export const isTokenExpired = () => {
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (!expiry) return false
  const expiryTime  = parseInt(expiry)
  const currentTime = Math.floor(Date.now() / 1000)
  const fiveMinutes = 300
  return currentTime >= (expiryTime - fiveMinutes)
}

// ── Axios instance ────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
})

// ── Refresh token function ────────────────────────────────────────────
let isRefreshing     = false
let refreshQueue     = []   // queue of requests waiting for refresh

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

const doRefresh = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const directBase = isElectronProd ? 'http://127.0.0.1:8000' : '/api'
  const { data }   = await axios.post(`${directBase}/refresh`, {
    refresh_token: refreshToken
  })

  localStorage.setItem(TOKEN_KEY,   data.access_token)
  localStorage.setItem(REFRESH_KEY, data.refresh_token || refreshToken)

  // Update expiry
  try {
    const payload = JSON.parse(atob(data.access_token.split('.')[1]))
    localStorage.setItem(EXPIRY_KEY, String(payload.exp))
  } catch { /* ignore */ }

  return data.access_token
}

// ── Request interceptor — attach token + proactive refresh ───────────
api.interceptors.request.use(async config => {
  // Skip auth for login/register/refresh endpoints
  const skipAuth = ['/login', '/register', '/refresh', '/health', '/ping']
  if (skipAuth.some(path => config.url?.includes(path))) {
    return config
  }

  let token = getToken()

  // Proactively refresh if token expires within 5 minutes
  if (token && isTokenExpired() && getRefreshToken()) {
    try {
      token = await doRefresh()
    } catch (e) {
      console.warn('Proactive refresh failed:', e.message)
      // Continue with old token — reactive refresh will handle it
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ── Response interceptor — reactive refresh on 401 ───────────────────
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    // Only handle 401 that isn't from auth endpoints
    const skipAuth = ['/login', '/register', '/refresh']
    if (
      err.response?.status === 401
      && !original._retry
      && !skipAuth.some(p => original.url?.includes(p))
      && getRefreshToken()
    ) {
      original._retry = true

      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      isRefreshing = true

      try {
        const newToken = await doRefresh()
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)
        console.error('Refresh failed — logging out')
        logout()
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

// ═══════════════════════════════════════════════════════════════════════
// ALL EXISTING API FUNCTIONS — UNCHANGED
// ═══════════════════════════════════════════════════════════════════════

export const predictDisease = async (imageFile) => {
  const form = new FormData()
  form.append('file', imageFile)
  const { data } = await api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const speakText = (text, lang = 'te') =>
  `${BASE}/speak?text=${encodeURIComponent(text)}&lang=${lang}`

export const checkHealth = async () => {
  const healthUrl = isElectronProd
    ? 'http://127.0.0.1:8000/health'
    : '/api/health'
  const { data } = await axios.get(healthUrl, { timeout: 15000 })
  return data
}

export const getLiveWeather = async (lat, lon) => {
  const { data } = await api.get(`/weather?lat=${lat}&lon=${lon}`)
  return data
}

export const getMarketPrices = async (commodity = '', state = '') => {
  const url = `/market-prices?limit=100`
    + (commodity ? `&commodity=${encodeURIComponent(commodity)}` : '')
    + (state     ? `&state=${encodeURIComponent(state)}`         : '')
  const { data } = await api.get(url)
  return data
}

export const registerUser  = async (data) =>
  (await api.post('/register', data)).data

export const loginUser = async (data) =>
  (await api.post('/login', data)).data

export const getMe         = async () => (await api.get('/me')).data
export const updateProfile = async (data) => (await api.put('/me', data)).data
export const getHistory    = async (limit = 20) =>
  (await api.get(`/history?limit=${limit}`)).data
export const deleteHistory = async (id) =>
  (await api.delete(`/history/${id}`)).data
