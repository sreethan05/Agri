// src/utils/auth.js — synced with api.js

const TOKEN_KEY   = 'agri_access_token'   // ← updated to match api.js
const REFRESH_KEY = 'agri_refresh_token'  // ← new
const USER_KEY    = 'agri_user'           // ← same as before

// Save all three after login/register
export const saveAuth = (accessToken, refreshToken, user) => {
  localStorage.setItem(TOKEN_KEY,   accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken || '')
  localStorage.setItem(USER_KEY,    JSON.stringify(user))
}

export const getToken        = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)
export const getUser         = () => {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export const isLoggedIn = () => !!getToken()

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}