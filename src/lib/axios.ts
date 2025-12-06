import axios, { isAxiosError } from "axios";
import { logout } from "../features/auth/api";

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
			if (window.location.pathname === '/login' || window.location.pathname === '/register') return Promise.reject(error);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (error.response?.status === 401 || error.response?.data.errorMessage === 'Authorization header not provided') {
				alert("Виникла помилка. Зайдіть в акаунт або зареєструйтесь");
				void logout();
				window.location.href = '/';
			}
			if (error.response?.status === 403) {
				alert("Доступ заборонено");
				window.location.href = '/';
			}
			return Promise.reject(error);
		}
		return;
	}
);

apiClient.defaults.withCredentials = true;

export default apiClient;