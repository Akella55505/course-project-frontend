import type { PassportDetails } from "../persons/types";

export type UserApplication = {
	id: number;
	name: string;
	surname: string;
	patronymic: string;
	passportDetails: PassportDetails;
	licensePlate: string;
	date: string;
	time: string;
	addressStreet: string;
	addressNumber: string;
	applicationStatus: keyof typeof ApplicationStatus;
	senderEmail: string;
}

export enum ApplicationStatus {
	IN_REVIEW = "На розгляді",
	DENIED = "Відхилено",
	PROCESSED = "Оброблено",
}