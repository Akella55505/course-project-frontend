import { type UseMutationResult, useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient  from '../../lib/axios';
import { useNavigate } from "@tanstack/react-router";

type LoginInput = {
	email: string;
	password: string;
};

type LoginResponse = {
	message: string;
	data: string;
};

const login = async (data: LoginInput): Promise<LoginResponse> => {
	const response = await apiClient.post('/auth/login', data);
	return response.data as LoginResponse;
};

const logout = async (): Promise<void> => {
	await apiClient.post('/auth/logout');
};

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginInput, unknown> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: async () => {
			await navigate({ to: "/accidents" });
		},
	});
};

export const useLogout = (): UseMutationResult<void, Error> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['auth'] });
		}
	})
}