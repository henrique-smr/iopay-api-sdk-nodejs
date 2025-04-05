import { AxiosInstance } from "axios";
import { IApiTokenData, IAuthConfig } from "./types";
import { createAxiosAdapter } from "./utils";

export class Auth {
	private adapter: AxiosInstance;

	private config: IAuthConfig;

	private apiTokenData?: IApiTokenData;
	private apiSpecialTokenData?: IApiTokenData;

	constructor(apiEnv: string, config: IAuthConfig) {
		this.adapter = createAxiosAdapter(apiEnv);
		this.config = config;
	}

	public async login() {
		const resp = await this.adapter.post<IApiTokenData>('auth/login', this.config);
		this.apiTokenData = resp.data;
		return this.apiTokenData;
	}
	public async specialLogin() {
		const resp = await this.adapter.post<IApiTokenData>('v1/card/authentication', this.config);
		this.apiSpecialTokenData = resp.data;
		return this.apiSpecialTokenData;
	}

	public async getAccessToken(): Promise<string> {
		if (this.apiTokenData?.access_token &&
			this.apiTokenData?.expires_at &&
			(this.apiTokenData?.expires_at + 10) > (Date.now() / 1000)) {
			return this.apiTokenData.access_token;
		}
		const apiTokenData = await this.login();
		return apiTokenData.access_token;
	}

	public async getSpecialToken() {
		if (this.apiSpecialTokenData?.access_token &&
			this.apiSpecialTokenData?.expires_at &&
			(this.apiSpecialTokenData?.expires_at + 10) > (Date.now() / 1000)) {
			return this.apiSpecialTokenData.access_token;
		}
		const apiSpecialTokenData = await this.specialLogin();
		return apiSpecialTokenData.access_token;
	}
}

