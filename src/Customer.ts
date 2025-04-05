import { AxiosInstance } from "axios";
import type { Auth } from "./Auth";
import { ICard, ICustomer, ICustomerCardList, ICustomerList, ICustomerListParams, IRawCustomer } from "./types";
import { createAxiosAdapter } from "./utils";

export class Customer {
	private adapter: AxiosInstance;
	private specialAdapter: AxiosInstance;
	constructor(
		apiEnv: string,
		private auth: Auth

	) {
		this.adapter = createAxiosAdapter(apiEnv);
		this.specialAdapter = createAxiosAdapter(apiEnv);
		this.adapter.interceptors.request.use(async (config) => {
			config.headers['Authorization'] = `Bearer ${await this.auth.getAccessToken()}`;
			return config;
		});
		this.specialAdapter.interceptors.request.use(async (config) => {
			config.headers['Authorization'] = `Bearer ${await this.auth.getSpecialToken()}`;
			return config;
		});

	}

	async create(rawCustomer: IRawCustomer) {
		const resp = await this.adapter.post<ICustomer>('v1/customer/new', rawCustomer);
		return resp.data;
	}

	async get(customerID: string) {
		const resp = await this.adapter.get<ICustomer>(`v1/customer/get/${customerID}`);
		return resp.data;
	}

	async getAll(params: ICustomerListParams) {
		const resp = await this.adapter.get<ICustomerList>(`v1/customer/list`, { params });
		return resp.data;
	}

	async update(customerID: string, rawCustomer: IRawCustomer) {
		const resp = await this.adapter.post<ICustomer>(`v1/customer/update/${customerID}`, rawCustomer);
		return resp.data;
	}

	async associateCardToken(customerID: string, cardTokenID: string) {
		const resp = await this.specialAdapter.post<ICard>("v1/card/associate_token_with_customer", { id_customer: customerID, token: cardTokenID });
		return resp.data;
	}

	async listCards(customerID: string) {
		const resp = await this.specialAdapter.get<ICustomerCardList>(`v1/card/list/${customerID}`);
		return resp.data;
	}

	async setDefaultCard(customerID: string, cardID: string) {
		const resp = await this.specialAdapter.post<ICustomer>(`v1/card/set_default/${customerID}`, { id_card: cardID });
		return resp.data;
	}

	async deleteCard(customerID: string, cardID: string) {
		const resp = await this.specialAdapter.delete<{ deleted: boolean; }>(`v1/card/delete/${customerID}/${cardID}`);
		return resp.data;
	}

	async deleteAllCards(customerID: string) {
		const resp = await this.specialAdapter.delete<{ deleted: boolean; }>(`v1/card/delete_all/${customerID}`);
		return resp.data;
	}
}

