import type { ReactElement} from "react";
import { useState } from "react";
import { useReport } from "../api.ts";
import { z } from "zod";
import { loadingAnimation } from "../../../common/elements.tsx";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { Daytime } from "../types.ts";

const reportSchema = z.object({
	startDate: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Введіть дату в форматі РРРР-ММ-ДД").or(z.literal('')),
	endDate: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Введіть дату в форматі РРРР-ММ-ДД").or(z.literal('')),
	startTime: z.string().regex(new RegExp("^\\d{2}:\\d{2}$"), "Введіть час у форматі ГГ:ХХ").or(z.literal('')),
	endTime: z.string().regex(new RegExp("^\\d{2}:\\d{2}$"), "Введіть час у форматі ГГ:ХХ").or(z.literal('')),
	addressStreet: z.string().min(2, 'Назва вулиці занадто коротка').or(z.literal('')),
	addressNumber: z.string().optional().or(z.number()),
	type: z.string().min(4, 'Тип занадто короткий').or(z.literal('')),
});

export function AccidentsReportPage(): ReactElement {
	const [draft, setDraft] = useState({
		startDate: '',
		endDate: '',
		startTime: '',
		endTime: '',
		addressStreet: '',
		addressNumber: '',
		type: ''
	});
	const [applied, setApplied] = useState({
		startDate: undefined,
		endDate: undefined,
		startTime: undefined,
		endTime: undefined,
		addressStreet: undefined,
		addressNumber: undefined,
		type: undefined,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const report = useReport(applied);

	if (report.isLoading) return loadingAnimation();

	const reportData = report.data;
	const dataIsPresent = !(reportData === undefined || report.data?.reportCount === null);

	const setDraftField = (field: string, value: string): void => {
		if (value === '') setDraft(previous => ({ ...previous, [field]: undefined }));
		setDraft(previous => ({ ...previous, [field]: value }));
	}

	const applyFilters = (): void =>
	{
		const prepared = {
			startDate: draft.startDate,
			endDate: draft.endDate,
			startTime: draft.startTime,
			endTime: draft.endTime,
			addressStreet: draft.addressStreet,
			addressNumber: draft.addressNumber === '' ? undefined : Number(draft.addressNumber) ,
			type: draft.type
		};

		const result = reportSchema.safeParse(prepared);

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
		if (cleaned["startTime"] !== undefined) cleaned["startTime"] = cleaned["startTime"] + ":00";
		// eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-plus-operands
		if (cleaned["endTime"] !== undefined) cleaned["endTime"] = cleaned["endTime"] + ":00";

		setErrors({});
		// @ts-expect-error Always has the necessary properties
		setApplied({
			...cleaned,
		});
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Звіт</h1>
			<div className="grid grid-cols-4 gap-4 mb-4">
				<div className="flex flex-col">
					<label className="font-semibold">Дата початку зрізу</label>
					<input
						className="border p-2 rounded"
						type="date"
						value={draft.startDate}
						onChange={(event_) => {
							setDraftField("startDate", event_.target.value);
						}}
					/>
					<p className="text-red-600 text-sm h-2">{errors["startDate"]}</p>
				</div>
				<div className="flex flex-col">
					<label className="font-semibold">Дата кінця зрізу</label>
					<input
						className="border p-2 rounded"
						type="date"
						value={draft.endDate}
						onChange={(event_) => {
							setDraftField("endDate", event_.target.value);
						}}
					/>
					<p className="text-red-600 text-sm h-2">{errors["endDate"]}</p>
				</div>
				<div className="flex flex-col">
					<label className="font-semibold">Час початку зрізу</label>
					<input
						className="border p-2 rounded"
						type="time"
						value={draft.startTime}
						onChange={(event_) => {
							setDraftField("startTime", event_.target.value);
						}}
					/>
					<p className="text-red-600 text-sm h-2">{errors["startTime"]}</p>
				</div>
				<div className="flex flex-col">
					<label className="font-semibold">Час кінця зрізу</label>
					<input
						className="border p-2 rounded"
						type="time"
						value={draft.endTime}
						onChange={(event_) => {
							setDraftField("endTime", event_.target.value);
						}}
					/>
					<p className="text-red-600 text-sm h-2">{errors["endTime"]}</p>
				</div>
				<div className="flex flex-col">
					<label className="font-semibold">Вулиця</label>
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
					<label className="font-semibold">Будинок</label>
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
					<label className="font-semibold">Тип</label>
					<input
						className="border p-2 rounded"
						placeholder="Тип"
						value={draft.type}
						onChange={(event_) => {
							setDraftField("type", event_.target.value);
						}}
					/>
					<p className="text-red-600 text-sm h-2">{errors["type"]}</p>
				</div>
			</div>
			<div>
				<RoundedButton variant='blue' onClick={applyFilters}>
					Пошук
				</RoundedButton>
			</div>
			{dataIsPresent && (
				<div className="mt-4 space-y-6">
					<h2 className="text-xl font-semibold">Найчастіші результати</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Вулиця</div>
							<div className="font-semibold">{reportData.reportStreet}</div>
							<div className="text-gray-600 text-sm">Всього: {reportData.streetCount} ({Math.round(reportData.streetCount / reportData.reportCount * 100)}%)</div>
						</div>

						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Причина</div>
							<div className="font-semibold">{reportData.reportCauses}</div>
							<div className="text-gray-600 text-sm">Всього: {reportData.causesCount} ({Math.round(reportData.causesCount / reportData.reportCount * 100)}%)</div>
						</div>

						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Тип ДТП</div>
							<div className="font-semibold">{reportData.reportType}</div>
							<div className="text-gray-600 text-sm">Всього: {reportData.typeCount} ({Math.round(reportData.typeCount / reportData.reportCount * 100)}%)</div>
						</div>

						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Час доби</div>
							<div className="font-semibold">{Daytime[reportData.reportDaytime]}</div>
							<div className="text-gray-600 text-sm">Всього: {reportData.daytimeCount} ({Math.round(reportData.daytimeCount / reportData.reportCount * 100)}%)</div>
						</div>

						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Порушення</div>
							<div className="font-semibold">{reportData.reportViolation}</div>
							<div className="text-gray-600 text-sm">Всього: {reportData.violationCount} ({Math.round(reportData.violationCount / reportData.reportCount * 100)}%)</div>
						</div>

						<div className="border rounded-lg p-4 shadow-sm bg-white">
							<div className="text-gray-500 text-sm">Кількість ДТП</div>
							<div className="text-2xl font-bold">{reportData.reportCount}</div>
						</div>
					</div>

					<h3 className="text-lg font-semibold mt-4">Водій з найбільшою кількістю ДТП</h3>
					<div className="border rounded-lg p-4 shadow-sm bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<div className="text-gray-500 text-sm">ПІБ</div>
							<div className="font-semibold">
								{reportData.reportDriver.surname} {reportData.reportDriver.name} {reportData.reportDriver.patronymic}
							</div>
						</div>

						<div>
							<div className="text-gray-500 text-sm">Паспорт</div>
							<div className="font-semibold">
								{reportData.reportDriver.passportDetails.series} {reportData.reportDriver.passportDetails.id}
							</div>
						</div>

						<div>
							<div className="text-gray-500 text-sm">Посвідчення водія</div>
							<div className="font-semibold">
								{reportData.reportDriver.driverLicense.id}
							</div>
						</div>

						<div>
							<div className="text-gray-500 text-sm">Категорії</div>
							<div className="font-semibold">
								{reportData.reportDriver.driverLicense.categories.join(", ")}
							</div>
						</div>

						<div>
							<div className="text-gray-500 text-sm">Кількість ДТП</div>
							<div className="font-semibold">{reportData.driverCount}</div>
						</div>

						<div>
							<div className="text-gray-500 text-sm">E-mail</div>
							<div className="font-semibold">
								{reportData.reportDriver.email ?? "—"}
							</div>
						</div>
					</div>
				</div>
			)}
			{!dataIsPresent && (
				<h1 className="flex justify-center text-gray-800 text-2xl font-semibold">
					НЕМАЄ ДАНИХ
				</h1>
			)}
		</div>
	);
}
