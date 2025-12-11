import { useAccidents } from '../api';
import type { ReactElement} from "react";
import { useState } from "react";
import { loadingAnimation } from "../../../common/elements.tsx";
import React from "react";
import { AccidentRole } from "../../many-to-many/types.ts";
import { z } from "zod";
import { AssessmentStatus, ConsiderationStatus } from "../types.ts";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { useRole } from "../../auth/api.ts";
import { ApplicationRole } from "../../auth/types.ts";
import { Popup } from "../../../components/ui/Popup.tsx";
import { PopupField } from "../../../components/ui/PopupField.tsx";
import { useCreateAdministrativeDecision } from "../../administrative-decisions/api.ts";
import { useCreateViolation } from "../../violations/api.ts";
import { useCreateInsuranceEvaluation } from "../../insurance/evaluations/api.ts";
import { useCreateInsurancePayment } from "../../insurance/payments/api.ts";
import { useCreateMedicalReport } from "../../medical-reports/api.ts";
import toast from "react-hot-toast";
import { useCreateCourtDecision } from "../../court-decisions/api.ts";
import { usePoliceIsRegistered } from "../../policeman/api.ts";
import { useMedicIsRegistered } from "../../medic/api.ts";
import { useNavigate } from "@tanstack/react-router";

const accidentSchema = z.object({
	date: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Введіть дату в форматі РРРР-ММ-ДД").or(z.literal('')),
	time: z.string().regex(new RegExp("^\\d{2}:\\d{2}$"), "Введіть час у форматі ГГ:ХХ").or(z.literal('')),
	addressStreet: z.string().min(2, 'Назва вулиці занадто коротка').or(z.literal('')),
	addressNumber: z.string().optional().or(z.number()),
	name: z.string(),
	surname: z.string(),
	patronymic: z.string().min(3, 'По-батькові занадто коротке').or(z.literal(''))
}).refine(
	data => {
		const filled = [data.name, data.surname, data.patronymic].filter(v => v !== '');
		return filled.length === 0 || filled.length === 3;
	},
	{ message: "Введіть ПІБ повністю", path: ["name"]
	});

type PopupKind =
	| null
	| { type: 'ADMINISTRATIVE_DECISION'; accidentId: number; personId: number; decision: string; error: string | null; }
	| { type: 'VIOLATION'; accidentId: number; personId: number; violation: string; error: string | null }
	| { type: 'INSURANCE_EVALUATION'; accidentId: number; vehicleId: number; conclusion: string; error: string | null }
	| { type: 'INSURANCE_PAYMENT'; personId: number; insuranceEvaluationId: number; payment: string; error: string | null }
	| { type: 'MEDICAL_REPORT'; accidentId: number; personId: number; report: string; error: string | null }
	| { type: 'COURT_DECISION'; accidentId: number; decision: string; error: string | null };

export function AccidentsListPage(): ReactElement {
	const [draft, setDraft] = useState({
		date: '',
		time: '',
		addressStreet: '',
		addressNumber: '',
		name: '',
		surname: '',
		patronymic: ''
	});
	const [applied, setApplied] = useState({
		date: undefined,
		time: undefined,
		addressStreet: undefined,
		addressNumber: undefined,
		name: undefined,
		surname: undefined,
		patronymic: undefined,
		pageIndex: 0
	});
	const navigate = useNavigate();
	const [popup, setPopup] = useState<PopupKind>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { data, isLoading, isError, error } = useAccidents(applied);
	const [expandedAccidents, setExpandedAccidents] = useState<Set<number>>(new Set());
	const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());
	const getRole = useRole();
	const createAdministrativeDecision = useCreateAdministrativeDecision();
	const createViolation = useCreateViolation();
	const createInsuranceEvaluation = useCreateInsuranceEvaluation();
	const createInsurancePayment = useCreateInsurancePayment();
	const createMedicalReport = useCreateMedicalReport();
	const createCourtDecision = useCreateCourtDecision();

	const setDraftField = (field: string, value: string): void => {
		if (value === '') setDraft(previous => ({ ...previous, [field]: undefined }));
		setDraft(previous => ({ ...previous, [field]: value }));
		}

	const applyFilters = (): void =>
		{
			const prepared = {
				date: draft.date,
				time: draft.time,
				addressStreet: draft.addressStreet,
				addressNumber: draft.addressNumber === '' ? undefined : Number(draft.addressNumber),
				name: draft.name,
				surname: draft.surname,
				patronymic: draft.patronymic
			};

			const result = accidentSchema.safeParse(prepared);

			if (!result.success) {
				const flat = result.error.flatten().fieldErrors;
				const mapped = Object.fromEntries(
					Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? 'Invalid'])
				);
				setErrors(mapped);
				return;
			}

			const cleaned = Object.entries(draft)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.filter(([_, v]) => v !== '' && v !== undefined)
			.reduce((accumulator, [k, v]) => {
				accumulator[k] = v;
				return accumulator;
			}, {} as Record<string, unknown>);

			// eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-plus-operands
			if (cleaned["time"] !== undefined) cleaned["time"] = cleaned["time"] + ":00";

			setErrors({});
			// @ts-expect-error Always has the necessary properties
			setApplied({
				...cleaned,
				pageIndex: 0
			});
		};

	const nextPage = (): void =>
		{ setApplied(previous => ({ ...previous, pageIndex: previous.pageIndex + 1 })); };

	const previousPage = (): void =>
		{ setApplied(previous => ({ ...previous, pageIndex: Math.max(0, previous.pageIndex - 1) })); };
    
	if (isLoading || getRole.isLoading) return loadingAnimation();
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
			<h1 className="text-red-600 text-2xl font-bold flex justify-center">ПОМИЛКА ПОШУКУ ДАНИХ</h1>
		);
	}

	const formatDate = (date: string): string => {
		const [year, month, day] = date.split("-");
		// @ts-expect-error Always defined
		return `${day}.${month}.${year.slice(-2)}`;
	};

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

	// @ts-expect-error Always defined
	const userRole = getRole.data["role"];

	const MedicLinkAccount = (): ReactElement | null => {
		const { data } = useMedicIsRegistered();
		return !data?.isRegistered ? (
			<RoundedButton
				variant="blue"
				onClick={async () => {
					await navigate({ to: "/register/medic" });
				}}
			>
				Прив'язати акаунт
			</RoundedButton>
		) : null;
	}

	const PoliceLinkAccount = (): ReactElement | null => {
		const { data } = usePoliceIsRegistered();
		return !data?.isRegistered ? (
			<RoundedButton
				className="w-full"
				variant="blue"
				onClick={async () => {
					await navigate({ to: "/register/police" });
				}}
			>
				Прив'язати акаунт
			</RoundedButton>
		) : null;
	}

	const updatePopup = <K extends keyof typeof popup>(
		key: K,
		value: typeof popup[K]
	): void => {
		if (!popup) return;
		setPopup({ ...popup, [key]: value });
	};

	const submitHandlers = {
		ADMINISTRATIVE_DECISION: (p: Extract<PopupKind, { type: 'ADMINISTRATIVE_DECISION' }>): void =>
			{ createAdministrativeDecision.mutate({ id: 0, accidentId: p.accidentId, personId: p.personId, decision: p.decision.trim() },
				{ onSuccess: () => {
						setPopup(null);
						toast.success("Успішно створено");
					},
					onError: () => {
						toast.error("Виникла помилка. Прив'яжіть ваші дані до акаунту", { duration: 3000 });
					} }); },
		VIOLATION: (p: Extract<PopupKind, { type: 'VIOLATION' }>) =>
			{ createViolation.mutate({ id: 0, accidentId: p.accidentId, personId: p.personId, violation: p.violation.trim() },
				{ onSuccess: () => {
						setPopup(null);
						toast.success("Успішно створено");
					},
					onError: () => {
						toast.error("Виникла помилка");
					}}); },
		INSURANCE_EVALUATION: (p: Extract<PopupKind, { type: 'INSURANCE_EVALUATION' }>) =>
			{ createInsuranceEvaluation.mutate(
				{
					id: 0,
					accidentId: p.accidentId,
					vehicleId: p.vehicleId,
					conclusion: p.conclusion.trim(),
				},
				{ onSuccess: () => {
					setPopup(null);
					toast.success("Успішно створено");
					},
					onError: () => {
						toast.error("Виникла помилка");
					}}
			); },
		INSURANCE_PAYMENT: (p: Extract<PopupKind, { type: 'INSURANCE_PAYMENT' }>) =>
			{ createInsurancePayment.mutate({ id: 0, personId: p.personId, insuranceEvaluationId: p.insuranceEvaluationId, payment: Math.round(parseFloat(p.payment) * 100) },
				{ onSuccess: () => {
						setPopup(null);
						toast.success("Успішно створено");
					},
				onError: () => {
					toast.error("Неможливо видати виплату: у цього водія більше двох ДТП за цей місяць", { duration: 4000 });
				}}); },
		MEDICAL_REPORT: (p: Extract<PopupKind, { type: 'MEDICAL_REPORT' }>) =>
			{ createMedicalReport.mutate({ id: 0, accidentId: p.accidentId, personId: p.personId, report: p.report.trim() },
				{ onSuccess: () => {
						setPopup(null);
						toast.success("Успішно створено");
					},
					onError: () => {
						toast.error("Виникла помилка. Прив'яжіть ваші дані до акаунту", { duration: 3000 });
					} }); },
		COURT_DECISION: (p: Extract<PopupKind, { type: 'COURT_DECISION' }>) =>
		{ createCourtDecision.mutate({ accidentId: p.accidentId, decision: p.decision.trim() },
			{ onSuccess: () => {
					setPopup(null);
					toast.success("Успішно створено");
				},
				onError: () => {
					toast.error("Виникла помилка");
				}}); },
	} as const;

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">ДТП</h1>
			<>
				<Popup
					error={popup?.error ?? null}
					open={!!popup}
					onCancel={() => { setPopup(null); }}
					onSubmit={() => {
						if (!popup) return;

						const keyMap = {
							ADMINISTRATIVE_DECISION: 'decision',
							VIOLATION: 'violation',
							INSURANCE_EVALUATION: 'conclusion',
							INSURANCE_PAYMENT: 'payment',
							MEDICAL_REPORT: 'report',
							COURT_DECISION: 'decision'
						} as const;

						const field = keyMap[popup.type];
						
						 
						// @ts-expect-error Everything is fine... 
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						const value = popup[field];

						// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
						if (!value || value.trim() === '') {
							// @ts-expect-error I'm tired of all these ts errors, to be honest
							updatePopup('error', 'Поле не може бути порожнім');
							return;
						}
						// @ts-expect-error And another one
						submitHandlers[popup.type](popup); }}
				>
					{popup?.type === 'ADMINISTRATIVE_DECISION' && (
						<PopupField label="Рішення">
							<input
								className="border p-2 rounded w-full"
								value={popup.decision}
								onChange={event_ => { // @ts-expect-error I hate typescript
									updatePopup('decision', event_.target.value); }}
							/>
						</PopupField>
					)}
					{popup?.type === 'VIOLATION' && (
						<PopupField label="Порушення">
							<input
								className="border p-2 rounded w-full"
								value={popup.violation}
								onChange={event_ => { // @ts-expect-error I hate typescript
									updatePopup('violation', event_.target.value); }}
							/>
						</PopupField>
					)}
					{popup?.type === 'INSURANCE_EVALUATION' && (
						<PopupField label="Оцінка">
							<input
								className="border p-2 rounded w-full"
								value={popup.conclusion}
								onChange={event_ => { // @ts-expect-error I hate typescript
									updatePopup('conclusion', event_.target.value); }}
							/>
						</PopupField>
					)}
					{popup?.type === 'INSURANCE_PAYMENT' && (
						<PopupField label="Виплата (у форматі 12.34)">
							<input
								className="border p-2 rounded w-full"
								value={popup.payment}
								onChange={event_ => { // @ts-expect-error I hate typescript
									updatePopup('payment', event_.target.value); }}
							/>
						</PopupField>
					)}
					{popup?.type === 'MEDICAL_REPORT' && (
					<PopupField label="Висновок">
						<input
							className="border p-2 rounded w-full"
							value={popup.report}
							onChange={event_ => { // @ts-expect-error I hate typescript
								updatePopup('report', event_.target.value); }}
						/>
					</PopupField>
					)}
					{popup?.type === 'COURT_DECISION' && (
						<PopupField label="Рішення">
							<input
								className="border p-2 rounded w-full"
								value={popup.decision}
								onChange={event_ => { // @ts-expect-error I hate typescript
									updatePopup('decision', event_.target.value); }}
							/>
						</PopupField>
					)}
				</Popup>
			</>
			<div className="grid grid-cols-4 gap-4 mb-4">
				<div className="flex flex-col">
					<input
						className="border p-2 rounded"
						type="date"
						value={draft.date}
						onChange={(event_) => {
						setDraftField("date", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["date"]}</p>
				</div>
				<div className="flex flex-col">
					<input
						className="border p-2 rounded"
						type="time"
						value={draft.time}
						onChange={(event_) => {
							setDraftField("time", event_.target.value);
						}}
					/>
				<p className="text-red-600 text-sm h-2">{errors["time"]}</p>
				</div>
				<div className="flex flex-col">
				<input
					className="border p-2 rounded"
					placeholder="Вулиця"
					value={draft.addressStreet}
					onChange={(event_) => {
						setDraftField("addressStreet", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["addressStreet"]}</p>
				</div>
				<div className="flex flex-col">
				<input
					className="border p-2 rounded"
					placeholder="Будинок"
					value={draft.addressNumber}
					onChange={(event_) => {
						setDraftField("addressNumber", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["addressNumber"]}</p>
				</div>
				<div className="flex flex-col">
				<input
					className="border p-2 rounded"
					placeholder="Імʼя"
					value={draft.name}
					onChange={(event_) => {
						setDraftField("name", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["name"]}</p>
				</div>
				<div className="flex flex-col">
				<input
					className="border p-2 rounded"
					placeholder="Прізвище"
					value={draft.surname}
					onChange={(event_) => {
						setDraftField("surname", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["surname"]}</p>
				</div>
				<div className="flex flex-col">
				<input
					className="border p-2 rounded"
					placeholder="По-батькові"
					value={draft.patronymic}
					onChange={(event_) => {
						setDraftField("patronymic", event_.target.value);
					}}
				/>
				<p className="text-red-600 text-sm h-2">{errors["patronymic"]}</p>
				</div>
			</div>

			<div className="flex justify-between items-start">
				<div>
					<RoundedButton variant='blue' onClick={applyFilters}>
						Пошук
					</RoundedButton>

					<div className="flex gap-4 mb-4 mt-4 items-center">
						<RoundedButton onClick={previousPage}>
							&lt;
						</RoundedButton>

						<span>Сторінка {applied.pageIndex + 1}</span>

						<RoundedButton onClick={nextPage}>
							&gt;
						</RoundedButton>
					</div>
				</div>
				{userRole === ApplicationRole.MEDIC && <MedicLinkAccount />}
				{userRole === ApplicationRole.POLICE && (
					<div className="flex flex-col gap-4 items-center">
						<PoliceLinkAccount />
						<RoundedButton
							className="w-full"
							variant="blue"
							onClick={async () => {
								await navigate({ to: "/accidents/new" });
							}}
						>
							Зареєструвати ДТП
						</RoundedButton>
					</div>)}
			</div>

			<table className="w-full table-auto border border-gray-300 rounded-lg overflow-hidden shadow-sm">
				<thead className="border-b border-gray-300">
				<tr className="bg-gray-200 text-left uppercase text-sm font-semibold text-gray-700 divide-x divide-gray-300">
					<th className="px-4 py-2">Дата</th>
					{accidents.some((a) => a.type) &&
						<th className="px-4 py-2">Тип</th>}
					<th className="px-4 py-2">Адреса</th>
					{accidents.some((a) => a.causes) &&
						<th className="px-4 py-2">Причини</th>}
					<th className="px-4 py-2">Час</th>
					{accidents.some((a) => a.media) &&
						<th className="px-4 py-2">Медіа</th>}
					{accidents.some((a) => a.considerationStatus) &&
						<th className="px-4 py-2">Статус розгляду</th>}
					{accidents.some((a) => a.assessmentStatus) &&
						<th className="px-4 py-2">Статус оцінки</th>}
					<th className="px-4 py-2">Персони</th>
					{accidents.some((a) => courtDecisions?.some((cd) => cd.accidentId === a.id)) &&
						<th className="px-4 py-2">Судові рішення</th>}
				</tr>
				</thead>
				<tbody className="divide-y  divide-x divide-gray-300">
				{accidents.map((accumulator) => {
					const accidentPersons = persons.filter((p) => p.accidentId === accumulator.id);
					const sortedAccidentPersons = accidentPersons.slice().sort((a, b) => {
						if (a.accidentRole === 'CULPRIT') return -1;
						if (b.accidentRole === 'CULPRIT') return 1;
						return 0;
					});
					const accidentCourtDecisions = courtDecisions?.filter((cd) => cd.accidentId === accumulator.id);
					return (
					<React.Fragment key={accumulator.id}>
						<tr className="border-b hover:bg-gray-50 divide-x divide-gray-300">
							<td className="px-4 py-2">{formatDate(accumulator.date)}</td>
							{accumulator.type && <td className="px-4 py-2">{accumulator.type}</td>}
							<td className="px-4 py-2">{accumulator.addressStreet}, {accumulator.addressNumber}</td>
							{accumulator.causes && <td className="px-4 py-2">{accumulator.causes}</td>}
							<td className="px-4 py-2">{accumulator.time.substring(0, 5)}</td>
							{accumulator.media && <td className="px-4 py-2 space-y-2">
								{accumulator.media.photos && (
									<div>
										<div className="font-medium">Фото:</div>
										{accumulator.media.photos.map((v, index) => <div key={index}>{v}</div>)}
									</div>
								)}
								{accumulator.media.videos && (
									<div>
										<div className="font-medium">Відео:</div>
										{accumulator.media.videos.map((v, index) => <div key={index}>{v}</div>)}
									</div>
								)}
							</td>}
							{accumulator.considerationStatus && <td className="px-4 py-2">{ConsiderationStatus[accumulator.considerationStatus]}</td>}
							{accumulator.assessmentStatus && <td className="px-4 py-2">{AssessmentStatus[accumulator.assessmentStatus]}</td>}
							<td className="px-4 py-2 text-center">
								<RoundedButton onClick={() => { setExpandedAccidents(toggleSet(expandedAccidents, accumulator.id)); }}>
									{expandedAccidents.has(accumulator.id) ? "Згорнути" : "Розгорнути"}
								</RoundedButton>
							</td>
							{accidentCourtDecisions && (
								<td className="px-4 py-2">{accidentCourtDecisions.length > 0 ? accidentCourtDecisions.map((cd) =>
									cd.decision).join(", ") : userRole === ApplicationRole.COURT && accumulator.considerationStatus === 'SENT' ? <RoundedButton
									variant="blue"
									onClick={() =>
									{ setPopup({ type: 'COURT_DECISION', accidentId: accumulator.id, decision: '', error: null }) }}
								>Створити</RoundedButton> : '-'}</td>
							)}
						</tr>

						{expandedAccidents.has(accumulator.id) &&
							sortedAccidentPersons.map((p) => {
								const personVehicle = vehicles?.find((v) =>
									v.personId === p.person.id &&
									accidentVehicle?.some((av) => av.accidentId === accumulator.id && av.vehicleId === v.id)
								);
								const personAdministrativeDecision = administrativeDecisions?.find((ad) =>
									ad.personId === p.person.id && ad.accidentId === accumulator.id
								);
								const personViolations = violations?.filter((vl) =>
									vl.personId === p.person.id && vl.accidentId === accumulator.id
								);
								const personMedicalReports = medicalReports?.filter((mr) =>
									mr.personId === p.person.id && mr.accidentId === accumulator.id
								);
								const personInsuranceEvaluation = personVehicle
									? insuranceEvaluations?.find((ie) =>
										ie.vehicleId === personVehicle.id && ie.accidentId === accumulator.id
									)
									: undefined;
								const personInsurancePayment = personInsuranceEvaluation
									? insurancePayments?.find((ip) =>
										ip.personId === p.person.id && ip.insuranceEvaluationId === personInsuranceEvaluation.id
									)
									: undefined;

								return (
									<tr key={p.person.id} className="bg-gray-50 hover:bg-gray-100">
										<td></td>
										<td className="px-4 py-2" colSpan={3}>
											<div className="flex justify-between">
												<div className="space-y-1">
													<div><strong>ПІБ:</strong> {p.person.surname} {p.person.name} {p.person.patronymic}</div>
													{p.person.driverLicense && (
														<div><strong>Посвідчення водія:</strong> {p.person.driverLicense.id} ({p.person.driverLicense.categories.join(", ")})</div>
													)}
													{p.person.passportDetails && (
														<div><strong>Паспортні дані:</strong> {p.person.passportDetails.series} {p.person.passportDetails.id}</div>
													)}
													<div><strong>Роль:</strong> {AccidentRole[p.accidentRole]}</div>
												</div>

												<div className="flex flex-col space-y-2">
													{!((userRole === ApplicationRole.COURT) ||
														(userRole === ApplicationRole.INSURANCE && (personVehicle === undefined || (
															personInsuranceEvaluation !== undefined && personInsurancePayment !== undefined)))) && (
														<strong className="self-center">Створити</strong>
													)}
													{userRole === ApplicationRole.POLICE && (
														<div className="flex flex-col space-y-2">
															{p.accidentRole === 'CULPRIT' && personAdministrativeDecision === undefined && (
																<RoundedButton
																	variant="blue"
																	onClick={() => {
																		setPopup({ type: 'ADMINISTRATIVE_DECISION', accidentId: accumulator.id, personId: p.person.id, decision: '', error: null });
																	}}
																>Адмін. рішення</RoundedButton>
															)}
															<RoundedButton
																variant="blue"
																onClick={() => {
																	setPopup({ type: 'VIOLATION', accidentId: accumulator.id, personId: p.person.id, violation: '', error: null });
																}}
															>Порушення</RoundedButton>
														</div>
														)}
													{userRole === ApplicationRole.INSURANCE && (
														<div className="flex flex-col space-y-2">
															{personInsuranceEvaluation === undefined && personVehicle !== undefined && (
																<RoundedButton
																	variant="blue"
																	onClick={() => {
																		setPopup({ type: 'INSURANCE_EVALUATION', accidentId: accumulator.id, vehicleId: personVehicle.id, conclusion: '', error: null });
																	}}
																>Страх. оцінку</RoundedButton>
															)}
															{personInsuranceEvaluation !== undefined && personInsurancePayment === undefined && (
																<RoundedButton
																	variant="blue"
																	onClick={() => {
																		setPopup({ type: 'INSURANCE_PAYMENT', insuranceEvaluationId: personInsuranceEvaluation.id, personId: p.person.id, payment: '', error: null });
																	}}
																>Страх. виплату</RoundedButton>
															)}
														</div>
													)}
													{userRole === ApplicationRole.MEDIC && (
														<RoundedButton
															variant="blue"
															onClick={() => {
																setPopup({ type: 'MEDICAL_REPORT', accidentId: accumulator.id, personId: p.person.id, report: '', error: createMedicalReport.isError ? "Виникла помилка" : null });
															}}
														>Мед. вирок</RoundedButton>
													)}
												</div>
											</div>

											{(personVehicle ||
												personInsurancePayment ||
												personAdministrativeDecision ||
												(personViolations?.length ?? 0) > 0 ||
												(personMedicalReports?.length ?? 0) > 0) && (
												<RoundedButton className="mt-2" onClick={() => { setExpandedPersons(togglePairSet(expandedPersons, accumulator.id, p.person.id)); }}>
													{checkIfPairExists(accumulator.id, p.person.id) ? "Згорнути" : "Розгорнути"}
												</RoundedButton>
											)}

											{checkIfPairExists(accumulator.id, p.person.id) && (
												<div className="mt-2 border-l-4 border-gray-300 pl-4 pt-2 pb-2 bg-gray-100 rounded space-y-2">
													{personVehicle &&
														<div>
															<strong>ТЗ: </strong>
															{personVehicle.make} {personVehicle.model} ({personVehicle.licensePlate})
															{personInsuranceEvaluation &&
																<div className="mt-1">
																	<strong>Страховий висновок: </strong>
																	{personInsuranceEvaluation.conclusion}
																</div>
															}
														</div>
													}
													{personInsurancePayment &&
														<div>
															<strong>Страхова виплата: </strong>
															{personInsurancePayment.payment / 100 + " UAH"}
														</div>
													}
													{personAdministrativeDecision &&
														<div>
															<strong>Адміністративне рішення: </strong>
															{personAdministrativeDecision.decision}
														</div>
													}
													{personViolations && personViolations.length > 0 &&
														<div>
															<strong>Порушення: </strong>
															<ul className="list-disc list-inside">{personViolations.map((vl) =>
																<li key={vl.id}>{vl.violation}</li>)}
															</ul>
														</div>
													}
													{personMedicalReports && personMedicalReports.length > 0 &&
														<div>
															<strong>Медичні вироки: </strong>
															<ul className="list-disc list-inside">
																{personMedicalReports.map((mr) =>
																	<li key={mr.id}>{mr.report}</li>)}
															</ul>
														</div>
													}
												</div>
											)}
										</td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
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