import apiClient from "../../../lib/axios.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsuranceEvaluation } from "./types.ts";

const createInsuranceEvaluation = async (insuranceEvaluation: InsuranceEvaluation): Promise<void> => {
	await apiClient.post('/insurance/evaluations', insuranceEvaluation);
}

export const useCreateInsuranceEvaluation = (): UseMutationResult<void, Error, InsuranceEvaluation, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createInsuranceEvaluation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}