import apiClient from "../../lib/axios.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourtDecision } from "./types.ts";

const createCourtDecision = async (courtDecision: CourtDecision): Promise<void> => {
	await apiClient.post('/court-decisions', courtDecision);
}

export const useCreateCourtDecision = (): UseMutationResult<void, Error, CourtDecision, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCourtDecision,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}