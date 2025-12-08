import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { PassportDetails, Person } from "./types";

const getPersonByPassportDetails = async (passportDetails: PassportDetails): Promise<Person> => {
	const response = await apiClient.get(`/persons`, { params: passportDetails });
	return response.data as Person;
}

const createPerson = async (newPerson: Omit<Person, 'id'>): Promise<Person> => {
	const response = await apiClient.post('/persons', newPerson);
	return response.data as Person;
}

const setPersonEmail = async (passportDetails: PassportDetails): Promise<void> => {
	await apiClient.patch(`/persons`, passportDetails);
}

export const usePerson = (): UseMutationResult<Person, Error, PassportDetails> => {
	return useMutation<Person, Error, PassportDetails>({
		mutationFn: (passportDetails: PassportDetails) => getPersonByPassportDetails(passportDetails),
	});
};

export const useCreatePerson = (): UseMutationResult<Person, Error, Omit<Person, "id">, unknown> => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createPerson,
		onSuccess: async () => {
			await navigate({ to: '/accidents/new' });
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