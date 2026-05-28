import axios from 'axios'

const apiUrl = import.meta.env.VITE_API

const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

if (apiUrl) {
  axios.defaults.baseURL = apiUrl
  axios.defaults.withCredentials = true
}

export default apiClient
