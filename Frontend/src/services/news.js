import { apiClient } from '../services/apiClient.js'

export async function listNews({ category, page, pageSize } = {}) {
  const res = await apiClient.get('/news', {
    params: { category, page, page_size: pageSize },
  })
  return res.data
}

export async function getNewsItem(id) {
  const res = await apiClient.get(`/news/${id}`)
  return res.data
}
