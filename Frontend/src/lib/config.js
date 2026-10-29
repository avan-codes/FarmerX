/**
 * Centralised frontend config. Values that come from the environment are
 * read once here so the rest of the app never touches `import.meta.env`
 * directly. Only VITE_-prefixed variables are exposed to the browser.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  appName: 'FarmerX',
}
