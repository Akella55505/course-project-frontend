import type React from "react";
import { useState } from "react";
import type { ReactElement } from "react";
import { z } from "zod";
import { useCreateUserApplication } from "../api.ts";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";

const schema = z.object({
	name: z.string().min(1, "Введіть ім'я"),
	surname: z.string().min(1, "Введіть прізвище"),
	patronymic: z.string().min(1, "Введіть по-батькові"),
	passportDetails: z.object({
		id: z.string().min(1, "Введіть id паспорту"),
		series: z.string().min(1, "Введіть серію паспорту"),
	}),
	licensePlate: z.string().length(8, "Номерний знак має бути рівно 8 символів"),
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
	};

	return (
		<div className="max-w-lg mx-auto p-6">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg"
				onSubmit={submit}
			>
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
