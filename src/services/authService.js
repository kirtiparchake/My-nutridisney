const mockUser = { name: 'Jordan Morgan', email: 'jordan@example.com' }

export const login = async (credentials) => ({ user: mockUser, ...credentials })
export const register = async ({ name, email }) => ({ user: { name, email } })
export const logout = async () => true
