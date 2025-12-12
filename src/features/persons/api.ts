import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type { PassportDetails, Person } from "./types";
import type { AccidentDataDto } from "../accidents/types.ts";

const getPersonByPassportDetails = async (passportDetails: PassportDetails): Promise<Person> => {
	const response = await apiClient.get(`/persons`, { params: passportDetails });
	return response.data as Person;
}

const createPerson = async (newPerson: Partial<Person>): Promise<void> => {
	await apiClient.post('/persons', newPerson);
}

const setPersonEmail = async (passportDetails: PassportDetails): Promise<void> => {
	await apiClient.patch(`/persons`, passportDetails);
}

const getPersonData = async (personId: string): Promise<AccidentDataDto> => {
	const response = await apiClient.get(`/persons/${personId}`);
	return response.data as AccidentDataDto;
}

export const usePerson = (): UseMutationResult<Person, Error, PassportDetails> => {
	return useMutation<Person, Error, PassportDetails>({
		mutationFn: (passportDetails: PassportDetails) => getPersonByPassportDetails(passportDetails),
	});
};

export const useCreatePerson = (): UseMutationResult<void, Error, Partial<Person>, unknown> => {
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

export const usePersonData = (personId: string): UseQueryResult<AccidentDataDto, Error> =>
	useQuery<AccidentDataDto>({
		queryKey: ['person', personId],
		queryFn: () => getPersonData(personId),
	});