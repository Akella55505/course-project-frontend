import apiClient from "../../lib/axios.ts";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdministrativeDecision } from "./types.ts";

const createAdministrativeDecision = async (administrativeDecision: AdministrativeDecision): Promise<void> => {
	await apiClient.post('/administrative-decisions', administrativeDecision);
}

export const useCreateAdministrativeDecision = (): UseMutationResult<void, Error, AdministrativeDecision, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAdministrativeDecision,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}