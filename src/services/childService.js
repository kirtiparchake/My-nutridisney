const parseResponse = async (response, fallbackMessage) => {
	const data = await response.json()
	if (!response.ok) throw new Error(data.message || fallbackMessage)
	return data
}

export const getChildren = async (parentId) => {
	const response = await fetch(`/api/children?parentId=${encodeURIComponent(parentId)}`)
	const data = await parseResponse(response, 'Unable to load children')
	return data.children
}

export const loginChild = async (pin) => {
	const response = await fetch('/api/children/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ pin }),
	})
	const data = await parseResponse(response, 'Unable to log in child')
	return data.child
}
