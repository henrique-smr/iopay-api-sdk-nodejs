import { AxiosInstance } from "axios";
import type { Auth } from "./Auth";
import { IRawTransaction, ITransaction, ITransactionList, ITransactionListParams } from "./types";
import { createAxiosAdapter } from "./utils";



export class Transactions {
	private adapter: AxiosInstance;
	constructor(
		apiEnv: string,
		private auth: Auth

	) {
		this.adapter = createAxiosAdapter(apiEnv);
		this.adapter.interceptors.request.use(async (config) => {
			config.headers['Authorization'] = `Bearer ${await this.auth.getAccessToken()}`;
			return config;
		});

	}

	async create(customerID: string, transaction: IRawTransaction.Credit): Promise<ITransaction.Credit>
	async create(customerID: string, transaction: IRawTransaction.Boleto): Promise<ITransaction.Boleto>
	async create(customerID: string, transaction: IRawTransaction.Pix): Promise<ITransaction.Pix>
	async create(customerID: string, transaction: IRawTransaction.Any) {
		const resp = await this.adapter.post<ITransaction.Any>('v1/transaction/new/' + customerID, transaction);
		return resp.data;
	}

	async get<T extends ITransaction.Any>(transactionID: string) {
		const resp = await this.adapter.get<T>(`v1/transaction/get/${transactionID}`);
		return resp.data;
	}

	async getAll(params: ITransactionListParams) {
		const resp = await this.adapter.get<ITransactionList>(`v1/transaction/list`, { params });
		return resp.data;
	}

	async capture<T extends ITransaction.Any>(transactionID: string, amount: number) {
		const resp = await this.adapter.post<T[]>(`v1/transaction/capture/${transactionID}`, { amount })
		return resp.data
	}

	async cancel<T extends ITransaction.Any>(transactionID: string, amount: number) {
		const resp = await this.adapter.post<T>(`v1/transaction/void/${transactionID}`, { amount })
		return resp.data
	}
}

