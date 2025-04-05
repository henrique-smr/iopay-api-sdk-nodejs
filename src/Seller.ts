import { AxiosInstance } from "axios";
import type { Auth } from "./Auth";
// import { ICard, ICustomer, ICustomerCardList, ICustomerList, ICustomerListParams, IRawCustomer } from "./types";
import { createAxiosAdapter } from "./utils";

interface IRawSellerNatural {
	/*Booleano; TRUE = Enviar email de boas vindas com link para redefinição de senha da conta digital; FALSE = Não enviará email de boas vindas; Por padrão este parâmetro ficará como false*/
	send_welcome_email: boolean
	/*Inteiro, com 4 dígitos; Classificação do negócio pelo tipo fornecido de bens ou serviços; Consulte a listagem de MCC's na API*/
	mcc: number
	/*Receita estimada*/
	revenue: number
	/*String máximo 100 caracteres; Primeiro nome do vendedor*/
	first_name: string
	/*String máximo 65 caracteres; Sobrenome do vendedor*/
	last_name: string
	/*String máximo 40 caracteres; Email válido, para contato com o vendedor*/
	email: string
	/*String no formato (00)000000000; Número de Telefone do Vendedor (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
	phone_number: string
	/*String com 11 caracteres; CPF do Vendedor, apenas números*/
	cpf: string
	/*Data de nascimento do Vendedor, no formato AAAA-MM-DD*/
	birthdate: string
	/*String mínimo 5, máximo 40 caracteres; O nome que aparece na fatura associado a transação*/
	statement_descriptor: string
	/*Matriz com os dados de residência do Vendedor*/
	address:
	{
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string
		/*String máximo 40 caracteres; Cidade*/
		city: string
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string
		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: string
	}
	business: undefined
}
interface IRawSellerLegal {

	/*Booleano; TRUE = Enviar email de boas vindas com link para redefinição de senha da conta digital; FALSE = Não enviará email de boas vindas; Por padrão este parâmetro ficará como false*/
	send_welcome_email?: boolean
	/*Inteiro, com 4 dígitos; Classificação do negócio pelo tipo fornecido de bens ou serviços; Consulte a listagem de MCC's na API*/
	mcc: number
	/*Receita estimada da empresa*/
	revenue: number
	/*String mínimo 5, máximo 40 caracteres; O nome que aparece na fatura associado a transação*/
	statement_descriptor: string
	/*Matriz com os dados da Empresa*/
	business: {
		/*String máximo 100 caracteres; Nome da empresa*/
		name: string
		/*String máximo 40 caracteres; Email válido, para contato com a Empresa*/
		email: string
		/*String no formato (00)000000000; Número de Telefone da Empresa (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
		phone_number: string
		/*String com 14 dígitos; CNPJ da Empresa, apenas números*/
		cnpj: string
		/*String; Data de abertura da Empresa, no formato AAAA-MM-DD*/
		opening_date: string

		/*String máximo 100 caracteres; URL do site da empresa*/
		website?: string
	}
	/*Matriz com os dados do proprietário (sócio majoritário, representante, ou diretor) da empresa*/
	owner: {
		/*String máximo 100 caracteres; Primeiro nome*/
		first_name: string
		/*String máximo 100 caracteres; Sobrenome*/
		last_name: string
		/*String máximo 100 caracteres; Email para contato*/
		email: string
		/*String no formato (00)000000000; Número de Telefone (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
		phone_number: string
		/*String com 11 caracteres; CPF, apenas números*/
		cpf: string
		/*Data de nascimento, no formato AAAA-MM-DD*/
		birthdate: string
	}

	/*Matriz com os dados de endereço da empresa*/
	business_address: {
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string
		/*String máximo 40 caracteres; Cidade*/
		city: string
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string

		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: 'BR'
	}
	/*Matriz com os dados de residência do proprietário (sócio majoritário, representante, ou diretor) da empresa*/
	owner_address: {
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string
		/*String máximo 40 caracteres; Cidade*/
		city: string
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string
		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: 'BR'
	}
}


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

	async create(rawSeller: IRawSellerLegal): Promise<void>
	async create(rawSeller: IRawSellerNatural): Promise<void>
	async create(rawSeller: IRawSellerNatural | IRawSellerLegal) {
		const resp = await this.adapter.post(`v1/sellers/create/${rawSeller.business ? 'businesses' : 'individuals'}`, rawSeller);
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
		const resp = await this.adapter.get(`v1/sellers/mcc_list/`);
		return resp.data;
	}

}

