import { z } from 'zod';
import { useCreateAccident } from '../api';
import type { ReactElement } from "react";
import type React from "react";
import { useState } from "react";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";
import { toast } from "react-hot-toast";
import { AccidentRole } from "../../many-to-many/types.ts";
import { Outlet, useNavigate } from "@tanstack/react-router";
import type { DriverLicense, PassportDetails, Person } from "../../persons/types.ts";
import { usePerson, usePersonDriverLicense } from "../../persons/api.ts";
import { useVehicles } from "../../vehicles/api.ts";
import { Popup } from "../../../components/ui/Popup.tsx";
import { PopupField } from "../../../components/ui/PopupField.tsx";

const accidentSchema = z.object({
	date: z.string().min(1, "Вкажіть дату"),
	time: z.string().min(1, "Вкажіть час"),
	addressStreet: z.string().min(1, "Введіть вулицю"),
	addressNumber: z.string().min(1, "Введіть будівлю"),
	causes: z.string().min(3, 'Причини занадто короткі'),
	type: z.string().min(3, 'Тип занадто короткий'),
	media: z.object({
		photos: z.array(z.string()),
		videos: z.array(z.string()),
	}, "Невірно вказані медіа"),
	personsRoles: z.array(z.record(z.string().regex(/^\d+$/), z.enum(Object.keys(AccidentRole)))).min(1, "Вкажіть як мінімум одну персону"),
	vehicleIds: z.array(z.number()).min(1, "Вкажіть як мінімум один ТЗ"),
});

const personSchema = z.object({
	id: z.string().regex(new RegExp(/^\d{6}$/), "ID паспорту має складатися з 6 цифр"),
	series: z.string().min(1, "Введіть серію паспорту").regex(new RegExp(/^[А-ЯҐЄІЇ]{2}$/), "Серія паспорту має складатися з двох великих літер"),
});

type FormState = {
	date: string;
	time: string;
	addressStreet: string;
	addressNumber: string;
	causes: string;
	type: string;
	media: {
		photos: Array<string>;
		videos: Array<string>;
	};
	personsRoles: Array<Record<number, keyof typeof AccidentRole>>;
	vehicleIds: Array<number>;
};

type PersonEntry =
	| { type: "form"; data: PassportDetails }
	| { type: "loaded"; data: Person };

function FetchedPersonSelector({
												 personId,
												 selectedVehicles,
												 setSelectedVehicles,
												 culpritIndex,
												 setCulpritIndex,
												 index,
												 hasLicense, name, surname, patronymic, passportDetails, driverLicense
											 }: {
												 personId: string;
												 selectedVehicles: Array<number | null>;
												 setSelectedVehicles: React.Dispatch<React.SetStateAction<Array<number | null>>>;
												 culpritIndex: number | null;
												 setCulpritIndex: React.Dispatch<React.SetStateAction<number | null>>;
												 index: number;
												 hasLicense: boolean;
												 name: string;
												 surname: string;
												 patronymic: string;
												 passportDetails: PassportDetails;
												 driverLicense: DriverLicense | undefined;
											 }): ReactElement {
	const getVehicles = useVehicles(personId);
	const setPersonDriverLicense = usePersonDriverLicense();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [form, setForm] = useState({ id: "", categories: "" });
	const [driverLicenseState, setDriverLicenseState] = useState<DriverLicense | null>(driverLicense ?? null);
	const [hasLicenseState, setHasLicenseState] = useState<boolean>(hasLicense);

	const driverLicenseSchema = z.object({
		id: z.string().regex(new RegExp(/^[A-Z]{2}\d{4}[A-Z]{2}$/), "ID посвідчення мусить мати вигляд АА1234АА"),
		categories: z.array(z.string().regex(/^[A-Z]$/, "Категорії мають бути визначені однією великою літерою")).min(1, "Введіть як мінімум одну категорію"),
	})

	const submit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		const nextForm = {
			...form,
			categories: form.categories.split(",").map(c => c.trim()).filter(Boolean),
		}
		const parsed = driverLicenseSchema.safeParse(nextForm);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		setError("");
		const payload = {
			driverLicense: { id: nextForm.id, categories: nextForm.categories },
			personId: personId,
		}
		setPersonDriverLicense.mutate(payload, {
			onSuccess: () => { setOpen(false); setDriverLicenseState(payload.driverLicense); setHasLicenseState(true); },
		});
	};

	const update = (k: "id" | "categories", v: string): void =>
	{ setForm({ ...form, [k]: v }); };
	
	return (
		<div className="flex flex-col gap-2">
			<div className="p-2 bg-gray-100 rounded">
				<div>
					ПІБ: {surname} {name}{" "}
					{patronymic}
				</div>
				<div>
					Паспорт: {passportDetails.series}{" "}
					{passportDetails.id}
				</div>
				{driverLicenseState && (
					<div>
						Посвідчення водія: {driverLicenseState.id} (
						{driverLicenseState.categories.join(", ")})
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<Popup
					error={error}
					open={open}
					// @ts-expect-error Always inside a form
					onSubmit={submit}
					onCancel={() => {
						setOpen(false);
					}}
				>
					<h1 className="text-gray-800 text-base font-semibold">
						У персони немає посвідчення водія.<br/>Додайте його:
					</h1>

					<PopupField label="ID">
						<input
							className="border p-2 rounded w-full"
							value={form.id}
							onChange={(event_) => {
								update("id", event_.target.value);
							}}
						/>
					</PopupField>

					<PopupField label="Категорії">
						<input
							className="border p-2 rounded w-full"
							value={form.categories}
							onChange={(event_) => {
								update("categories", event_.target.value);
							}}
						/>
					</PopupField>
				</Popup>
				<div className="flex flex-row gap-2 w-full">
					<select
						className="border p-2 rounded w-full"
						value={selectedVehicles[index] ?? ""}
						onChange={(event_) => {
							const selected = event_.target.value;
							const isPedestrian = selected === "";
							if (isPedestrian && culpritIndex === index) setCulpritIndex(null);
							setSelectedVehicles((previous) =>
								previous.map((v, index_) =>
									index_ === index ? (isPedestrian ? null : Number(selected)) : v
								)
							);
						}}
					>
						<option value="">Пішохід</option>
						{getVehicles.data?.map((v) => (
							<option key={v.id} value={v.id}>
								{v.make} {v.model} {v.licensePlate}
							</option>
						))}
					</select>
					<RoundedButton
						type="button"
						variant="green"
						onClick={async () => {
							if (!hasLicenseState) {
								setOpen(true);
								return;
							}
							await navigate({
								to: "/accidents/new/vehicle",
								state: { ownerId: Number(personId) },
							});
						}}
					>
						+
					</RoundedButton>
				</div>
				{selectedVehicles[index] !== null && (
					<div className="flex items-center gap-2">
						<input
							checked={culpritIndex === index}
							name="culprit"
							type="radio"
							onChange={() => {
								setCulpritIndex(index);
							}}
						/>
						<div>Винуватець</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function AccidentCreatePage(): ReactElement {
	const createAccident = useCreateAccident();
	const [form, setForm] = useState<FormState>({
		date: "",
		time: "",
		addressStreet: "",
		addressNumber: "",
		causes: "",
		type: "",
		media: { photos: [], videos: [] },
		personsRoles: [],
		vehicleIds: [],
	});
	const [persons, setPersons] = useState<Array<PersonEntry>>([]);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const getPerson = usePerson();
	const [error, setError] = useState("");
	const [culpritIndex, setCulpritIndex] = useState<number | null>(null);
	const [selectedVehicles, setSelectedVehicles] = useState<Array<number | null>>([]);
	const navigate = useNavigate();

	const addPerson = (): void => {
		if (openIndex !== null) return;
		const newIndex = persons.length;
		setPersons(previous => [...previous, { type: "form", data: { id: "", series: "" } }]);
		setOpenIndex(newIndex);
	};

	const updatePersonField = (index: number, key: keyof PassportDetails, value: string): void => {
		setPersons(previous =>
			previous.map((entry, index_) =>
				index_ === index && entry.type === "form"
					? { ...entry, data: { ...entry.data, [key]: value } }
					: entry
			)
		);
	};

	const submitPerson = (index: number): void => {
		const entry = persons[index];
		if (!entry || entry.type !== "form") return;
		const parsed = personSchema.safeParse(entry.data);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		setError("");
		getPerson.mutate(entry.data, {
			onSuccess: (person: Person) => {
				const exists = persons.some(p =>
					p.type === "loaded" &&
					p.data.id === person.id
				);
				if (exists) {
					toast.error("Персона вже додана");
					return;
				}
				setPersons(previous =>
					previous.map((entry, index_) => index_ === index ? { type: "loaded", data: person } : entry)
				);
				setSelectedVehicles(previous => {
					const copy = [...previous];
					copy[index] = null;
					return copy;
				});
				setOpenIndex(null);
				toast.success("Персону знайдено");
			},
			onError: () => {
				toast.error("Персону не знайдено");
				navigate({
					to: "/accidents/new/person",
					state: {
						passportDetails: {
							id: entry.data.id,
							series: entry.data.series,
						}
					}
				})
					.catch(() => {
						return;
					});
			}
		});
	};

	const deletePerson = (index: number): void => {
		setPersons(previous => previous.filter((_, index_) => index_ !== index));
		if (openIndex === index) setOpenIndex(null);
		else if (openIndex !== null && openIndex > index) setOpenIndex(openIndex - 1);
		if (culpritIndex === index) setCulpritIndex(null);
		setSelectedVehicles(previous => {
			const copy = [...previous];
			copy.splice(index, 1);
			return copy;
		});
	};

	const update = (key: string, value: string): void => {
		if (key.startsWith("media.")) {
			const [, field] = key.split(".");
			setForm(previous => ({
				...previous,
				media: { ...previous.media, [field as string]: value },
			}));
		} else {
			setForm(previous => ({ ...previous, [key]: value }));
		}
	};

	const submit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		const loadedPersons = persons.filter(p => p.type === "loaded");
		const roles: Array<Record<number, keyof typeof AccidentRole>> =
			loadedPersons.map((entry, index) => ({
				[entry.data.id]: index === culpritIndex ? 'CULPRIT' : 'VICTIM'
			}));
		const vehicleIds = loadedPersons.map((_, index) => selectedVehicles[index]).filter(id => id !== null) as Array<number>;
		const nextForm = {
			...form,
			personsRoles: roles,
			vehicleIds: vehicleIds,
		}
		const parsed = accidentSchema.safeParse(nextForm);
		if (!parsed.success) {
			// @ts-expect-error Always defined
			setError(parsed.error.issues[0].message);
			return;
		}
		if (culpritIndex === null) {
			setError("Вкажіть винуватця");
			return;
		}
		setError("");
		const payload = {
			...nextForm,
			media: { photos: nextForm.media.photos.length === 0 ? undefined : nextForm.media.photos, videos: nextForm.media.videos.length === 0 ? undefined : nextForm.media.videos },
			time: `${form.time}:00`,
		};
		createAccident.mutate(payload, {
			onSuccess: () => {
				toast.success('ДТП успішно зареєстровано', {
					duration: 3000
				});
			},
			onError: () => {
				toast.error('Виникла помилка');
			}
		});
	};

	const addPhoto = (): void => {
		setForm(previous => ({
			...previous,
			media: { ...previous.media, photos: [...previous.media.photos, ""] }
		}));
	};

	const addVideo = (): void => {
		setForm(previous => ({
			...previous,
			media: { ...previous.media, videos: [...previous.media.videos, ""] }
		}));
	};

	const updatePhoto = (index: number, value: string): void => {
		setForm(previous => ({
			...previous,
			media: {
				...previous.media,
				photos: previous.media.photos.map((p, index_) => index_ === index ? value : p)
			},
		}));
	};

	const updateVideo = (index: number, value: string): void => {
		setForm(previous => ({
			...previous,
			media: {
				...previous.media,
				videos: previous.media.videos.map((v, index_) => index_ === index ? value : v)
			},
		}));
	};

	const deletePhoto = (index: number): void => {
		setForm(previous => ({
			...previous,
			media: {
				...previous.media,
				photos: previous.media.photos.filter((_, index_) => index_ !== index)
			}
		}));
	};

	const deleteVideo = (index: number): void => {
		setForm(previous => ({
			...previous,
			media: {
				...previous.media,
				videos: previous.media.videos.filter((_, index_) => index_ !== index)
			}
		}));
	};

	return (
		<div className="w-auto mx-auto p-6 flex flex-row justify-center items-center">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg w-2xl"
				onSubmit={submit}
			>
				<h1 className="text-2xl font-bold mb-4 text-center">
					Зареєструвати ДТП
				</h1>
				<div className="grid grid-cols-2 gap-4">
					<div className="flex flex-col gap-4">
						<h1 className="text-xl font-semibold text-center">ДТП</h1>
						<input
							className="border p-2 rounded"
							max={new Date().toISOString().split("T")[0]}
							type="date"
							value={form.date}
							onChange={(event_) => {
								update("date", event_.target.value);
							}}
						/>

						<input
							className="border p-2 rounded"
							type="time"
							value={form.time}
							max={
								form.date === new Date().toISOString().split("T")[0]
									? new Date().getHours() + ":" + new Date().getMinutes()
									: undefined
							}
							onChange={(event_) => {
								update("time", event_.target.value);
							}}
						/>

						<input
							className="border p-2 rounded"
							placeholder="Назва вулиці"
							value={form.addressStreet}
							onChange={(event_) => {
								update("addressStreet", event_.target.value);
							}}
						/>
						<input
							className="border p-2 rounded"
							placeholder="Будівля"
							value={form.addressNumber}
							onChange={(event_) => {
								update("addressNumber", event_.target.value);
							}}
						/>
						<input
							className="border p-2 rounded"
							placeholder="Причини"
							value={form.causes}
							onChange={(event_) => {
								update("causes", event_.target.value);
							}}
						/>
						<input
							className="border p-2 rounded"
							placeholder="Тип"
							value={form.type}
							onChange={(event_) => {
								update("type", event_.target.value);
							}}
						/>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<div className="font-semibold text-center">Фото</div>
								{form.media.photos.map((p, index) => (
									<div key={index} className="flex items-center gap-2 w-full">
										<input
											key={index}
											className="border p-2 rounded flex-1 min-w-0"
											placeholder={`Фото ${index + 1}`}
											value={p}
											onChange={(event_) => {
												updatePhoto(index, event_.target.value);
											}}
										/>
										<RoundedButton
											type="button"
											variant="red"
											onClick={() => {
												deletePhoto(index);
											}}
										>
											–
										</RoundedButton>
									</div>
								))}
								<RoundedButton type="button" variant="green" onClick={addPhoto}>
									+
								</RoundedButton>
							</div>

							<div className="flex flex-col gap-2">
								<div className="font-semibold text-center">Відео</div>
								{form.media.videos.map((v, index) => (
									<div key={index} className="flex items-center gap-2 w-full">
										<input
											key={index}
											className="border p-2 rounded flex-1 min-w-0"
											placeholder={`Відео ${index + 1}`}
											value={v}
											onChange={(event_) => {
												updateVideo(index, event_.target.value);
											}}
										/>
										<RoundedButton
											type="button"
											variant="red"
											onClick={() => {
												deleteVideo(index);
											}}
										>
											–
										</RoundedButton>
									</div>
								))}
								<RoundedButton type="button" variant="green" onClick={addVideo}>
									+
								</RoundedButton>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<h1 className="text-xl font-semibold text-center">Персони</h1>

						<div className="flex flex-col gap-2">
							{persons.map((entry, index) => (
								<div
									key={index}
									className="flex flex-col gap-2 border p-2 rounded"
								>
									<div className="flex justify-between items-center">
										<div className="font-semibold">Персона {index + 1}</div>
										<RoundedButton
											type="button"
											variant="red"
											onClick={() => {
												deletePerson(index);
											}}
										>
											–
										</RoundedButton>
									</div>
									{entry.type === "form" ? (
										<>
											<input
												className="border p-2 rounded"
												placeholder="ID паспорту"
												value={entry.data.id}
												onChange={(event_) => {
													updatePersonField(index, "id", event_.target.value);
												}}
											/>
											<input
												className="border p-2 rounded"
												placeholder="Серія паспорту"
												value={entry.data.series}
												onChange={(event_) => {
													updatePersonField(
														index,
														"series",
														event_.target.value
													);
												}}
											/>
											<RoundedButton
												type="button"
												variant="blue"
												onClick={() => {
													submitPerson(index);
												}}
											>
												Перевірити
											</RoundedButton>
										</>
									) : (
										<div className="flex flex-col gap-2">
											<FetchedPersonSelector
												key={entry.data.id}
												culpritIndex={culpritIndex}
												driverLicense={entry.data.driverLicense}
												hasLicense={Boolean(entry.data.driverLicense)}
												index={index}
												name={entry.data.name}
												passportDetails={entry.data.passportDetails}
												patronymic={entry.data.patronymic}
												personId={String(entry.data.id)}
												selectedVehicles={selectedVehicles}
												setCulpritIndex={setCulpritIndex}
												setSelectedVehicles={setSelectedVehicles}
												surname={entry.data.surname}
											/>
										</div>
									)}
								</div>
							))}
							{openIndex === null && (
								<RoundedButton
									type="button"
									variant="green"
									onClick={addPerson}
								>
									+
								</RoundedButton>
							)}
						</div>
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
					{createAccident.isPending ? "Зачекайте..." : "Створити"}
				</RoundedButton>
			</form>
			<Outlet />
		</div>
	);
}
