import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ensureFarmerId } from './services/apiClient.js'
import './index.css'

// Ensure a device-level farmer ID exists before any API call so the
// X-Farmer-Id header is sent on authenticated endpoints.
ensureFarmerId().catch(() => {
  // If the backend is unreachable, requests will surface a network error UI.
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
