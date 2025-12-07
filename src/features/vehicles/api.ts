import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { Vehicle } from './types';

const getVehicles = async (): Promise<Array<Vehicle>> => {
	const response = await apiClient.get('/vehicles');
	return response.data as Array<Vehicle>;
}

const getVehicleById = async (id: string): Promise<Vehicle> => {
	const response = await apiClient.get(`/vehicles/${id}`);
	return response.data as Vehicle;
}

const createVehicle = async (newVehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
	const response = await apiClient.post('/vehicles', newVehicle);
	return response.data as Vehicle;
}

const updateVehicle = async ({ id, data }: { id: string, data: Partial<Vehicle> }): Promise<Vehicle> => {
	const response = await apiClient.patch(`/vehicles/${id}`, data);
	return response.data as Vehicle;
}

const deleteVehicle = async (id: string): Promise<void> => {
	await apiClient.delete(`/vehicles/${id}`);
}

export const useVehicles = (): UseQueryResult<Array<Vehicle>, Error> => useQuery<Array<Vehicle>>({ queryKey: ['vehicles'], queryFn: getVehicles });

export const useVehicle = (id: string): UseQueryResult<Vehicle, Error> => useQuery<Vehicle>({ queryKey: ['vehicles', id], queryFn: () => getVehicleById(id) });

export const useCreateVehicle = (): UseMutationResult<Vehicle, Error, Omit<Vehicle, "id">, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createVehicle,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
			await navigate({ to: '/vehicles' });
		},
	});
};

export const useUpdateVehicle = (): UseMutationResult<Vehicle, Error, { id: string, data: Partial<Vehicle> }, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: updateVehicle,
		onSuccess: async (updatedVehicle) => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
			queryClient.setQueryData(['vehicles', updatedVehicle.id], updatedVehicle);
			await navigate({ to: '/vehicles' });
		},
	});
};

export const useDeleteVehicle = (): UseMutationResult<void, Error, string, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteVehicle,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
		}
	})
}