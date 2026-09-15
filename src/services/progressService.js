import { apiFetch } from './api'

export const getProgress = async () => null

export const getChildProgress = async (childId) => {
	const response = await apiFetch(`/api/progress/child/${encodeURIComponent(childId)}`)
	const data = await response.json()
	if (!response.ok) throw new Error(data.message || 'Unable to load progress')
	return data
}

export const postGameResult = async ({ childId, gameId, score, totalQuestions, pointsEarned }) => {
	const response = await apiFetch('/api/progress/game', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ childId, gameId, score, totalQuestions, pointsEarned }),
	})
	const data = await response.json()
	if (!response.ok) throw new Error(data.message || 'Unable to save quiz result')
	return data
}

export const postQuizResult = postGameResult
