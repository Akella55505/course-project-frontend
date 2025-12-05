import apiClient from "../../lib/axios.ts";
import { useMutation, UseMutationResult, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import {useQuery} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

type Response = {
    isRegistered: boolean
}

const getIsRegistered = async (): Promise<Response> => {
    const response = await apiClient.get('/policemen');
    return response.data as Response;
}

const setPolicemanEmail = async (policeId: string): Promise<void> => {
	await apiClient.patch(`/policemen`, policeId);
}

export const usePoliceIsRegistered = (): UseQueryResult<Response, Error> =>
    useQuery<Response>({
        queryKey: ['police-is-registered'],
        queryFn: () => getIsRegistered(),
    });

export const usePolicemanEmail = (): UseMutationResult<void, Error, string, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: setPolicemanEmail,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['police-is-registered'] });
			await navigate({ to: '/accidents' });
		},
	});
};