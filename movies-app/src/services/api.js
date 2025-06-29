const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002',
    timeout: 10000
}

export class ApiClient {
    constructor(config = API_CONFIG) {
        this.baseURL = config.baseURL
        this.timeout = config.timeout
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                console.log(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json()
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout')
            }
            throw new Error(`API Error: ${error.message}`)
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' })
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    }
}

export const apiClient = new ApiClient()
