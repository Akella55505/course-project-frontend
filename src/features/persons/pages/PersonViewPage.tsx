import { usePersonData } from "../api";
import type { ReactElement } from "react";
import { useState } from "react";
import { loadingAnimation } from "../../../common/elements.tsx";
import { useParams } from "@tanstack/react-router";
import type { Accident} from "../../accidents/types.ts";
import { AssessmentStatus, ConsiderationStatus } from "../../accidents/types.ts";
import type { Person } from "../types.ts";
import type { Vehicle } from "../../vehicles/types.ts";
import type { AccidentVehicle } from "../../many-to-many/types.ts";
import type { Violation } from "../../violations/types.ts";
import type { AdministrativeDecision } from "../../administrative-decisions/types.ts";
import type { CourtDecision } from "../../court-decisions/types.ts";
import type { InsurancePayment } from "../../insurance/payments/types.ts";
import type { InsuranceEvaluation } from "../../insurance/evaluations/types.ts";

export function PersonViewPage(): ReactElement {
	const { personId } = useParams({ from: '/persons/$personId' });
	const { data, isLoading, isError } = usePersonData(personId);

	const [tab, setTab] = useState<"person" | "accidents" | "vehicles">("person");

	if (isLoading) return loadingAnimation();

	const dataFetchError = (): ReactElement => {
		return (
			<div className="flex justify-center max-w-lg mx-auto bg-gray-50 p-8">
				<div className="flex flex-col items-center gap-6 bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
					<h1 className="text-red-600 text-2xl font-semibold">
						ПОМИЛКА ДОСТУПУ ДО ДАНИХ
					</h1>
				</div>
			</div>
		);
	};

	if (!data || isError) return dataFetchError();

	const {
		person,
		accidentData,
		vehicleData,
		accidentVehicleData,
		violationData,
		administrativeDecisionData,
		courtDecisionData,
		insuranceEvaluationData,
		insurancePaymentData,
	} = data;

	if (!accidentData || !person) return dataFetchError();

	function PersonInfoBlock({ person }: {person: Person}): ReactElement {
		return (
			<div className="space-y-4 bg-white p-6 rounded-xl shadow">
				<div className="text-xl font-bold">
					{person.surname} {person.name} {person.patronymic}
				</div>

				<div>Паспортні дані: {person.passportDetails.series} {person.passportDetails.id}</div>

				<div>Посвідчення водія: {person.driverLicense.id}</div>
				<div>Водійські категорії: {person.driverLicense.categories.join(", ")}</div>

				<div>Email: {person.email || "—"}</div>
			</div>
		);
	}

	function VehiclesBlock({ vehicles }: {vehicles: Array<Vehicle> | undefined}): ReactElement {
		if (!vehicles) return (
			<h1 className="text-gray-800 text-2xl font-semibold">
				НЕМАЄ ДАНИХ
			</h1>
		);
		return (
			<div className="space-y-4">
				{vehicles.length === 0 && <div>—</div>}
				{vehicles.map(v => (
					<div key={v.id} className="space-y-4 bg-white p-6 rounded-xl shadow">
						<div className="text-xl font-bold">{v.make} {v.model}</div>
						<div>VIN: {v.vin}</div>
						<div>Номер: {v.licensePlate}</div>
					</div>
				))}
			</div>
		);
	}


	function AccidentsBlock({
														accidents,
														vehicles,
														accidentVehicle,
														violations,
														administrativeDecisions,
														courtDecisions,
														insuranceEvaluations,
														insurancePayments
													}: {accidents: Array<Accident>, vehicles: Array<Vehicle> | undefined, accidentVehicle: Array<AccidentVehicle> | undefined,
														violations: Array<Violation> | undefined, administrativeDecisions: Array<AdministrativeDecision> | undefined,
														courtDecisions: Array<CourtDecision> | undefined, insuranceEvaluations: Array<InsuranceEvaluation> | undefined,
														insurancePayments: Array<InsurancePayment> | undefined}): ReactElement {
		return (
			<div className="space-y-6">
				{accidents.map(a => {
					const userAccidentVehicle =
						accidentVehicle
							?.filter(av => av.accidentId === a.id)
							.map(av => vehicles?.find(v => v.id === av.vehicleId));

					const userAdministrativeDecisions = administrativeDecisions?.filter(x => x.accidentId === a.id);
					const userInsuranceEvaluation = insuranceEvaluations?.find(x => x.accidentId === a.id);
					const userInsurancePayment = userInsuranceEvaluation
						? insurancePayments?.find(x => x.insuranceEvaluationId === userInsuranceEvaluation.id)
						: undefined;
					const userCourtDecision = courtDecisions?.find(x => x.accidentId === a.id);
					const userViolations = violations?.filter(x => x.accidentId === a.id);

					return (
						<div key={a.id} className="border border-gray-200 rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition-shadow">
							<div className="grid grid-cols-2 gap-6 mb-6 text-gray-700 border-b border-gray-200 pb-4">
								<div className="space-y-2">
									<div className="font-semibold text-gray-900">Дата</div>
									<div>{a.date}</div>
								</div>
								<div className="space-y-2">
									<div className="font-semibold text-gray-900">Час</div>
									<div>{a.time.substring(0, 5)}</div>
								</div>
								<div className="space-y-2">
									<div className="font-semibold text-gray-900">Адреса</div>
									<div> {a.addressStreet}, {a.addressNumber} </div>
								</div>
								<div className="space-y-2">
									<div className="font-semibold text-gray-900">Статуси</div>
									<div> Розгляд: {ConsiderationStatus[a.considerationStatus]} </div>
									<div>Оцінка: {AssessmentStatus[a.assessmentStatus]}</div>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-6 text-gray-700 text-sm">
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Транспортний засіб </div> {!userAccidentVehicle?.length &&
									<div>—</div>} {userAccidentVehicle?.map((v) => (
									<div key={v?.id} className="mb-1"> {v?.make} {v?.model} • {v?.licensePlate} </div> ))} </div>
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Порушення </div> {!userViolations?.length &&
									<div>—</div>} {userViolations?.map((v) => (
									<div key={v.id} className="mb-1"> {v.violation} </div> ))} </div>
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Адміністративне рішення </div> {!userAdministrativeDecisions?.length &&
									<div>—</div>} {userAdministrativeDecisions?.map((x) => (
									<div key={x.id} className="mb-1"> {x.decision} </div> ))} </div>
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Страхова оцінка </div>
									<div>{userInsuranceEvaluation?.conclusion || "—"}</div>
								</div>
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Страхові виплати </div> {!userInsurancePayment &&
									<div>—</div>} {userInsurancePayment && (
									<> {userInsurancePayment.payment / 100 + " UAH"}
									</> ) } </div>
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900"> Судові рішення </div>
									<div>{userCourtDecision?.decision || "—"}</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="mb-6 border-b">
				<div className="flex gap-1">

					<button
						className={
							"px-4 py-2 text-sm hover:cursor-pointer " +
							(tab === "person"
								? "border-b-2 border-gray-900 font-semibold text-gray-900"
								: "text-gray-500 hover:text-gray-700")
						}
						onClick={() => { setTab("person"); }}
					>
						Персона
					</button>

					<button
						className={
							"px-4 py-2 text-sm hover:cursor-pointer " +
							(tab === "accidents"
								? "border-b-2 border-gray-900 font-semibold text-gray-900"
								: "text-gray-500 hover:text-gray-700")
						}
						onClick={() => { setTab("accidents"); }}
					>
						ДТП
					</button>

					<button
						className={
							"px-4 py-2 text-sm hover:cursor-pointer " +
							(tab === "vehicles"
								? "border-b-2 border-gray-900 font-semibold text-gray-900"
								: "text-gray-500 hover:text-gray-700")
						}
						onClick={() => { setTab("vehicles"); }}
					>
						Транспорт
					</button>

				</div>
			</div>


			{tab === "person" && (
				<PersonInfoBlock person={person} />
			)}

			{tab === "accidents" && (
				<AccidentsBlock
					accidentVehicle={accidentVehicleData}
					accidents={accidentData}
					administrativeDecisions={administrativeDecisionData}
					courtDecisions={courtDecisionData}
					insuranceEvaluations={insuranceEvaluationData}
					insurancePayments={insurancePaymentData}
					vehicles={vehicleData}
					violations={violationData}
				/>
			)}

			{tab === "vehicles" && (
				<VehiclesBlock vehicles={vehicleData} />
			)}
		</div>
	);
}
