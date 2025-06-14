import { AxiosInstance } from "axios";
import type { Auth } from "./Auth";
// import { ICard, ICustomer, ICustomerCardList, ICustomerList, ICustomerListParams, IRawCustomer } from "./types";
import { createAxiosAdapter } from "./utils";
import { 
	IRawSellerLegal, 
	ISellerLegalResponse, 
	IRawSellerNatural, 
	ISellerNaturalResponse,
	IDigitalAccountLogin, 
	IDigitalAccountLoginResponse, 
	IDigitalAccountUserListResponse, 
	IDigitalAccountUserDeleteResponse, 
	IRawBankAccount, 
	IRawSellerNaturalUpdate, 
	ISellerIndividualUpdateResponse, 
	IRawSellerLegalUpdate, 
	ISellerBusinessUpdateResponse, 
	ISellerDeleteResponse,
	IBankAccountTokenizeResponse,
	IBankAccountAssociateResponse,
	IBankAccountListResponse,
	IBankAccountGetResponse,
	IBankAccountDeleteResponse,
	ITransferCreateRequest,
	ITransferCreateResponse,
	ITransferListResponse,
	ITransferGetResponse,
	ITransferTransactionListResponse
} from "./types";

export class Seller {
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

	async create(rawSeller: IRawSellerLegal): Promise<ISellerLegalResponse>;
	async create(rawSeller: IRawSellerNatural): Promise<ISellerNaturalResponse>;
	async create(rawSeller: IRawSellerNatural | IRawSellerLegal): Promise<ISellerNaturalResponse | ISellerLegalResponse> {
		const resp = await this.adapter.post(`v1/sellers/create/${rawSeller.business ? 'businesses' : 'individuals'}`, rawSeller);
		return resp.data;
	}
	
	async update(io_seller_id:string, rawSeller: IRawSellerLegal): Promise<ISellerLegalResponse>;
	async update(io_seller_id:string, rawSeller: IRawSellerNatural): Promise<ISellerNaturalResponse>;
	async update(io_seller_id:string, rawSeller: IRawSellerNatural | IRawSellerLegal): Promise<ISellerNaturalResponse | ISellerLegalResponse> {
		const resp = await this.adapter.patch(`v1/sellers/update/${rawSeller.business ? 'businesses' : 'individuals'}/${io_seller_id}`, rawSeller);
		return resp.data;
	}

	async get(sellerID: string) {
		const resp = await this.adapter.get(`v1/sellers/get/${sellerID}`);
		return resp.data;
	}
	async getFromTaxpayerID(taxpayerID: string) {
		const resp = await this.adapter.get(`v1/sellers/search/${taxpayerID}`);
		return resp.data;
	}
	async getAll(params: any) {
		const resp = await this.adapter.get(`v1/sellers/list`, { params });
		return resp.data;
	}
	async getMccList() {
		const resp = await this.adapter.get(`v1/sellers/mcc_list`);
		return resp.data;
	}

	async getBalance(sellerID: string) {
		const resp = await this.adapter.get(`v1/sellers/get/${sellerID}/balances`);
		return resp.data;
	}

	async loginDigitalAccount(sellerID: string, params: IDigitalAccountLogin): Promise<IDigitalAccountLoginResponse> {
		const resp = await this.adapter.post(`v1/sellers/digital_account/login/${sellerID}`, params);
		return resp.data;
	}
	async getDigitalAccount(sellerID: string): Promise<IDigitalAccountUserListResponse> {
		const resp = await this.adapter.get(`v1/sellers/digital_account/login/${sellerID}`);
		return resp.data;
	}
	async deleteDigitalAccount(sellerID: string, email: string): Promise<IDigitalAccountUserDeleteResponse> {
		const resp = await this.adapter.request({
			url: `v1/sellers/digital_account/login/${sellerID}`,
			method: 'DELETE',
			data: {
				email
			}
		});
		return resp.data;
	}

	async autorizeSharedCustomers(sellerID: string) {
		const resp = await this.adapter.post(`v1/shared_customers/authorize_seller`, {
			authorized_partner: sellerID
		});
		return resp.data;
	}

	async listAuthorizedSharedCustomers() {
		const resp = await this.adapter.get(`v1/shared_customers/authorized_sellers`);
		return resp.data;
	}

	async deleteAuthorizedSharedCustomers(shared_seller_authorization_id: string) {
		const resp = await this.adapter.delete(`v1/shared_customers/authorization/${shared_seller_authorization_id}`);
		return resp.data;
	}

	async tokenizeBankAccount(sellerID: string, params: IRawBankAccount): Promise<IBankAccountTokenizeResponse> {
		const resp = await this.adapter.post(`v1/sellers/bank_accounts/tokenize/${sellerID}`, params);
		return resp.data;
	}

	async associateBankAccount(sellerID: string, token: string): Promise<IBankAccountAssociateResponse> {
		const resp = await this.adapter.post(`v1/sellers/bank_accounts/associate_bank_account`, {
			io_seller_id: sellerID,
			token: token
		});
		return resp.data;
	}

	async listBankAccounts(sellerID: string): Promise<IBankAccountListResponse> {
		const resp = await this.adapter.get(`v1/sellers/bank_accounts/list/${sellerID}`);
		return resp.data;
	}

	async getBankAccount(sellerID: string, bankAccountID: string): Promise<IBankAccountGetResponse> {
		const resp = await this.adapter.get(`v1/sellers/bank_accounts/get/${sellerID}/${bankAccountID}`);
		return resp.data;
	}

	async deleteBankAccount(sellerID: string, bankAccountID: string): Promise<IBankAccountDeleteResponse> {
		const resp = await this.adapter.delete(`v1/sellers/bank_accounts/delete/${sellerID}/${bankAccountID}`);
		return resp.data;
	}

	async listTransfers(sellerID: string): Promise<ITransferListResponse> {
		const resp = await this.adapter.get(`v1/sellers/transfers/list/${sellerID}`);
		return resp.data;
	}

	async getTransfer(sellerID: string, transferID: string): Promise<ITransferGetResponse> {
		const resp = await this.adapter.get(`v1/sellers/transfers/get/${sellerID}/${transferID}`);
		return resp.data;
	}

	async listTransferTransactions(sellerID: string, transferID: string): Promise<ITransferTransactionListResponse> {
		const resp = await this.adapter.get(`v1/sellers/transfers/get/${sellerID}/${transferID}/transactions`);
		return resp.data;
	}

	async createTransfer(sellerID: string, bankAccountID: string, data: ITransferCreateRequest): Promise<ITransferCreateResponse> {
		const resp = await this.adapter.post(`v1/sellers/transfers/new/${sellerID}/${bankAccountID}`, data);
		return resp.data;
	}

	async updateIndividual(sellerID: string, data: IRawSellerNaturalUpdate): Promise<ISellerIndividualUpdateResponse> {
		const resp = await this.adapter.patch(`v1/sellers/update/individuals/${sellerID}`, data);
		return resp.data;
	}

	async updateBusiness(sellerID: string, data: IRawSellerLegalUpdate): Promise<ISellerBusinessUpdateResponse> {
		const resp = await this.adapter.patch(`v1/sellers/update/businesses/${sellerID}`, data);
		return resp.data;
	}

	async deleteSeller(ioSellerID: string, taxpayerID: string): Promise<ISellerDeleteResponse> {
		const resp = await this.adapter.delete(`v1/sellers/delete/${ioSellerID}/${taxpayerID}`);
		return resp.data;
	}
}

