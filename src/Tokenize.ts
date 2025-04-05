import { AxiosInstance } from "axios";
import type { Auth } from "./Auth";
import { IRawCard, ITokenizedCard } from "./types";
import { createAxiosAdapter } from "./utils";

export class Tokenize {
	private specialAdapter: AxiosInstance;
	constructor(
		apiEnv: string,
		private auth: Auth

	) {
		this.specialAdapter = createAxiosAdapter(apiEnv);
		this.specialAdapter.interceptors.request.use(async (config) => {
			config.headers['Authorization'] = `Bearer ${await this.auth.getSpecialToken()}`;
			return config;
		});
	}

	async card(cardData: IRawCard) {
		const resp = await this.specialAdapter.post<ITokenizedCard>("v1/card/associate_token_with_customer", cardData);
		return resp.data;
	}
}
