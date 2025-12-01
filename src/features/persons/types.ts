export type Person = {
	id: number;
	name: string;
	surname: string;
	patronymic: string;
	passportDetails: PassportDetails;
	driverLicense: DriverLicense;
};

export type PassportDetails = {
	id: string;
	series: string;
}

export type DriverLicense = {
	id: string;
	categories: Array<string>;
}