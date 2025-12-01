import type { UseMutationResult } from "@tanstack/react-query";
import { type UseQueryResult, useQuery, useMutation } from "@tanstack/react-query";
import apiClient from '../../lib/axios';
import type { AccidentDataDto } from "../accidents/types";
import type { UserApplication } from "./types";
import { useNavigate } from "@tanstack/react-router";

const getUserData = async (): Promise<AccidentDataDto> => {
	const response = await apiClient.get('/accidents/user');
	return response.data as AccidentDataDto;
}

const createUserApplication = async (userApplication: UserApplication): Promise<void> => {
	await apiClient.post('/applications', userApplication);
}

export const useUserData = (): UseQueryResult<AccidentDataDto, Error> =>
	useQuery<AccidentDataDto>({
		queryKey: ['user'],
		queryFn: getUserData,
	});

export const useCreateUserApplication = (): UseMutationResult<void, Error, UserApplication> => {
	const navigate = useNavigate();
	
	return useMutation({
		mutationFn: createUserApplication,
		onSuccess: async () => {
			await navigate({ to: "/user" });
		},
	});
}
