import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { Accident, AccidentDataDto } from './types';

type QueryParameters = Partial<{
	date: string
	time: string
	addressStreet: string
	addressNumber: string
	name: string
	surname: string
	patronymic: string
}> & { pageIndex: number }

const getAccidents = async (parameters: QueryParameters): Promise<AccidentDataDto> => {
	const response = await apiClient.get('/accidents', { params: parameters });
	return response.data as AccidentDataDto;
}

const createAccident = async (newAccident: Omit<Accident, 'id'>): Promise<Accident> => {
	const response = await apiClient.post('/accidents', newAccident);
	return response.data as Accident;
}

export const useAccidents = (parameters: QueryParameters): UseQueryResult<AccidentDataDto, Error> =>
	useQuery<AccidentDataDto>({
		queryKey: ['accidents', parameters],
		queryFn: () => getAccidents(parameters),
		enabled: parameters.pageIndex !== undefined,
		});

export const useCreateAccident = (): UseMutationResult<Accident, Error, Omit<Accident, "id">, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createAccident,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['accidents'] });
			await navigate({ to: '/accidents' });
		},
	});
};