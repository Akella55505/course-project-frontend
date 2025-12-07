import type {	AdministrativeDecision } from "../administrative decision/types";
import type { CourtDecision } from "../court decision/types";
import type {	InsuranceEvaluation } from "../insurance/evaluation/types";
import type { Person } from "../persons/types";
import type { Vehicle } from "../vehicles/types";
import type { MedicalReport } from "../medical report/types.ts";
import type { Violation } from "../violation/types.ts";
import type { AccidentVehicle, PersonAccidentRole } from "../many-to-many/types.ts";
import type { InsurancePayment } from "../insurance/payment/types.ts";

export type Accident = {
	id: number;
	date: string;
	media?: Media;
	addressStreet: string;
	addressNumber: string;
	causes: string;
	considerationStatus: keyof typeof ConsiderationStatus;
	assessmentStatus: keyof typeof AssessmentStatus;
	type: string;
	time: string;
};

export type Media = {
	photos: Array<string>;
	videos: Array<string>;
}

export enum ConsiderationStatus {
	REGISTERED = 'Зареєстровано',
	SENT = 'Передано до суду',
	REVIEWED = 'Розглянуто',
}

export enum AssessmentStatus {
	IN_REVIEW = 'На розгляді',
	ASSESSED = 'Оцінено',
	AGREED = 'Узгоджено',
}

export type AccidentDataDto = {
	accidentData?: Array<Accident>
	personData?: Array<PersonAccidentRole>
	vehicleData?: Array<Vehicle>
	medicalReportData?: Array<MedicalReport>
	administrativeDecisionData?: Array<AdministrativeDecision>
	courtDecisionData?: Array<CourtDecision>
	insuranceEvaluationData?: Array<InsuranceEvaluation>
	insurancePaymentData?: Array<InsurancePayment>
	accidentVehicleData?: Array<AccidentVehicle>
	violationData?: Array<Violation>
	person?: Person
}

export type AccidentStatisticsDto = {
	accidentAmount: number;
	causes: string;
	rank: number;
}

export type AccidentStatisticsStreetsDto = {
	street: string;
	violationCount: number;
	topViolation: string;
	accidentCount: number;
	accidentCountPedestrian: number;
	violationCountRank: number;
	accidentCountRank: number;
	accidentCountPedestrianRank: number;
}

export type AccidentStatisticsPreviousQuarterDto = {
	accidentType: string;
	accidentCount: number;
	victimCount: number;
	paymentAmount: number;
}

export type AccidentReportDto = {
	reportCount: number;
	reportStreet: string;
	streetCount: number;
	reportCauses: string;
	causesCount: number;
	reportType: string;
	typeCount: number;
	reportDaytime: keyof typeof Daytime;
	daytimeCount: number;
	reportViolation: string;
	violationCount: number;
	reportDriver: Person;
	driverCount: number;
}

export enum Daytime {
	MORNING = 'Ранок',
	AFTERNOON = 'День',
	EVENING = 'Вечір',
	NIGHT = 'Ніч'
}