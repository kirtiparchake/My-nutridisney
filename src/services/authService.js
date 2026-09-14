export const login = async ({ email, password }) => {
	const response = await fetch('/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	})
	const data = await response.json()

	if (!response.ok) {
		const error = new Error(data.message || 'Unable to log in')
		error.status = response.status
		throw error
	}

	return data
}
export const register = async ({ name, email, password }) => {
	const response = await fetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password }),
	})
	const data = await response.json()

	if (!response.ok) {
		const error = new Error(data.message || 'Unable to create your account')
		error.status = response.status
		throw error
	}

	return data
}

export const addChild = async ({ parentId, name, age }) => {
	const response = await fetch('/api/children', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ parentId, name, age }),
	})
	const data = await response.json()

	if (!response.ok) {
		const error = new Error(data.message || 'Unable to add child')
		error.status = response.status
		throw error
	}

	return data
}
export const logout = async () => true
