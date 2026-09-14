import { children } from '../data/mockData'

export const getChildren = async () => children
export const createChild = async (child) => ({ ...child, id: crypto.randomUUID(), pin: String(Math.floor(100000 + Math.random() * 900000)) })
export const loginChild = async (pin) => children.find((child) => child.pin === pin) || children[0]
