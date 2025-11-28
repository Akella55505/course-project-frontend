import axios, { isAxiosError } from "axios";

const apiClient = axios.create({
	baseURL: String(import.meta.env["VITE_API_BASE_URL"]),
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use((config) => {
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (isAxiosError(error)) {
			console.error(`API error ${error.name}: ${error.message}`);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (error.response?.status === 401 || error.response?.data.errorMessage === 'Authorization header not provided') {
				window.location.href = '/login';
			}
			return Promise.reject(error);
		}
		return;
	}
);

apiClient.defaults.withCredentials = true;

export default apiClient;