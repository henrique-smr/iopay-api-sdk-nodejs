export interface IAuthConfig {
	secret: string,
	email: string,
	io_seller_id: string
}

export interface IApiTokenData {
	access_token: string,
	token_type: string,
	expires_at: number
}
// Customer
export interface IRawCustomer {
	first_name: string,
	last_name?: string,
	email: string,
	taxpayer_id: string,
	phone_number?: string,
	customer_type: 'person_natural' | 'person_legal',
	gender?: 'male' | 'female',
	address: {
		line1?: string,
		line2?: number,
		line3?: string,
		neighborhood?: string,
		city: string,
		state: string,
		postal_code?: string
	}
}
export interface ICustomer extends IRawCustomer {
	id: string
	status: 'active' | 'inactive'
	resource: 'buyer'
	description?: string
	delinquent: boolean
	payment_methods?: any
	default_debit?: string
	default_credit?: string
	created_at?: string
	updated_at?: string
}
// Card
export interface IRawCard {
	holder_name: string,
	expiration_month: string,
	expiration_year: string,
	card_number: string,
	security_code: string
}


export interface ICard {
	id_card: string
	id_customer: string
	holder_name: string
	card_brand: string
	first4_digits: string
	last4_digits: string
	expiration_month: string
	expiration_year: string
	created_at?: string
	updated_at?: string
}
export interface ITokenizedCard {
	id: string
	resource: 'token'
	used: boolean
	type: 'card'
	created_at?: string
	updated_at?: string
	card: Omit<ICard, 'id_card' | 'id_customer'> & { id: string, resource: 'card' }
}
export interface ICustomerCardList {
	id_customer: string
	resource: 'cards'
	default_debit?: ICard
	items: ICard[]
}
//Transaction
export namespace IRawTransaction {
	interface BaseRawTransaction {
		amount: number,
		currency: 'BRL',
		description: string,//descrição de venda
		statement_descriptor: string,//Escrito na fatura
		io_seller_id: string,
		payment_type: 'boleto' | 'pix' | 'credit',
		reference_id?: string
		products?: Array<{
			name: string,
			code: string,
			amount: string,
			quantity: number
		}>
		antifraud_sessid?: string,
		split_rules?: Array<{
			receiver: string,
			receiver_fee_type: 'proportional' | 'full' | 'free',
			split_type: 'percent' | 'fixed',
			//Valor do Split; Percentual: inteiro ntre 1 e 100; Fixo: valor em centavos para aplciar ao Split
			split_value: number,
			chargeback_liable?: boolean
		}>
	}

	export interface Credit extends BaseRawTransaction {
		payment_type: 'credit',
		token?: string,
		id_card?: string,
		capture: 0 | 1,
		transaction_fee?: 'interest_free' | 'with_interest'
		installment_plan: {
			number_installments: number
		},
	}
	export interface Boleto extends BaseRawTransaction {
		payment_type: 'boleto',
		expiration_date?: string,
		payment_limit_date?: string,
		interest?: {
			/*
			* Taxa de juros aplicada após o vencimento do boleto.
			* daily_amount: valor fixo diário de juros após o vencimento (não superior a 3.30% do valor do boleto);
			* daily_percentage: valor percentual diário de juros após o vencimento (não superior a 3.30% do valor do boleto)
			* monthly_percentage: valor percentual mensal de juros após o vencimento (não superior a 99.00% do valor do boleto)
			*/
			mode: "daily_amount" | "daily_percentage" | "monthly_percentage",
			/*
			* Torna-se obrigatório se houver o interest[mode].
			* Caso o interest[mode] seja daily_amount: valor fixo do juros, em centavos. O valor não pode passar de 3.30% do valor total da transação.
			* Caso o interest[mode] seja daily_percentage: porcentagem de juros entre 0.0 e 3.30, número flutuante com até 2 casa decima.
			* Caso o interest[mode] seja monthly_percentage: porcentagem de juros entre 0.0 e 99.00, número flutuante com até 2 casa decima.
			*/
			value: number,
			start_date?: string
		}
		late_fee?: {
			/*
			* Multa aplicada após o vencimento do boleto.
			* Tipo de multa aplicada após o vencimento do boleto.
			* amount: o valor da multa será indicado em centavos;
			* percentage: o valor da multa será indicado em porcentagem (em relação ao valor do boleto);
			*/
			mode: "amount" | "percentage",
			/*
			* Torna-se obrigatório se houver o late_fee[mode].
			* Caso o late_fee[mode] seja amount: valor inteiro em centavos (não superior a 100% do valor do boleto).
			* Caso o late_fee[mode] seja percentage: valor percentual da multa, float com até 1 casa decimal (não superior a 100.0% do valor do boleto), ex.: 15.5 = 15,5%
			*/
			value: number,
			start_date?: string
		}
	}

	export interface Pix extends Omit<BaseRawTransaction, 'products'> {
		payment_type: 'pix'
	}

	export type Any = Credit | Boleto | Pix
}

export namespace IPaymentMethods {
	interface BasePaymentMethod {
		id: string,
		resource: 'card' | 'boleto',
		customer: string,
		description?: string,
		fingerprint?: string,
		address?: any,
		metadata?: Record<string, string>,
		uri?: string
		created_at: string,
		updated_at: string,
	}
	export interface Boleto extends BasePaymentMethod {
		resource: 'boleto'
		url: string,
		reference_number: string,
		document_number: string,
		expiration_date: string,
		payment_limit_date: string,
		recipient: string,
		bank_code: string,
		sequence: string,
		barcode: string,
		status: 'paid' | 'not_paid',
		accepted?: boolean,
		printed?: boolean,
		downloaded?: boolean,
		paid_at?: string,
		billing_instructions?: {
			discount?: {
				mode?: 'FIXED' | 'PERCENTAGE',
				limit_date?: string,
				amount?: string,
				percentage?: string
			},
			late_fee?: {
				mode?: 'FIXED' | 'PERCENTAGE',
				start_date?: string,
				amount?: string,
				percentage?: string
			},
			interest?: {
				mode?: 'DAILY_AMOUNT' | 'DAILY_PERCENTAGE' | 'MONTHLY_PERCENTAGE',
				start_date?: string,
				amount?: string,
				percentage?: string
			}
		}
	}
	export interface Credit extends BasePaymentMethod {
		resource: 'card'
		card_brand: string,
		first4_digits: string,
		last4_digits: string,
		expiration_month: string,
		expiration_year: string,
		holder_name: string,
		is_active: boolean,
		is_valid: boolean,
		is_verified: boolean,
		verification_checklist?: {
			postal_code_check: string,
			security_code_check: string,
			address_line1_check: string
		},
		amount?: string
	}
	export interface Pix {
		id: string,
		provider: string,
		version: string,
		type: string,
		reusable: boolean,
		allow_update: boolean,
		expiration_date: string,
		key: {
			type: string,
			value: string
		},
		pix_link: string
		qr_code: {
			emv: string
		}
	}
}

export namespace ITransaction {

	interface BaseTransaction {
		id: string,
		resource: 'transaction',
		status: Status
		confirmed?: string,
		amount: string,
		original_amount: string,
		currency: 'BRL',
		description: string,
		payment_type: 'boleto' | 'credit' | 'pix',
		refunds?: string,
		rewards?: string,
		discounts?: string,
		sales_receipt?: string,
		customer?: string,
		statement_descriptor: string,
		payment_method: IPaymentMethods.Boleto | IPaymentMethods.Credit | IPaymentMethods.Pix
		refunded: boolean,
		voided: boolean,
		captured: boolean,
		fees: string,
		fee_details: Array<Fee>
		location_latitude?: string,
		location_longitude?: string,
		expected_on?: string,
		created_at: string,
		updated_at?: string,
		voided_at?: string
		reference_id: string,
		history?: Array<History>
		antifraud_packageID?: string,
		antifraud_code?: string,
		antifraud_status?: string,
		antifraud_type?: string,
		split_rules?: Array<{
			receiver: string,
			receiver_fee_type: 'proportional' | 'full' | 'free',
			split_type: 'percent' | 'fixed',
			//Valor do Split; Percentual: inteiro ntre 1 e 100; Fixo: valor em centavos para aplciar ao Split
			split_value: number,
			chargeback_liable?: boolean
		}>
	}
	export interface Fee {
		amount: string,
		prepaid: boolean,
		currency: string,
		type: string,
		is_gateway_fee: boolean,
		description: string
	}
	export enum Status {
		pre_authorized = 'pre_authorized',
		succeeded = 'succeeded',
		failed = 'failed',
		canceled = 'canceled',
		reversed = 'reversed',
		refunded = 'refunded',
		pending = 'pending',
		new = 'new',
		partial_refunded = 'partial_refunded',
		dispute = 'dispute',
		charged_back = 'charged_back',
	}
	export enum OperationType {
		created = 'created',
		pre_authorization = 'pre_authorization',
		paid = 'paid',
		canceled = 'canceled',
		capture = 'capture',
		void = 'void',
		void_partial = 'void_partial',
	}
	export interface History {
		id: string,
		transaction: string,
		amount: string,
		operation_type: OperationType,
		status: 'succeeded' | 'failed',
		response_code?: string,
		response_message?: string,
		authorization_code?: string,
		authorizer_id?: string,
		authorization_nsu?: string,
		gatewayResponseTime?: string,
		authorizer?: string
		created_at: string
	}
	export interface Boleto extends BaseTransaction {
		payment_type: 'boleto',
		payment_method: IPaymentMethods.Boleto,
	}
	export interface Credit extends BaseTransaction {
		payment_type: 'credit',
		payment_method: IPaymentMethods.Credit,

		installment_plan: {
			number_installments: string,
			mode: 'interest_free' | 'with_interest'
		}
		payment_authorization?: {
			authorizer_id: string,
			authorization_code: string,
			authorization_nsu: string
		}

	}
	export interface CapturedCredit extends Omit<Credit, 'reference_id'> {
		transaction_number?: string,
		gateway_authorizer?: string,
		source?: {
			id: string
			status: string
			usage: string
			amount: string
			currency: 'BRL'
			description?: string
			statement_descriptor?: string
			type: 'card'
			card: IPaymentMethods.Credit
		}
		point_of_sale: {
			entry_mode: string,
			identification_number?: string
		},
		metadata: {
			reference_id: string
		},
	}
	export interface Pix extends BaseTransaction {
		payment_type: 'pix',
		payment_method: IPaymentMethods.Pix,
		pix_qrcode_url: string,
		qrcode_link: string,
		existing_transaction: boolean
		individual?: boolean,
		business?: boolean,
	}

	export type Any = Credit | Boleto | Pix
}

export enum IWebhookEventType {
	transaction_created = "transaction.created",
	transaction_canceled = "transaction.canceled",
	transaction_capture_failed = "transaction.capture.failed",
	transaction_capture_succeeded = "transaction.capture.succeeded",
	transaction_charged_back = "transaction.charged_back",
	transaction_commission_succeeded = "transaction.commission.succeeded",
	transaction_disputed = "transaction.disputed",
	transaction_dispute_succeeded = "transaction.dispute.succeeded",
	transaction_pre_authorization_failed = "transaction.pre_authorization.failed",
	transaction_pre_authorization_succeeded = "transaction.pre_authorization.succeeded",
	transaction_pre_authorized = "transaction.pre_authorized",
	transaction_reversed = "transaction.reversed",
	transaction_succeeded = "transaction.succeeded",
	transaction_updated = "transaction.updated",
	transaction_void_failed = "transaction.void.failed",
	transaction_void_succeeded = "transaction.void.succeeded",
	transaction_failed = "transaction.failed",
}
export interface IWebhookEvent {
	reference_id: string,
	id: string,
	type: IWebhookEventType
}

type IList<T> = {
	resource: 'list',
	items: Array<T>,
	has_more: boolean,
	limit: number,
	total_pages: number,
	page: number,
	offset: number,
	total: number,
	query_count: number
}

type IListParams = {
	page?: number,
	limit?: number,
	sort?: 'time-descending' | 'time-ascending',
	offset?: number,
}

export type ITransactionListParams = IListParams & {
	"data_range[gte]"?: number,
	"data_range[lte]"?: number,
	status?: ITransaction.Status,
	payment_type?: 'credit' | 'debit' | 'boleto' | 'pix',
	reference_id?: string
}

export type ITransactionList = IList<ITransaction.Any>

export type ICustomerListParams = IListParams & {
	"created_at[gte]"?: number,
	"created_at[lte]"?: number,
}

export type ICustomerList = IList<ICustomer>
export interface IRawSellerNatural {
	/*Booleano; TRUE = Enviar email de boas vindas com link para redefinição de senha da conta digital; FALSE = Não enviará email de boas vindas; Por padrão este parâmetro ficará como false*/
	send_welcome_email?: boolean;
	/*Inteiro, com 4 dígitos; Classificação do negócio pelo tipo fornecido de bens ou serviços; Consulte a listagem de MCC's na API*/
	mcc: number;
	/*Receita estimada*/
	revenue: number;
	/*String máximo 100 caracteres; Primeiro nome do vendedor*/
	first_name: string;
	/*String máximo 65 caracteres; Sobrenome do vendedor*/
	last_name: string;
	/*String máximo 40 caracteres; Email válido, para contato com o vendedor*/
	email: string;
	/*String no formato (00)000000000; Número de Telefone do Vendedor (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
	phone_number: string;
	/*String com 11 caracteres; CPF do Vendedor, apenas números*/
	cpf: string;
	/*Data de nascimento do Vendedor, no formato AAAA-MM-DD*/
	birthdate: string;
	/*String mínimo 5, máximo 40 caracteres; O nome que aparece na fatura associado a transação*/
	statement_descriptor: string;
	/*Matriz com os dados de residência do Vendedor*/
	address: {
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string;
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number;
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string;
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string;
		/*String máximo 40 caracteres; Cidade*/
		city: string;
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string;
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string;
		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: 'BR';
	};
	business: undefined;
}
export interface IRawSellerLegal {

	/*Booleano; TRUE = Enviar email de boas vindas com link para redefinição de senha da conta digital; FALSE = Não enviará email de boas vindas; Por padrão este parâmetro ficará como false*/
	send_welcome_email?: boolean;
	/*Inteiro, com 4 dígitos; Classificação do negócio pelo tipo fornecido de bens ou serviços; Consulte a listagem de MCC's na API*/
	mcc: number;
	/*Receita estimada da empresa*/
	revenue: number;
	/*String mínimo 5, máximo 40 caracteres; O nome que aparece na fatura associado a transação*/
	statement_descriptor: string;
	/*Matriz com os dados da Empresa*/
	business: {
		/*String máximo 100 caracteres; Nome da empresa*/
		name: string;
		/*String máximo 40 caracteres; Email válido, para contato com a Empresa*/
		email: string;
		/*String no formato (00)000000000; Número de Telefone da Empresa (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
		phone_number: string;
		/*String com 14 dígitos; CNPJ da Empresa, apenas números*/
		cnpj: string;
		/*String; Data de abertura da Empresa, no formato AAAA-MM-DD*/
		opening_date: string;

		/*String máximo 100 caracteres; URL do site da empresa*/
		website?: string;
	};
	/*Matriz com os dados do proprietário (sócio majoritário, representante, ou diretor) da empresa*/
	owner: {
		/*String máximo 100 caracteres; Primeiro nome*/
		first_name: string;
		/*String máximo 100 caracteres; Sobrenome*/
		last_name: string;
		/*String máximo 100 caracteres; Email para contato*/
		email: string;
		/*String no formato (00)000000000; Número de Telefone (Telefone fixo com DDD+8 dígitos ou móvel com DDD+9 dígitos)*/
		phone_number: string;
		/*String com 11 caracteres; CPF, apenas números*/
		cpf: string;
		/*Data de nascimento, no formato AAAA-MM-DD*/
		birthdate: string;
	};

	/*Matriz com os dados de endereço da empresa*/
	business_address: {
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string;
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number;
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string;
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string;
		/*String máximo 40 caracteres; Cidade*/
		city: string;
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string;
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string;

		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: 'BR';
	};
	/*Matriz com os dados de residência do proprietário (sócio majoritário, representante, ou diretor) da empresa*/
	owner_address: {
		/*String mínimo 5, máximo 100 caracteres; Logradouro*/
		line1: string;
		/*Inteiro até 10 dígitos; Número de residência (utilize 0 quando não ter número)*/
		line2: number;
		/*String máximo 100 caracteres; Complemento do Endereço, apartamento, referência*/
		line3?: string;
		/*String máximo 40 caracteres; Bairro*/
		neighborhood: string;
		/*String máximo 40 caracteres; Cidade*/
		city: string;
		/*String com 2 caracteres; Estado (UF - sigla da unidade federativa)*/
		state: string;
		/*String com 9 caracteres; CEP, no formato 00000-000*/
		zip_code: string;
		/*String com 2 caracteres; Código do País, atualmente aceito apenas "BR"*/
		country_code: 'BR';
	};
}
export interface IDigitalAccountLogin {
	email: string;
	password?: string;
	user_full_name?: string;
	send_welcome_email?: boolean;
}
export interface IDigitalAccountLoginResponse {
	user_full_name: string;
	email: string;
	send_welcome_email: boolean;
}
interface IDigitalAccountUserListItem {
	name: string;
	email: string;
	created_at: string;
	updated_at: string;
}
export interface IDigitalAccountUserListResponse {
	resource: 'list';
	limit: number;
	offset: number;
	page: number | null;
	sort: string;
	total: number;
	query_count: number;
	has_more: boolean;
	items: IDigitalAccountUserListItem[];
}
export interface IDigitalAccountUserDeleteResponse {
	deleted: true;
}
enum BankAccountType {
	/* Conta Corrente */
	CHECKING = 'checking',
	/* Conta Poupança */
	SAVINGS = 'savings'
}
export interface IRawBankAccount {
	/* Nome portador no registro da conta bancária */
	holder_name: string;
	/* Código do banco */
	bank_code: string;
	/* Código da agência */
	routing_number: string;
	/* Número da conta */
	account_number: string;
	/* CNPJ da conta */
	ein?: string;
	/* CPF da conta */
	taxpayer_id?: string;
	/* Tipo de conta bancária */
	type: BankAccountType;
}
interface ISellerAddressUpdate {
	line1: string;
	line2: string;
	line3?: string;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
}
export interface IRawSellerNaturalUpdate {
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	birthdate: string;
	statement_descriptor: string;
	address: ISellerAddressUpdate;
}
interface IRawSellerLegalBusinessUpdate {
	name: string;
	email: string;
	phone_number: string;
	opening_date: string;
	website?: string;
}
interface IRawSellerLegalOwnerUpdate {
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	cpf: string;
	birthdate: string;
}
export interface IRawSellerLegalUpdate {
	statement_descriptor: string;
	business: IRawSellerLegalBusinessUpdate;
	owner: IRawSellerLegalOwnerUpdate;
	business_address: ISellerAddressUpdate;
	owner_address: ISellerAddressUpdate;
}
// Response Interfaces
export interface ISellerNaturalResponse {
	io_seller_id: string;
	taxpayer_id: string;
	type: 'individual';
	first_name: string;
	last_name: string;
	description?: string | null;
	revenue: number;
	email: string;
	phone_number: string;
	mcc: number;
	birthdate: string;
	address_line1: string;
	address_line2: string;
	address_line3?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
	plan_type: string;
	online_payments: string;
	status: string;
	created_by?: string | null;
	updated_at: string;
	created_at: string;
	id: number;
}
export interface ISellerLegalResponse {
	io_seller_id: string;
	taxpayer_id: string;
	type: 'business';
	revenue: number;
	first_name: string; // Business Name
	last_name: string; // Often empty string
	description?: string | null;
	email: string; // Business Email
	phone_number: string; // Business Phone
	mcc: number;
	birthdate: string; // Business Opening Date
	address_line1: string;
	address_line2: string;
	address_line3?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
	plan_type: string;
	online_payments: string;
	status: string;
	owner_tel: string;
	owner_name: string;
	owner_taxpayer_id: string;
	owner_birthdate: string;
	owner_email: string;
	created_by?: string | null;
	updated_at: string;
	created_at: string;
	id: number;
}
export interface ISellerIndividualUpdateResponse {
	io_seller_id: string;
	type: 'individual';
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	mcc: string; // Note: string in update response
	birthdate: string;
	address_line1: string;
	address_line2: string;
	address_line3?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
	website?: string | null;
	online_payments: number; // Note: number in update response
	owner_tel?: string | null;
	owner_name?: string | null;
	owner_taxpayer_id?: string | null;
	owner_birthdate?: string | null;
	owner_email?: string | null;
	plan_type: string;
	enable_credit?: 'S' | 'N';
	enable_boleto?: 'S' | 'N';
	enable_pix?: 'S' | 'N';
	credit_max_installments?: number;
	statement_descriptor: string;
	url_notify?: string;
	url_allow_from?: string;
	url_logo?: string;
	max_transaction_amount?: number;
	allow_register_seller?: number;
	created_by?: string | null;
	status: string;
	created_at: string;
	updated_at: string;
}
export interface ISellerBusinessUpdateResponse {
	io_seller_id: string;
	type: 'business';
	first_name: string; // Business Name
	last_name?: string | null; // Often empty or null
	email: string; // Business Email
	phone_number: string; // Business Phone
	mcc: string; // Note: string in update response
	birthdate: string; // Business Opening Date
	address_line1: string;
	address_line2: string;
	address_line3?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
	website?: string | null;
	online_payments: number; // Note: number in update response
	owner_tel: string;
	owner_name: string;
	owner_taxpayer_id: string;
	owner_birthdate: string;
	owner_email: string;
	plan_type: string;
	enable_credit?: 'S' | 'N';
	enable_boleto?: 'S' | 'N';
	enable_pix?: 'S' | 'N';
	credit_max_installments?: number;
	statement_descriptor: string;
	url_notify?: string;
	url_allow_from?: string;
	url_logo?: string;
	max_transaction_amount?: number;
	allow_register_seller?: number;
	created_by?: string | null;
	status: string;
	created_at: string;
	updated_at: string;
}
export interface ISellerDeleteResponse {
	id: string; // This is the io_seller_id
	resource: 'seller';
	type: 'individual' | 'business';
	deleted: true;
}

// MCC List
export interface IMccItem {
	code: string;
	category: string;
	description: string;
}
export interface IMccListResponse {
	resource: 'list';
	limit: number;
	offset: number;
	page: number | null;
	sort: string | null;
	total: number;
	query_count: number;
	has_more: boolean;
	items: IMccItem[];
}

// Seller List Item (shared with single seller/search)
export interface ISellerListItem {
	io_seller_id: string;
	type: 'individual' | 'business';
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	mcc: string;
	birthdate: string;
	address_line1: string;
	address_line2: string;
	address_line3?: string | null;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
	country_code: 'BR';
	website?: string | null;
	online_payments: number;
	owner_tel?: string | null;
	owner_name?: string | null;
	owner_taxpayer_id?: string | null;
	owner_birthdate?: string | null;
	owner_email?: string | null;
	plan_type: string;
	enable_credit?: 'S' | 'N';
	enable_boleto?: 'S' | 'N';
	enable_pix?: 'S' | 'N';
	credit_max_installments?: number;
	statement_descriptor: string;
	url_notify?: string;
	url_allow_from?: string;
	url_logo?: string;
	max_transaction_amount?: number;
	allow_register_seller?: number;
	created_by?: string | null;
	status: string;
	created_at: string;
	updated_at: string;
	taxpayer_id?: string; // present in search
	description?: string | null;
	revenue?: number | null;
	sub_arrangement_id?: number;
}

export interface ISellerListResponse {
	resource: 'list';
	limit: number;
	offset: number;
	page: number | null;
	sort: string;
	total: number;
	query_count: number;
	has_more: boolean;
	items: ISellerListItem[];
}

// Single Seller (same as ISellerListItem)
export type ISellerGetResponse = ISellerListItem;

// Seller Balance
export interface ISellerBalanceItems {
	current_balance: string;
	account_balance: string;
}
export interface ISellerBalanceResponse {
	resource: 'list';
	items: ISellerBalanceItems;
}

// Seller Search (by taxpayer id)
export type ISellerSearchResponse = ISellerListItem;

// Bank Account Types
export interface IBankAccount {
	id: string;
	resource: 'bank_account';
	holder_name: string;
	taxpayer_id: string;
	description: string | null;
	bank_name: string;
	bank_code: string;
	type: string;
	account_number?: string;
	last4_digits?: string;
	country_code: 'BR';
	routing_number: string;
	routing_check_digit: string | null;
	phone_number: string | null;
	is_active: boolean;
	is_verified: boolean;
	debitable: boolean;
	customer: string | null;
	fingerprint: string;
	address: any;
	verification_checklist: {
		postal_code_check: string;
		address_line1_check: string;
		deposit_check: string;
	};
	metadata: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface IBankAccountTokenizeResponse {
	id: string;
	resource: 'token';
	type: 'bank_account';
	used: boolean;
	bank_account: IBankAccount;
	created_at: string;
	updated_at: string;
}

export interface IBankAccountAssociateResponse extends IBankAccount { }

export interface IBankAccountListResponse {
	resource: 'list';
	items: IBankAccount[];
	limit: number;
	offset: number;
	has_more: boolean;
	query_count: number;
	total: number;
}

export type IBankAccountGetResponse = IBankAccount;

export interface IBankAccountDeleteResponse {
	deleted: boolean;
}

// Transfers
export interface ITransferCreateRequest {
	amount: string; // integer as string, in cents
	statement_descriptor: string;
	description: string;
}

export type ITransfer = any

export interface ITransferCreateResponse extends ITransfer { }

export type ITransferListResponse = any


export type ITransferGetResponse = ITransfer;

export type ITransferTransaction = any

export type ITransferTransactionListResponse = any


