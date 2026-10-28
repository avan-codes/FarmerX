import axios from 'axios'
import { config } from '../lib/config.js'

/**
 * Shared Axios instance for the FarmerX backend.
 *
 * In Phase 1 no requests are issued — this file exists so Phase 2+ features
 * (soil reports, recommendations, market prices, news, assistant) can plug
 * into a consistent HTTP boundary. Errors are normalised so UI code can rely
 * on `{ message, status }` regardless of where the failure came from.
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl || undefined,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalised = {
      message: 'Something went wrong. Please try again.',
      status: error.response?.status ?? null,
      original: error,
    }

    if (!error.response) {
      normalised.message =
        'Could not reach the server. Please check your connection and try again.'
    } else if (error.response.status === 401) {
      normalised.message = 'You are not signed in. Please sign in and try again.'
    } else if (error.response.status === 403) {
      normalised.message = 'You do not have access to this action.'
    } else if (error.response.status === 404) {
      normalised.message = 'The requested resource was not found.'
    } else if (error.response.status >= 500) {
      normalised.message = 'The server reported an error. Please try again later.'
    }

    return Promise.reject(normalised)
  }
)