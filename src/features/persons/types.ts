export type Person = {
	id: number;
	name: string;
	surname: string;
	patronymic: string;
	passportDetails: PassportDetails;
	driverLicense: DriverLicense;
};

type PassportDetails = {
	id: string;
	series: string;
}

type DriverLicense = {
	id: string;
	categories: Array<string>;
}