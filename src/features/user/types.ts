import type { PassportDetails } from "../persons/types";

export type UserApplication = {
	name: string;
	surname: string;
	patronymic: string;
	passportDetails: PassportDetails;
	licensePlate: string;
	date: string;
	time: string;
	addressStreet: string;
	addressNumber: string;
}