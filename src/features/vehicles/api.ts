import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { Vehicle } from './types';

const getVehiclesByPersonId = async (personId: string): Promise<Array<Vehicle>> => {
	const response = await apiClient.get(`/vehicles/${personId}`);
	return response.data as Array<Vehicle>;
}

const createVehicle = async (newVehicle: Omit<Vehicle, 'id'>): Promise<{ personId: number }> => {
	const response = await apiClient.post('/vehicles', newVehicle);
	return response.data as { personId: number };
}

export const useVehicles = (personId: string): UseQueryResult<Array<Vehicle>, Error> =>
	useQuery<Array<Vehicle>, Error>({
		queryKey: ['vehicles', personId],
		queryFn: () => getVehiclesByPersonId(personId)
	});

export const useCreateVehicle = (): UseMutationResult<{ personId: number }, Error, Omit<Vehicle, "id">, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createVehicle,
		onSuccess: async ({ personId }) => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles', String(personId)] });
			await navigate({ to: "/accidents/new" });
		},
	});
};