import pkgInfo from './pkgInfo.json'

/**
 * Default request headers
 */
export const default_api_request_headers = {
	"User-Agent": pkgInfo.name + "/" + pkgInfo.version,
	"Content-Type": 'application/json'
}

/**
 * Base URL for each application environment
 */
export const api_environments = {
	PRODUCTION: "https://api.iopay.com.br/api/",
	SANDBOX: "https://sandbox.api.iopay.com.br/api/"
}

