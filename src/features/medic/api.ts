import apiClient from "../../lib/axios.ts";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import type { Medic } from "./types.ts";

type Response = {
	isRegistered: boolean
}

const getIsRegistered = async (): Promise<Response> => {
	const response = await apiClient.get('/medics');
	return response.data as Response;
}

const setMedicEmail = async (medicId: string): Promise<void> => {
	console.log(medicId);
	await apiClient.patch(`/medics`, null, { params: { medicId } });
}

const createMedic = async (medic: Medic): Promise<void> => {
	await apiClient.post('/medics', medic);
}

export const useMedicIsRegistered = (): UseQueryResult<Response, Error> =>
	useQuery<Response>({
		queryKey: ['medic-is-registered'],
		queryFn: () => getIsRegistered(),
	});

export const useMedicEmail = (): UseMutationResult<void, Error, string, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: setMedicEmail,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['medic-is-registered'] });
			toast.success("Акаунт успішно прив'язано");
			await navigate({ to: '/accidents' });
		},
	});
};

export const useCreateMedic = (): UseMutationResult<void, Error, Medic> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createMedic,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['medic-is-registered'] });
			toast.success("Акаунт успішно створено");
			await navigate({ to: "/accidents" });
		},
	});
}