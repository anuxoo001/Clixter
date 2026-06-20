import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL ?? ''

const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

axios.defaults.baseURL = apiUrl
axios.defaults.withCredentials = true

export default apiClient
