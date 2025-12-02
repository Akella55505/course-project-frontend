import apiClient from "../../lib/axios.ts";
import type { ApplicationRole } from "../auth/types.ts";
import type { UseMutationResult} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

type QueryParameters = {
	email: string;
	role: ApplicationRole;
}

const updateUserRole = async ({ email, role }: QueryParameters): Promise<void> => {
	await apiClient.patch('/admin', null, { params: { email, role } });
};

export const useUpdateUserRole = (): UseMutationResult<void, Error, QueryParameters> => {
	return useMutation({
		mutationFn: updateUserRole
	});
};