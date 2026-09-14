import { games } from '../data/mockData'

export const getGames = async () => games
export const getGame = async (id) => games.find((game) => game.id === id)
export const submitGameScore = async () => {
	throw new Error('Game progress API is not available yet')
}
