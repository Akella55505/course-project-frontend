import { useUserData } from "../api";
import type { ReactElement} from "react";
import { useEffect } from "react";
import { useState } from "react";
import { loadingAnimation } from "../../../common/elements.tsx";
import {
	AssessmentStatus,
	ConsiderationStatus,
} from "../../accidents/types.ts";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { usePersonEmail } from "../../persons/api.ts";
import { useNavigate } from "@tanstack/react-router";

export function UserListPage(): ReactElement {
	const { data, isLoading, isError, error } = useUserData();
	const setPersonEmail = usePersonEmail();
	const navigate = useNavigate();

	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ id: "", series: "" });

	if (isLoading) return loadingAnimation();
	if (isError)
		return (
			<div className="flex items-center justify-center h-screen text-4xl font-bold text-red-600">
				Error loading accidents: {error.message}
			</div>
		);

	const submit = (): void => {
		setPersonEmail.mutate(form, {
			onSuccess: () => { setOpen(false); },
		});
	};

	const update = (k: "id" | "series", v: string): void =>
	{ setForm({ ...form, [k]: v }); };

	const LockScroll = (): null => {
		useEffect(() => {
			document.body.style.overflow = "hidden";
			return (): void => { document.body.style.overflow = ""; };
		}, []);
		return null;
	};

	const popup =
		open && (
			<>
			<LockScroll />
			<div className="z-50 fixed inset-0 bg-black/50 flex items-center justify-center">
				<div className="bg-white p-6 rounded-lg shadow-md w-80 space-y-4">
					<div className="space-y-1">
						<label className="font-semibold">ID</label>
						<input
							className="border p-2 rounded w-full"
							placeholder="ID"
							value={form.id}
							onChange={(event_) => { update("id", event_.target.value); }}
						/>
					</div>

					<div className="space-y-1">
						<label className="font-semibold">Серія</label>
						<input
							className="border p-2 rounded w-full"
							placeholder="Серія"
							value={form.series}
							onChange={(event_) => { update("series", event_.target.value); }}
						/>
					</div>

					{setPersonEmail.isError && (
						<div className="text-red-600 text-sm">
							Персони немає в базі
						</div>
					)}

					<div className="flex justify-end space-x-2">
						<RoundedButton
							variant='red'
							onClick={() => { setOpen(false); }}
						>
							Скасувати
						</RoundedButton>
						<RoundedButton
							variant='blue'
							onClick={submit}
						>
							Підтвердити
						</RoundedButton>
					</div>
				</div>
			</div>
			</>
		);

	const dataFetchError = (): ReactElement => {
		return (
			<div className="min-h-screen flex items-center justify-center relative">
				{popup}

				<div className="flex flex-col items-center gap-6">
					<h1 className="text-gray-500 text-2xl font-bold text-center">
						НЕМАЄ ДАНИХ. СПРОБУЙТЕ ПРИВ'ЯЗАТИ АКАУНТ.
					</h1>

					<RoundedButton variant="blue" onClick={() => { setOpen(true); }}>
						Прив'язати акаунт
					</RoundedButton>
				</div>
			</div>
		);
	};


	if (!data) return dataFetchError();

	const {
		accidentData: accidents,
		vehicleData: vehicles,
		insuranceEvaluationData: insuranceEvaluations,
		insurancePaymentData: insurancePayments,
		administrativeDecisionData: administrativeDecisions,
		violationData: violations,
		courtDecisionData: courtDecisions,
		accidentVehicleData: accidentVehicle,
	} = data;

	if (!accidents) return dataFetchError();

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">ДТП</h1>
				<RoundedButton
					onClick={async () => {
						await navigate({ to: "/user/form" });
					}}
				>
					Повідомити про ДТП
				</RoundedButton>
			</div>

			<div className="space-y-6">
				{accidents.map((a) => {
					const userAccidentVehicle = vehicles
						? accidentVehicle
								?.filter((av) => av.accidentId === a.id)
								.map((av) => vehicles.find((v) => v.id === av.vehicleId))
						: undefined;

					const userAdministrativeDecisions = administrativeDecisions?.filter(
						(x) => x.accidentId === a.id
					);
					const userInsuranceEvaluation = insuranceEvaluations?.find(
						(x) => x.accidentId === a.id
					);
					const userInsurancePayments = userInsuranceEvaluation
						? insurancePayments?.filter(
								(x) => x.insuranceEvaluationId === userInsuranceEvaluation.id
							)
						: undefined;
					const userCourtDecision = courtDecisions?.find(
						(x) => x.accidentId === a.id
					);
					const userViolations = violations?.filter(
						(x) => x.accidentId === a.id
					);

					return (
						<div
							key={a.id}
							className="border border-gray-200 rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition-shadow"
						>
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
									<div>
										{a.addressStreet}, {a.addressNumber}
									</div>
								</div>

								<div className="space-y-2">
									<div className="font-semibold text-gray-900">Статуси</div>
									<div>
										Розгляд: {ConsiderationStatus[a.considerationStatus]}
									</div>
									<div>Оцінка: {AssessmentStatus[a.assessmentStatus]}</div>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-6 text-gray-700 text-sm">
								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Транспортний засіб
									</div>
									{!userAccidentVehicle?.length && <div>—</div>}
									{userAccidentVehicle?.map((v) => (
										<div key={v?.id} className="mb-1">
											{v?.make} {v?.model} • {v?.licensePlate}
										</div>
									))}
								</div>

								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Порушення
									</div>
									{!userViolations?.length && <div>—</div>}
									{userViolations?.map((v) => (
										<div key={v.id} className="mb-1">
											{v.violation}
										</div>
									))}
								</div>

								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Адміністративне рішення
									</div>
									{!userAdministrativeDecisions?.length && <div>—</div>}
									{userAdministrativeDecisions?.map((x) => (
										<div key={x.id} className="mb-1">
											{x.decision}
										</div>
									))}
								</div>

								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Страхова оцінка
									</div>
									<div>{userInsuranceEvaluation?.conclusion || "—"}</div>
								</div>

								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Страхові виплати
									</div>
									{!userInsurancePayments?.length && <div>—</div>}
									{userInsurancePayments?.map((x) => (
										<div key={x.id} className="mb-1">
											{x.payment}
										</div>
									))}
								</div>

								<div className="space-y-2 border-b border-gray-100 pb-4">
									<div className="font-semibold mb-2 text-gray-900">
										Судові рішення
									</div>
									<div>{userCourtDecision?.decision || "—"}</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
