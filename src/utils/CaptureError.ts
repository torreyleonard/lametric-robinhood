import Logger from "./Logger";

function CaptureError(error: Error) {
	Logger.error(error);
}

export default CaptureError;
