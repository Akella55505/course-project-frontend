import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, type UseMutationResult, useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/axios";
import { useNavigate } from "@tanstack/react-router";
import { ApplicationRole } from "./types.ts";
import toast from "react-hot-toast";

type LoginInput = {
	email: string;
	password: string;
};

const register = async (data: LoginInput): Promise<void> => {
	await apiClient.post("/auth/register", data);
};

const login = async (data: LoginInput): Promise<void> => {
	await apiClient.post("/auth/login", data);
};

export const logout = async (): Promise<void> => {
	await apiClient.post("/auth/logout");
};

export const getRole = async (): Promise<Record<string, ApplicationRole>> => {
	const response = await apiClient.get("/auth/role");
	return response.data as Record<string, ApplicationRole>;
};

export const useRegister = (): UseMutationResult<
	void,
	Error,
	LoginInput
> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: register,
		onSuccess: async () => {
			toast.success("Успішно зареєстровано");
			await navigate({ to: "/login" });
		},
	});
};

export const useLogin = (): UseMutationResult<
	void,
	Error,
	LoginInput
> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: async () => {
			const roleResult = await getRole();
			const role = roleResult["role"];

			if (role === ApplicationRole.USER) await navigate({ to: "/user" });
			else if (role === ApplicationRole.ADMIN) await navigate({ to: "/admin" });
			else await navigate({ to: "/accidents" });
		},
	});
};

export const useLogout = (): UseMutationResult<void, Error> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			await navigate({ to: "/login" });
		},
	});
};

export const useRole = (): UseQueryResult<
	Record<string, ApplicationRole>,
	Error
> => {
	return useQuery<Record<string, ApplicationRole>, Error>({
		queryKey: ["role"],
		queryFn: getRole,
	});
};