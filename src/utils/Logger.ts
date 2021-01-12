import { createLogger, format, transports } from "winston";

const DEV = process.env.DEV === "true";

const Logger = createLogger({
	level: DEV ? "debug" : "info",
	exitOnError: false,
	transports: new transports.Console(),
	format: format.combine(
		format.errors({ stack: true }),
		format.simple(),
	),
});

export default Logger;
