import type { InsurancePayment } from "./types.ts";
import apiClient from "../../../lib/axios.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createInsurancePayment = async (insurancePayment: InsurancePayment): Promise<void> => {
	await apiClient.post('/insurance/payments', insurancePayment);
}

export const useCreateInsurancePayment = (): UseMutationResult<void, Error, InsurancePayment, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createInsurancePayment,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}