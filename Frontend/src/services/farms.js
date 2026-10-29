import { apiClient } from '../services/apiClient.js'

export async function listFarms() {
  const res = await apiClient.get('/farms')
  return res.data
}

export async function createFarm(payload) {
  const res = await apiClient.post('/farms', payload)
  return res.data
}

export async function getFarm(id) {
  const res = await apiClient.get(`/farms/${id}`)
  return res.data
}

export async function updateFarm(id, payload) {
  const res = await apiClient.put(`/farms/${id}`, payload)
  return res.data
}

export async function deleteFarm(id) {
  await apiClient.delete(`/farms/${id}`)
  return id
}
