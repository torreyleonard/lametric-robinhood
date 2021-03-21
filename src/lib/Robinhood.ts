import { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import Logger from "../utils/Logger";
import HttpRequest from "./HttpRequest";
import { getRedisAsync, setRedisAsync } from "./Redis";

const API_URL = "https://api.robinhood.com/";
const DEVICE_TOKEN = uuidv4();

function handleError(error: AxiosError|Error) {
	if (Object.prototype.hasOwnProperty.call(error, "response")) {
		const response = (error as AxiosError).response;
		if (response) {
			Logger.error(JSON.stringify(response.data, null, 2));
			const keys = Object.keys(response.data);
			const message = response.data[keys[0]];
			if (message.includes("challenge")) {
				throw new Error("You must enable two-factor authentication in the Robinhood app.");
			}
			if (message.includes("valid code")) {
				throw new Error("Re-login required. Remove MFA token and * from password field in LaMetric app.");
			}
			throw new Error(message);
		}
	}
	throw error;
}

type AuthenticateResponse = {
	access_token: string;
	expires_in: number;
	token_type: "Bearer";
	scope: "internal";
	refresh_token: string;
	mfa_code: string;
	backup_code: any;
}

export async function Authenticate(username: string, password: string, mfa_code?: string): Promise<AuthenticateResponse> {
	try {
		const existing = await getRedisAsync(username);
		if (existing) {
			return JSON.parse(existing);
		}
		const { data } = await HttpRequest({
			method: "post",
			url: API_URL + "oauth2/token/",
			data: {
				username,
				password,
				grant_type: "password",
				scope: "internal",
				client_id: "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
				device_token: DEVICE_TOKEN,
				expires_in: 86400,
				mfa_code,
			},
		});
		if (data.mfa_required) {
			throw new Error("MFA code required. Append password with *, then the MFA code. Example: mypassword*123456");
		}
		await setRedisAsync(username, JSON.stringify(data));
		return data;
	} catch (error) {
		handleError(error);
	}
}

export async function AccountId(access_token: string): Promise<string> {
	try {
		const existing = await getRedisAsync(access_token);
		if (existing) {
			return existing;
		}
		const { data } = await HttpRequest({
			method: "get",
			url: API_URL + "accounts/",
			headers: {
				Authorization: "Bearer " + access_token,
			},
		});
		const accountId = data.results[0].account_number;
		await setRedisAsync(access_token, accountId);
		return accountId;
	} catch (error) {
		handleError(error);
	}
}

type HistoricalsResponse = {
	adjusted_open_equity: number;
	adjusted_previous_close_equity: number;
	open_equity: number;
	previous_close_equity: number;
	open_time: Date;
	interval: string;
	span: string;
	bounds: string;
	total_return: number;
	equity_historicals: [{
		adjusted_open_equity: number;
		adjusted_close_equity: number;
		open_equity: number;
		close_equity: number;
		open_market_value: number;
		close_market_value: number;
		begins_at: Date;
		net_return: number;
		session: string;

	}];
}

export async function GetHistoricals(
	access_token: string,
	accountId: string,
	span: string,
	interval: string,
): Promise<HistoricalsResponse> {
	try {
		const { data } = await HttpRequest({
			method: "get",
			url: API_URL + "portfolios/historicals/" + accountId + "/",
			headers: {
				Authorization: "Bearer " + access_token,
			},
			params: {
				span,
				interval,
				account: accountId,
				bounds: "trading",
			},
		});
		if (data.mfa_required) {
			throw new Error("MFA code required. Append password with *, then the MFA code. Example: mypassword*123456");
		}
		return data;
	} catch (error) {
		handleError(error);
	}
}
