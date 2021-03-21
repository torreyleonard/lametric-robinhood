import axios, { AxiosRequestConfig, AxiosResponse, AxiosProxyConfig } from "axios";

async function HttpRequest(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
	return await axios({
		proxy: await getAxiosProxy(),
		...requestConfig,
	});
}

async function getAxiosProxy(): Promise<AxiosProxyConfig> {
	return {
		host: process.env.PROXY_HOST,
		port: Number(process.env.PROXY_PORT),
		auth: {
			username: process.env.PROXY_USERNAME,
			password: process.env.PROXY_PASSWORD,
		},
	};
}

export default HttpRequest;
