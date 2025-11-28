import { useAccidents } from '../api';
import type { ReactElement} from "react";
import { useState } from "react";
import { loadingAnimation } from "../../../common/elements.tsx";
import React from "react";
import { AccidentRole } from "../../many-to-many/types.ts";

export function AccidentsListPage(): ReactElement {
	const { data, isLoading, isError, error } = useAccidents({ pageIndex: 0 });
	const [expandedAccidents, setExpandedAccidents] = useState<Set<number>>(new Set());
	const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());

	if (isLoading) return loadingAnimation();
	if (isError) return <div className="flex items-center justify-center h-screen text-4xl font-bold">Error loading accidents: {error.message}</div>;

	const toggleSet = (set: Set<number>, id: number): Set<number> => {
		const newSet = new Set(set);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		newSet.has(id) ? newSet.delete(id) : newSet.add(id);
		return newSet;
	};

	const togglePairSet = (set: Set<string>, accidentId: number, personId: number): Set<string> => {
		const newSet = new Set(set);
		const string_ = accidentId + ' ' + personId;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		newSet.has(string_) ? newSet.delete(string_) : newSet.add(string_);
		return newSet;
	};

	const checkIfPairExists = (accidentId: number, personId: number): boolean => {
		const string_ = accidentId + ' ' + personId;
		return expandedPersons.has(string_);
	}

	const dataFetchError = (): ReactElement => {
		return (
			<h1 className="text-red-600">ERROR FETCHING DATA</h1>
		);
	}

	if (data === undefined) {
		return dataFetchError();
	}

	const accidents = data.accidentData;
	const vehicles = data.vehicleData;
	const persons = data.personData;
	const insuranceEvaluations = data.insuranceEvaluationData;
	const insurancePayments = data.insurancePaymentData;
	const administrativeDecisions = data.administrativeDecisionData;
	const violations = data.violationData;
	const medicalReports = data.medicalReportData;
	const courtDecisions = data.courtDecisionData;
	const accidentVehicle = data.accidentVehicleData;

	if (accidents === undefined || persons === undefined) {
		return dataFetchError();
	}

	const buttonClasses = "px-3 py-1 rounded shadow-sm bg-gray-200 hover:bg-gray-300 hover:scale-105 transition-transform duration-150 ease-in-out cursor-pointer";

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">ДТП</h1>
			<table className="w-full table-auto border-collapse border border-gray-300">
				<thead>
				<tr className="bg-gray-100">
					<th className="border px-2 py-1">Дата</th>
					{accidents.some(a => a.type) && (
						<th className="border px-2 py-1">Тип</th>
					)}
					<th className="border px-2 py-1">Адреса</th>
					{accidents.some(a => a.causes) && (
						<th className="border px-2 py-1">Причини</th>
					)}
					<th className="border px-2 py-1">Час</th>
					<th className="border px-2 py-1">Персони</th>
					{accidents.some(a => courtDecisions?.some(cd => cd.accidentId === a.id)) && (
						<th className="border px-2 py-1">Судові рішення</th>
					)}
				</tr>
				</thead>
				<tbody>
				{accidents.map(accumulator => {
					const accidentPersons = persons.filter(p => p.accidentId === accumulator.id);
					const accidentCourtDecisions = courtDecisions?.filter(cd => cd.accidentId === accumulator.id);

					return (
						<React.Fragment key={accumulator.id}>
							<tr className="border">
								<td className="border px-2 py-1">{accumulator.date}</td>
								{accumulator.type && (
									<td className="border px-2 py-1">{accumulator.type}</td>
								)}
								<td className="border px-2 py-1">{accumulator.addressStreet}, {accumulator.addressNumber}</td>
								{accumulator.causes && (
									<td className="border px-2 py-1">{accumulator.causes}</td>
								)}
								<td className="border px-2 py-1">{accumulator.time}</td>
								<td className="border px-2 py-1">
									<button
										className={buttonClasses}
										onClick={() => { setExpandedAccidents(toggleSet(expandedAccidents, accumulator.id)); }}
									>
										{expandedAccidents.has(accumulator.id) ? "Згорнути" : "Розгорнути"}
									</button>
								</td>
								{accidentCourtDecisions && (
									<td className="border px-2 py-1">
										{accidentCourtDecisions && accidentCourtDecisions.length > 0
											? accidentCourtDecisions.map(cd => cd.decision).join(", ")
											: "-"}
									</td>
								)}
							</tr>

							{expandedAccidents.has(accumulator.id) && accidentPersons.map(p => {
								const personVehicle = vehicles?.find(v => v.personId === p.person.id && accidentVehicle?.some(av => av.accidentId === accumulator.id && av.vehicleId === v.id));
								const personAdministrativeDecisions = administrativeDecisions?.filter(ad => ad.personId === p.person.id && ad.accidentId === accumulator.id);
								const personViolations = violations?.filter(vl => vl.personId === p.person.id && vl.accidentId === accumulator.id);
								const personMedicalReports = medicalReports?.filter(mr => mr.personId === p.person.id && mr.accidentId === accumulator.id);
								const personInsuranceEvaluation = personVehicle ? insuranceEvaluations?.find(ie => ie.vehicleId === personVehicle.id && ie.accidentId === accumulator.id) : undefined;
								const personInsurancePayments = personVehicle ? insurancePayments?.filter(ip => ip.personId === p.person.id && ip.insuranceEvaluationId === personInsuranceEvaluation?.id) : undefined;

								return (
									<tr key={p.person.id} className="bg-gray-50 border">
										<td></td>
										<td className="p-2" colSpan={2}>
											<div>
												<strong>ПІБ:</strong> {p.person.surname} {p.person.name} {p.person.patronymic}<br/>
												{p.person.driverLicense && (
													<>
														<strong>Посвідчення водія:</strong> {p.person.driverLicense.id} ({p.person.driverLicense.categories.join(", ")})<br/>
													</>
												)}
												{p.person.passportDetails && (
													<>
														<strong>Паспортні дані:</strong> {p.person.passportDetails.series} {p.person.passportDetails.id}<br/>
													</>
												)}
												<strong>Роль:</strong> {AccidentRole[p.accidentRole]}<br/>
											</div>

											{(personVehicle || (personInsurancePayments && personInsurancePayments.length > 0) ||
												(personAdministrativeDecisions && personAdministrativeDecisions.length > 0) ||
												(personViolations && personViolations.length > 0) || (personMedicalReports && personMedicalReports.length > 0)) && (
												<button
													className={`${buttonClasses} mt-2`}
													onClick={() => { setExpandedPersons(togglePairSet(expandedPersons, accumulator.id, p.person.id)); }}
												>
													{checkIfPairExists(accumulator.id, p.person.id) ? "Згорнути" : "Розгорнути"}
												</button>
											)}

											{checkIfPairExists(accumulator.id, p.person.id) && (
												<div className="mt-2 border pl-4 pt-2 bg-gray-100 rounded">
													{personVehicle && (
														<div className="mb-2">
															<strong>ТЗ:</strong> {personVehicle.make} {personVehicle.model} ({personVehicle.licensePlate})
															{personInsuranceEvaluation && (
																<div className="mt-2">
																	<strong>Страховий висновок:</strong> {personInsuranceEvaluation.conclusion}
																</div>
															)}
														</div>
													)}

													{personInsurancePayments && personInsurancePayments.length > 0 && (
														<div className="mb-2">
															<strong>Страхові виплати:</strong>
															<ul>{personInsurancePayments.map(ip => <li key={ip.id}>{ip.payment/100} UAH</li>)}</ul>
														</div>
													)}

													{personAdministrativeDecisions && personAdministrativeDecisions.length > 0 && (
														<div className="mb-2">
															<strong>Адміністративні рішення:</strong>
															<ul>{personAdministrativeDecisions.map(ad => <li key={ad.accidentId}>{ad.decision}</li>)}</ul>
														</div>
													)}

													{personViolations && personViolations.length > 0 && (
														<div className="mb-2">
															<strong>Порушення:</strong>
															<ul>{personViolations.map(vl => <li key={vl.id}>{vl.violation}</li>)}</ul>
														</div>
													)}

													{personMedicalReports && personMedicalReports.length > 0 && (
														<div className="mb-2">
															<strong>Медичні вироки:</strong>
															<ul>{personMedicalReports.map(mr => <li key={mr.id}>{mr.report}</li>)}</ul>
														</div>
													)}
												</div>
											)}
										</td>
									</tr>
								);
							})}
						</React.Fragment>
					);
				})}
				</tbody>
			</table>
		</div>
	);
}