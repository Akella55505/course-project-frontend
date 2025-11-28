import type { Person } from "../persons/types.ts";

export type PersonAccidentRole = {
	accidentId: number;
	person: Person;
	accidentRole: keyof typeof AccidentRole;
}

export type AccidentVehicle = {
	accidentId: number;
	vehicleId: number;
}

export enum AccidentRole {
	CULPRIT = 'Винуватець',
	VICTIM = 'Потерпілий',
}