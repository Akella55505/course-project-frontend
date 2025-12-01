import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { PassportDetails, Person } from "./types";

const getPersons = async (): Promise<Array<Person>> => {
	const response = await apiClient.get('/persons');
	return response.data as Array<Person>;
}

const getPersonById = async (id: string): Promise<Person> => {
	const response = await apiClient.get(`/persons/${id}`);
	return response.data as Person;
}

const createPerson = async (newPerson: Omit<Person, 'id'>): Promise<Person> => {
	const response = await apiClient.post('/persons', newPerson);
	return response.data as Person;
}

const setPersonEmail = async (passportDetails: PassportDetails): Promise<void> => {
	await apiClient.patch(`/persons`, passportDetails);
}

export const usePersons = (): UseQueryResult<Array<Person>, Error> => useQuery<Array<Person>>({ queryKey: ['persons'], queryFn: getPersons });

export const usePerson = (id: string): UseQueryResult<Person, Error> => useQuery<Person>({ queryKey: ['persons', id], queryFn: () => getPersonById(id) });

export const useCreatePerson = (): UseMutationResult<Person, Error, Omit<Person, "id">, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createPerson,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['persons'] });
			await navigate({ to: '/persons' });
		},
	});
};

export const usePersonEmail = (): UseMutationResult<void, Error, PassportDetails, unknown> => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: setPersonEmail,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['user'] });
			await navigate({ to: '/user' });
		},
	});
};