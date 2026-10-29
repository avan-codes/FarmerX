import { apiClient } from '../services/apiClient.js'

export async function getConversation(id) {
  const res = await apiClient.get(`/recommendations/${id}/assistant`)
  return res.data
}

export async function sendMessage(id, { message, conversationId } = {}) {
  const res = await apiClient.post(`/recommendations/${id}/assistant`, {
    message,
    conversation_id: conversationId || null,
  })
  return res.data
}
