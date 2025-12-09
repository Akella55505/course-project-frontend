import { z } from 'zod';
import { useCreatePerson } from '../api';
import type { ReactElement } from "react";
import { useState } from "react";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { toast } from "react-hot-toast";
import { useLocation } from "@tanstack/react-router";

const personSchema = z.object({
	name: z.string().min(1, "Введіть ім'я"),
	surname: z.string().min(1, 'Введіть прізвище'),
	patronymic: z.string().min(1, 'Введіть по-батькові'),
	driverLicense: z.object({
		id: z.string().regex(new RegExp(/^[A-Z]{2}\d{4}[A-Z]{2}$/), "ID посвідчення мусить мати вигляд АА1234АА").or(z.literal('')),
		categories: z.array(z.string().regex(/^[A-Z]$/, "Категорії мають бути визначені однією великою літерою")).optional(),
	}).refine(
		({ id, categories }) =>
			(id === '' && (!categories || categories.length === 0)) ||
			(id !== '' && categories && categories.length > 0),
		{ message: "Введіть або обидва поля посвідчення водія, або жодного", path: ['id'] }
	),
	passportDetails: z.object({
		id: z.string().regex(new RegExp(/^\d{6}$/), "ID паспорту має складатися з 6 цифр"),
		series: z.string().min(1, "Введіть серію паспорту").regex(new RegExp(/^[А-ЯҐЄІЇ]{2}$/), "Серія паспорту має складатися з двох великих літер"),
	}),
});

type FormState = {
	name: string,
	surname: string,
	patronymic: string,
	passportDetails: { id: string, series: string },
	driverLicense: { id: string, categories: string },
};

export function PersonCreatePage(): ReactElement {
	const createPerson = useCreatePerson();
	const location = useLocation();
	const incoming = location.state?.passportDetails;
	const [form, setForm] = useState<FormState>({
		name: "",
		surname: "",
		patronymic: "",
		passportDetails: incoming ?? { id: "", series: "" },
		driverLicense: { id: "", categories: "" },
	});
	const [error, setError] = useState("");


	const update = (key: string, value: string): void => {
		if (key.startsWith("passport.")) {
			const [, field] = key.split(".");
			setForm(previous => ({
				...previous,
				passportDetails: { ...previous.passportDetails, [field as string]: value },
			}));
		} else if (key.startsWith("driver.")) {
			const [, field] = key.split(".");
			setForm(previous => ({
				...previous,
				driverLicense: { ...previous.driverLicense, [field as string]: value },
			}));
		} else {
			setForm(previous => ({ ...previous, [key]: value }));
		}
	};

	const submit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		const nextForm = {
			...form,
			driverLicense: {
				id: form.driverLicense.id,
				categories: form.driverLicense.categories.split(",").map(c => c.trim()).filter(Boolean),
			},
		}
		const parsed = personSchema.safeParse(nextForm);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		setError("");
		const payload = {
			...nextForm,
			driverLicense: (!nextForm.driverLicense.id || nextForm.driverLicense.categories.length === 0) ? undefined : nextForm.driverLicense,
		};
		createPerson.mutate(payload, {
			onSuccess: () => {
				toast.success('Персону успішно зареєстровано', {
					duration: 3000
				});
			},
			onError: () => {
				toast.error('Персона з такими даними вже існує');
			}
		});
	};

	return (
		<div className="w-auto p-6 flex flex-row justify-center items-center">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg w-auto"
				onSubmit={submit}
			>
				<h1 className="text-2xl font-bold mb-4 text-center">
					Зареєструвати персону
				</h1>
				<div className="flex flex-col gap-4">
					<input
						className="border p-2 rounded"
						placeholder="Ім'я"
						value={form.name}
						onChange={(event_) => {
							update("name", event_.target.value);
						}}
					/>
					<input
						className="border p-2 rounded"
						placeholder="Прізвище"
						value={form.surname}
						onChange={(event_) => {
							update("surname", event_.target.value);
						}}
					/>
					<input
						className="border p-2 rounded"
						placeholder="По-батькові"
						value={form.patronymic}
						onChange={(event_) => {
							update("patronymic", event_.target.value);
						}}
					/>
					<div className="grid grid-cols-2 gap-4">
						<input
							className="border p-2 rounded"
							placeholder="ID паспорту"
							value={form.passportDetails.id}
							onChange={event_ => { update("passport.id", event_.target.value); }}
						/>
						<input
							className="border p-2 rounded"
							placeholder="Серія паспорту"
							value={form.passportDetails.series}
							onChange={event_ => { update("passport.series", event_.target.value); }}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<input
							className="border p-2 rounded"
							placeholder="ID посвідчення водія"
							value={form.driverLicense.id}
							onChange={event_ => { update("driver.id", event_.target.value); }}
						/>
						<input
							className="border p-2 rounded"
							placeholder="Категорії, через кому"
							value={form.driverLicense.categories}
							onChange={event_ => { update("driver.categories", event_.target.value); }}
						/>
					</div>
				</div>

				{error && (
					<div className="text-red-600 text-sm border border-red-300 p-2 rounded">
						{error}
					</div>
				)}

				<RoundedButton
					className="transition p-2"
					size="large"
					type="submit"
					variant="blue"
				>
					{createPerson.isPending ? "Зачекайте..." : "Зареєструвати"}
				</RoundedButton>
			</form>
		</div>
	);
}
