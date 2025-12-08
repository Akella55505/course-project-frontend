import type React from "react";
import { useState } from "react";
import type { ReactElement } from "react";
import { z } from "zod";
import { useCreateUserApplication } from "../api.ts";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { toast } from "react-hot-toast";

const schema = z.object({
	name: z.string().regex(new RegExp(/^[А-ЯҐЄІЇ][а-яґєії'-]*([ -][А-ЯҐЄІЇ][а-яґєії'-]*)*$/), "Ім'я має починатися з великої літери і бути написаним українською"),
	surname: z.string().regex(new RegExp(/^[А-ЯҐЄІЇ][а-яґєії'-]*([ -][А-ЯҐЄІЇ][а-яґєії'-]*)*$/), "Прізвище має починатися з великої літери і бути написаним українською"),
	patronymic: z.string().regex(new RegExp(/^[А-ЯҐЄІЇ][а-яґєії'-]*([ -][А-ЯҐЄІЇ][а-яґєії'-]*)*$/), "По-батькові має починатися з великої літери і бути написаним українською"),
	passportDetails: z.object({
		id: z.string().regex(new RegExp(/^\d{6}$/), "ID паспорту має складатися з 6 цифр"),
		series: z.string().min(1, "Введіть серію паспорту").regex(new RegExp(/^[А-ЯҐЄІЇ]{2}$/), "Серія паспорту має складатися з двох великих літер"),
	}),
	licensePlate: z.string().min(2, "Введіть номерний знак"),
	date: z.string().min(1, "Укажіть дату"),
	time: z.string().min(1, "Укажіть час"),
	addressStreet: z.string().min(1, "Введіть вулицю"),
	addressNumber: z.string().min(1, "Введіть будівлю"),
});

export function UserCreateApplicationPage(): ReactElement {
	const createUserApplication = useCreateUserApplication();
	const [form, setForm] = useState({
		name: "",
		surname: "",
		patronymic: "",
		passportDetails: { id: "", series: "" },
		licensePlate: "",
		date: "",
		time: "",
		addressStreet: "",
		addressNumber: "",
	});
	const [error, setError] = useState("");

	const update = (key: string, value: string): void => {
		if (key.startsWith("passport.")) {
			const [, field] = key.split(".");
			setForm(previous => ({
				...previous,
				passportDetails: { ...previous.passportDetails, [field as string]: value },
			}));
		} else {
			setForm(previous => ({ ...previous, [key]: value }));
		}
	};

	const submit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		const parsed = schema.safeParse(form);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		setError("");
		const payload = {
			...form,
			time: `${form.time}:00`,
		};
		createUserApplication.mutate(payload);
		toast.success('Заяву успішно створено. Очікуйте на листа на ваш email', {
			duration: 3000
		});
	};

	return (
		<div className="max-w-lg mx-auto p-6">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg"
				onSubmit={submit}
			>
				<h1 className="text-2xl font-bold mb-4">Створити заяву</h1>
				<input
					className="border p-2 rounded"
					placeholder="Ваше ім'я"
					value={form.name}
					onChange={event_ => { update("name", event_.target.value); }}
				/>
				<input
					className="border p-2 rounded"
					placeholder="Ваше прізвище"
					value={form.surname}
					onChange={event_ => { update("surname", event_.target.value); }}
				/>
				<input
					className="border p-2 rounded"
					placeholder="Ваше по-батькові"
					value={form.patronymic}
					onChange={event_ => { update("patronymic", event_.target.value); }}
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

				<input
					className="border p-2 rounded"
					placeholder="Номерний знак"
					value={form.licensePlate}
					onChange={event_ => { update("licensePlate", event_.target.value); }}
				/>

				<input
					className="border p-2 rounded"
					type="date"
					value={form.date}
					onChange={event_ => { update("date", event_.target.value); }}
				/>

				<input
					className="border p-2 rounded"
					type="time"
					value={form.time}
					onChange={event_ => { update("time", event_.target.value); }}
				/>

				<input
					className="border p-2 rounded"
					placeholder="Назва вулиці"
					value={form.addressStreet}
					onChange={event_ => { update("addressStreet", event_.target.value); }}
				/>
				<input
					className="border p-2 rounded"
					placeholder="Будівля"
					value={form.addressNumber}
					onChange={event_ => { update("addressNumber", event_.target.value); }}
				/>

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
					Надіслати
				</RoundedButton>
			</form>
		</div>
	);
}
