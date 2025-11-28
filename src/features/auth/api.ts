import type { UseMutationResult } from "@tanstack/react-query";
// eslint-disable-next-line no-duplicate-imports
import { useMutation } from "@tanstack/react-query";
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

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginInput, unknown> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: async () => {
			await navigate({ to: "/accidents" });
		},
	});
};
