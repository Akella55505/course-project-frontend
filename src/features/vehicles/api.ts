import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { Vehicle } from './types';

const getVehiclesByPersonId = async (personId: string): Promise<Array<Vehicle>> => {
	const response = await apiClient.get(`/vehicles/${personId}`);
	return response.data as Array<Vehicle>;
}

const createVehicle = async (newVehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
	const response = await apiClient.post('/vehicles', newVehicle);
	return response.data as Vehicle;
}

export const useVehicles = (): UseMutationResult<Array<Vehicle>, Error, string> => {
	const queryClient = useQueryClient();

	return useMutation<Array<Vehicle>, Error, string>({
		mutationFn: (personId: string) => getVehiclesByPersonId(personId),
		onSuccess: async (personId) => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles', personId] });
		}
	});
};

export const useCreateVehicle = (): UseMutationResult<Vehicle, Error, Omit<Vehicle, "id">, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createVehicle,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
			await navigate({ to: '/accidents/new' });
		},
	});
};