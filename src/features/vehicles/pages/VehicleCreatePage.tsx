import { z } from 'zod';
import type React from "react";
import { useState, type ReactElement } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { useCreateVehicle } from "../api.ts";

const vehicleSchema = z.object({
	make: z.string().min(1, 'Введіть марку'),
	model: z.string().min(1, 'Введіть модель'),
	licensePlate: z.string().regex(new RegExp(/^[\p{Lu}0-9]+$/u), "Номерний знак має містити тільки великі літери або цифри"),
	vin: z.string().regex(new RegExp("^[A-HJ-NPR-Z0-9]{17}$"), 'VIN-код має містити тільки великі літери або цифри'),
});

type FormState = {
	make: string,
	model: string,
	licensePlate: string,
	vin: string,
	personId: number,
};

export function VehicleCreatePage(): ReactElement {
	const createVehicle = useCreateVehicle();
	const location = useLocation();
	const incoming = location.state?.ownerId;
	const [form, setForm] = useState<FormState>({
		make: "",
		model: "",
		licensePlate: "",
		vin: "",
		personId: incoming ?? -1,
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const update = (key: string, value: string): void => {
		setForm(previous => ({ ...previous, [key]: value }));
	};

	const submit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		const parsed = vehicleSchema.safeParse(form);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		setError("");
		createVehicle.mutate(form, {
			onSuccess: () => {
				toast.success('ТЗ успішно зареєстровано', {
					duration: 3000
				});
			},
			onError: () => {
				toast.error('ТЗ з такими даними вже існує');
			}
		});
	};

	return (
		<div className="w-auto p-6 flex flex-row justify-center items-center">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg w-md"
				onSubmit={submit}
			>
				<div className="relative">
					<h1 className="text-2xl font-bold mb-4 text-center -translate-y-1/12">
						Зареєструвати ТЗ
					</h1>
					<RoundedButton
						className="absolute top-0 right-0"
						type="button"
						variant="red"
						onClick={async () => {
							await navigate({ to: "/accidents/new" });
						}}
					>
						X
					</RoundedButton>
				</div>
				<div className="flex flex-col gap-4">
					<input
						className="border p-2 rounded"
						placeholder="Марка"
						value={form.make}
						onChange={(event_) => {
							update("make", event_.target.value);
						}}
					/>
					<input
						className="border p-2 rounded"
						placeholder="Модель"
						value={form.model}
						onChange={(event_) => {
							update("model", event_.target.value);
						}}
					/>
					<input
						className="border p-2 rounded"
						placeholder="Номерний знак"
						value={form.licensePlate}
						onChange={(event_) => {
							update("licensePlate", event_.target.value);
						}}
					/>
					<input
						className="border p-2 rounded"
						placeholder="VIN-код"
						value={form.vin}
						onChange={(event_) => {
							update("vin", event_.target.value);
						}}
					/>
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
					{createVehicle.isPending ? "Зачекайте..." : "Зареєструвати"}
				</RoundedButton>
			</form>
		</div>
	);
}
