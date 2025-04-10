import axios from "axios"
import { default_api_request_headers } from "./consts"

export function createAxiosAdapter(apiEnv: string) {
	const adapter = axios.create({
		headers: default_api_request_headers,
		timeout: 30000,
		baseURL: apiEnv,
	})

	adapter.interceptors.response.use((response) => {
		if (response.data?.success) {
			response.data = response.data.success
		}
		return response
	}, (error) => {
		if (error?.response) {
			return Promise.reject({
				status: error.response.status,
				statusText: error.response.statusText,
				data: error.response.data,
				request: {
					baseURL: error.response.config.baseURL,
					method: error.response.config.method,
					url: error.response.config.url,
					data: error.response.config.data,
				}
			})
		}
		return Promise.reject(error)
	})

	return adapter
}

