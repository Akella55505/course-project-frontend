import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import apiClient  from '../../lib/axios';
import { useNavigate } from "@tanstack/react-router";

type LoginInput = {
	email: string;
	password: string;
};

const register = async (data: LoginInput): Promise<void> => {
	await apiClient.post('/auth/register', data);
};

const login = async (data: LoginInput): Promise<void> => {
	await apiClient.post('/auth/login', data);
};

const logout = async (): Promise<void> => {
	await apiClient.post('/auth/logout');
};

export const useRegister = (): UseMutationResult<void, Error, LoginInput, unknown> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: register,
		onSuccess: async () => {
			await navigate({ to: "/login" });
		},
	});
};

export const useLogin = (): UseMutationResult<void, Error, LoginInput, unknown> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: async () => {
			await navigate({ to: "/accidents" });
		},
	});
};

export const useLogout = (): UseMutationResult<void, Error> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			await navigate({ to: "/login" });
		}
	})
}