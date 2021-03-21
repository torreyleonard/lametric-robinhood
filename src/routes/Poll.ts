import { Request, Response } from "express";
import CaptureError from "../utils/CaptureError";
import * as _ from "lodash";
import { AccountId, Authenticate, GetHistoricals } from "../lib/Robinhood";

/**
 *  Accepts and processes a request from a LaMetric Time
 *      1. Ensure that the client has submitted auth details
 *      2. Decode Base64 authorization string
 *      3. Check cache and market hours
 *      4. Using req.query, check which items should be sent
 *      5. Authenticate the user and get daily historicals (chart data)
 *
 */
async function Poll(req: Request, res: Response) {
	try {
		if (!Object.prototype.hasOwnProperty.call(req.headers, "authorization")) {
			throw new Error("Invalid login.");
		}

		let auth = req.headers.authorization.split(" ")[1];
		auth = Buffer.from(auth, "base64").toString("ascii");
		const authArray = auth.split(":");

		const username = authArray[0];
		const [password, mfaToken] = authArray[1].split("*");

		if (typeof req.query.display !== "string") {
			throw new Error("You must specify something to display in the LaMetric app.");
		}

		const display = req.query.display.split(",");
		if (display.length === 0) {
			throw new Error("You must specify something to display in the LaMetric app.");
		}

		const { access_token } = await Authenticate(username, password, mfaToken);
		const accountId = await AccountId(access_token);
		const historicals = await GetHistoricals(access_token, accountId, "day", "5minute");

		const data: Record<string, any> = {
			totalValue: historicals.open_equity + historicals.total_return,
			todaysReturn: historicals.total_return,
			hist: historicals.equity_historicals,
			last: historicals.equity_historicals[historicals.equity_historicals.length - 1],
		};
		res.status(200).json({
			frames: generateResponse(display, data),
		});
	} catch (error) {
		CaptureError(error);
		res.status(200).json({
			frames: errorFrame(error.message),
		});
	}
}

export default Poll;

/**
 * Generates response frames based on given parameters
 * @param display - What frames should be displayed
 * @param data - Robinhood historical data
 * @returns {Array}
 */
function generateResponse(display: string[], data: Record<string, any>) {
	const frames = [];

	if (display.length > 1) {
		frames.push({
			text: "ROBNHD",
			icon: "i20951",
		});
	}
	if (display.indexOf("Total portfolio value") !== -1) {
		frames.push({
			text: data.totalValue,
			icon: display.length === 1 ? "i20951" : "i20952",
		});
	}
	if (display.indexOf("Portfolio percentage change") !== -1) {
		frames.push({
			text: data.todaysReturn + "%",
			icon: display.length === 1 ? "i20951" : "a20953",
		});
	}
	if (display.indexOf("Portfolio graph") !== -1) {
		frames.push({
			index: 3,
			chartData: createSparkline(data.hist),
		});
	}
	// if (display.indexOf("Top moving stocks") !== -1 && movers.length !== 0) frames.push({
	// 	text: movers[Math.floor(Math.random() * movers.length)],
	// 	icon: null
	// });

	return frames;
}

/**
 * Creates a "sparkline" chart based on the given Robinhood historical data
 * @param {Object} data
 */
function createSparkline(data: any) {
	let sparklineArray: any[] = [];

	data.forEach((val: any) => {
		sparklineArray.push(Number(val.adjusted_close_equity));
	});

	// Normalize

	const max = _.max(sparklineArray);
	const min = _.min(sparklineArray);

	for (const key in sparklineArray) {
		const val = sparklineArray[key];
		sparklineArray[key] = 100 * (val - min) / (max - min);
	}

	// Average of every 2 - used for fitting more data on the device screen

	if (sparklineArray.length > 50) {
		const array = sparklineArray;
		sparklineArray = [];
		for (let x = 0; x < array.length;) {
			let sum = 0;
			const n = 2;
			for (let y = 0; y < n; y++) {
				sum += +array[x++];
			}
			sparklineArray.push(sum / n);
		}
	}

	return sparklineArray;
}

function errorFrame(errorMsg: string) {
	return [
		{
			text: "ROBNHD",
			icon: "i20951",
		},
		{
			text: errorMsg,
			icon: "i555",
		},
		{
			text: "Fix this in the LaMetric app.",
			icon: "i555",
		},
	];
}
