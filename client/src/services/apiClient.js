import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL ?? ''

function normalizeApiUrl(rawUrl) {
  let apiUrl = String(rawUrl).trim()

  if (!apiUrl) {
    return ''
  }

  // Remove accidental full assignment values like "VITE_API_URL=https://..."
  apiUrl = apiUrl.replace(/^VITE_API_URL=/i, '').trim()

  // If the env already contains the full assignment prefix due to build/proc injection,
  // strip any leftover "VITE_API_URL=" occurrences.
  apiUrl = apiUrl.replace(/VITE_API_URL=/gi, '').trim()

  // Normalize malformed protocol slashes: https:/ -> https://
  apiUrl = apiUrl.replace(/^(https?:)\/+([^/])/, '$1//$2')


  // Remove any trailing slash so users can append endpoints consistently.
  apiUrl = apiUrl.replace(/\/+$/, '')

  return apiUrl
}

const API = normalizeApiUrl(rawApiUrl)
const apiUrl = API || undefined;

const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

if (apiUrl) {
  axios.defaults.baseURL = apiUrl
  axios.defaults.withCredentials = true
}

export { API };
export default apiClient;

