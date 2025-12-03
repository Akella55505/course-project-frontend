import apiClient from "../../lib/axios.ts";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

type Response = {
	isRegistered: boolean
}

const getIsRegistered = async (): Promise<Response> => {
	const response = await apiClient.get('/medics');
	return response.data as Response;
}

export const useMedicIsRegistered = (): UseQueryResult<Response, Error> =>
	useQuery<Response>({
		queryKey: ['medic-is-registered'],
		queryFn: () => getIsRegistered(),
	});