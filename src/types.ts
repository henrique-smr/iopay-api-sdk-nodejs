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
	address?: {
		line1: string,
		line2: number,
		line3: string,
		neighborhood: string,
		city: string,
		state: string,
		postal_code: string
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

