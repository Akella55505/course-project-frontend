import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import type {
	Accident,
	AccidentDataDto,
	AccidentStatisticsDto,
	AccidentStatisticsPreviousQuarterDto,
	AccidentStatisticsStreetsDto,
} from "./types";

type QueryParameters = Partial<{
	date: string
	time: string
	addressStreet: string
	addressNumber: string
	name: string
	surname: string
	patronymic: string
	startDate: string
	endDate: string
	startTime: string
	endTime: string
	type: string
}> & { pageIndex: number }

const getAccidents = async (parameters: QueryParameters): Promise<AccidentDataDto> => {
	const response = await apiClient.get('/accidents', { params: parameters });
	return response.data as AccidentDataDto;
}

const getStatistics = async (parameters: QueryParameters): Promise<Array<AccidentStatisticsDto>> => {
	const response = await apiClient.get('/accidents/statistics', { params: parameters });
	return response.data as Array<AccidentStatisticsDto>;
}

const getStatisticsStreets = async (pageIndex: number): Promise<Array<AccidentStatisticsStreetsDto>> => {
	const response = await apiClient.get("/accidents/statistics/streets", { params: { pageIndex } });
	return response.data as Array<AccidentStatisticsStreetsDto>;
}

const getStatisticsPreviousQuarter = async (pageIndex: number): Promise<Array<AccidentStatisticsPreviousQuarterDto>> => {
	const response = await apiClient.get("/accidents/statistics/previous-quarter", { params: { pageIndex } });
	return response.data as Array<AccidentStatisticsPreviousQuarterDto>;
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

export const useStatistics = (parameters: QueryParameters): UseQueryResult<Array<AccidentStatisticsDto>, Error> =>
	useQuery<Array<AccidentStatisticsDto>>({
		queryKey: ['statistics', parameters],
		queryFn: () => getStatistics(parameters),
		enabled: parameters.pageIndex !== undefined,
	});

export const useStatisticsStreets = (pageIndex: number): UseQueryResult<Array<AccidentStatisticsStreetsDto>, Error> =>
	useQuery<Array<AccidentStatisticsStreetsDto>>({
		queryKey: ['statistics-streets', pageIndex],
		queryFn: () => getStatisticsStreets(pageIndex),
		enabled: pageIndex !== undefined,
	});

export const useStatisticsPreviousQuarter = (pageIndex: number): UseQueryResult<Array<AccidentStatisticsPreviousQuarterDto>, Error> =>
	useQuery<Array<AccidentStatisticsPreviousQuarterDto>>({
		queryKey: ['statistics-previous-quarter', pageIndex],
		queryFn: () => getStatisticsPreviousQuarter(pageIndex),
		enabled: pageIndex !== undefined,
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