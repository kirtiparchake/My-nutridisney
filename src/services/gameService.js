import { games } from '../data/mockData'

export const getGames = async () => games
export const getGame = async (id) => games.find((game) => game.id === id)
export const submitGameScore = async (gameId, score) => ({ gameId, score, submittedAt: new Date().toISOString() })
