import { activities, games, topics } from '../data/mockData'
export const getActivities = async () => activities
export const getTopics = async () => topics
export const getGames = async () => games
export const completeActivity = async (activityId) => ({ activityId, completedAt: new Date().toISOString() })
