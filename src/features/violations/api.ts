import apiClient from "../../lib/axios.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Violation } from "./types.ts";

const createViolation = async (violation: Violation): Promise<void> => {
	await apiClient.post('/violations', violation);
}

export const useCreateViolation = (): UseMutationResult<void, Error, Violation, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createViolation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}