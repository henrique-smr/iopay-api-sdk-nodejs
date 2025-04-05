import { Auth } from "./Auth";
import { Customer } from "./Customer";
import { Seller } from "./Seller";
import { Tokenize } from "./Tokenize";
import { Transactions } from "./Transactions";
import { IAuthConfig } from "./types";

interface Config {
	auth: IAuthConfig
}

export class Client {
	public readonly auth: Auth
	public readonly Customer: Customer
	public readonly Tokenize: Tokenize
	public readonly Transactions: Transactions
	public readonly Seller: Seller

	constructor(apiEnv: string, config: Config) {
		this.auth = new Auth(apiEnv, config.auth)

		this.Customer = new Customer(apiEnv, this.auth)
		this.Tokenize = new Tokenize(apiEnv, this.auth)
		this.Transactions = new Transactions(apiEnv, this.auth)
		this.Seller = new Seller(apiEnv, this.auth)
	}
}
