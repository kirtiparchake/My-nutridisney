const productionApiUrl = 'https://my-nutridisney.onrender.com'
const API_BASE_URL = (import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL || productionApiUrl : '').replace(/\/$/, '')

export const apiFetch = (path, options) => {
	return fetch(`${API_BASE_URL}${path}`, options)
}