import type { ReactElement} from "react";
import { useState } from "react";
import React from "react";
import { useStatistics } from "../../api.ts";
import { loadingAnimation } from "../../../../common/elements.tsx";
import { z } from "zod";
import { RoundedButton } from "../../../../components/ui/RoundedButton.tsx";

const statisticsSchema = z.object({
	startDate: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Введіть дату в форматі РРРР-ММ-ДД").or(z.literal('')),
	endDate: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Введіть дату в форматі РРРР-ММ-ДД").or(z.literal('')),
	startTime: z.string().regex(new RegExp("^\\d{2}:\\d{2}$"), "Введіть час у форматі ГГ:ХХ").or(z.literal('')),
	endTime: z.string().regex(new RegExp("^\\d{2}:\\d{2}$"), "Введіть час у форматі ГГ:ХХ").or(z.literal('')),
	addressStreet: z.string().min(2, 'Назва вулиці занадто коротка').or(z.literal('')),
	addressNumber: z.string().optional().or(z.number()),
	type: z.string().min(4, 'Тип занадто короткий').or(z.literal('')),
});

export function AccidentsStatisticsMainPage(): ReactElement {
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
		pageIndex: 0
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const statistics = useStatistics( applied );

	if (statistics.isLoading) return loadingAnimation();

	const statisticsData = statistics.data;
	if (statisticsData === undefined) return <h1 className="text-red-600 text-2xl font-bold flex justify-center">ПОМИЛКА ПОШУКУ ДАНИХ</h1>;

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

		const result = statisticsSchema.safeParse(prepared);

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
			pageIndex: 0
		});
	};

	const nextPage = (): void =>
	{ setApplied(previous => ({ ...previous, pageIndex: previous.pageIndex + 1 })); };

	const previousPage = (): void =>
	{ setApplied(previous => ({ ...previous, pageIndex: Math.max(0, previous.pageIndex - 1) })); };

	return (
		<div>
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
			<table className="w-full table-auto border border-gray-300 rounded-lg overflow-hidden shadow-sm">
				<thead className="border-b border-gray-300">
				<tr className="bg-gray-200 text-left uppercase text-sm font-semibold text-gray-700 divide-x divide-gray-300">
					<th className="px-4 py-2">Ранг</th>
					<th className="px-4 py-2">Причини</th>
					<th className="px-4 py-2">Кількість випадків</th>
				</tr>
				</thead>
				<tbody className="divide-y  divide-x divide-gray-300">
				{statisticsData.map((accumulator) => {
					return (
						<React.Fragment key={accumulator.rank}>
							<tr className="border-b hover:bg-gray-50 divide-x divide-gray-300">
								<td className="px-4 py-2">{accumulator.rank}</td>
								<td className="px-4 py-2">{accumulator.causes}</td>
								<td className="px-4 py-2">{accumulator.accidentAmount}</td>
							</tr>
						</React.Fragment>
					);
				})}
				</tbody>
			</table>
		</div>
	);
}
