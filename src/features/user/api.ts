import type { UseMutationResult} from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { type UseQueryResult, useQuery, useMutation } from "@tanstack/react-query";
import apiClient from '../../lib/axios';
import type { AccidentDataDto } from "../accidents/types";
import type { UserApplication } from "./types";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";

const getUserData = async (): Promise<AccidentDataDto> => {
	const response = await apiClient.get('/accidents/user');
	return response.data as AccidentDataDto;
}

const createUserApplication = async (userApplication: Partial<UserApplication>): Promise<void> => {
	await apiClient.post('/applications', userApplication);
}

const getUserApplications = async (pageIndex: number): Promise<Array<UserApplication>> => {
	const response = await apiClient.get("/applications", { params: { pageIndex } });
	return response.data as Array<UserApplication>;
}

const updateUserApplication = async ({ id, declined }: { id: number, declined: boolean }): Promise<void> => {
	await apiClient.patch(`/applications/${id}`, null, { params: { declined } });
}

export const useUserData = (): UseQueryResult<AccidentDataDto, Error> =>
	useQuery<AccidentDataDto>({
		queryKey: ['user'],
		queryFn: getUserData,
	});

export const useCreateUserApplication = (): UseMutationResult<void, Error, Partial<UserApplication>> => {
	const navigate = useNavigate();
	
	return useMutation({
		mutationFn: createUserApplication,
		onSuccess: async () => {
			await navigate({ to: "/user" });
		},
	});
}

export const useUserApplications = (pageIndex: number): UseQueryResult<Array<UserApplication>, Error> =>
	useQuery<Array<UserApplication>>({
		queryKey: ['applications', pageIndex],
		queryFn: () => getUserApplications(pageIndex),
		enabled: pageIndex !== undefined,
	});

export const useUpdateUserApplication = (): UseMutationResult<void, Error, { id: number, declined: boolean }, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateUserApplication,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['applications'] });
			toast.success("Заяву успішно оброблено");
		},
	});
};