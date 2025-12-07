import apiClient from "../../lib/axios.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MedicalReport } from "./types.ts";

const createMedicalReport = async (medicalReport: MedicalReport): Promise<void> => {
	await apiClient.post('/medical-reports', medicalReport);
}

export const useCreateMedicalReport = (): UseMutationResult<void, Error, MedicalReport, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createMedicalReport,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] })
		},
	});
}