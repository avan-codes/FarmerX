import { apiClient } from '../services/apiClient.js'

export async function getProfile() {
  const res = await apiClient.get('/profile')
  return res.data
}

export async function updateProfile(payload) {
  const res = await apiClient.put('/profile', payload)
  return res.data
}
