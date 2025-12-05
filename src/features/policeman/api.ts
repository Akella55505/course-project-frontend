import apiClient from "../../lib/axios.ts";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {useQuery} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import type { Policeman } from "./types.ts";

type Response = {
    isRegistered: boolean
}

const getIsRegistered = async (): Promise<Response> => {
    const response = await apiClient.get('/policemen');
    return response.data as Response;
}

const setPolicemanEmail = async (policemanId: string): Promise<void> => {
	await apiClient.patch(`/policemen`, null, { params: { policemanId } });
}

const createPoliceman = async (policeman: Policeman): Promise<void> => {
	await apiClient.post('/policemen', policeman);
}

export const usePoliceIsRegistered = (): UseQueryResult<Response, Error> =>
    useQuery<Response>({
        queryKey: ['policeman-is-registered'],
        queryFn: () => getIsRegistered(),
    });

export const usePolicemanEmail = (): UseMutationResult<void, Error, string, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: setPolicemanEmail,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['policeman-is-registered'] });
			toast.success("Акаунт успішно прив'язано");
			await navigate({ to: '/accidents' });
		},
	});
};

export const useCreatePoliceman = (): UseMutationResult<void, Error, Policeman> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createPoliceman,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['policeman-is-registered'] });
			toast.success("Акаунт успішно створено");
			await navigate({ to: "/accidents" });
		},
	});
}