import type { ReactElement} from "react";
import { useState } from "react";
import { RoundedButton } from "../../../components/ui/RoundedButton";
import { Popup } from "../../../components/ui/Popup.tsx";
import { PopupField } from "../../../components/ui/PopupField.tsx";
import { useCreatePoliceman, usePolicemanEmail } from "../api.ts";

export function PolicemanRegisterPage(): ReactElement {
	const setPolicemanEmail = usePolicemanEmail();
	const [openLink, setOpenLink] = useState(false);
	const [id, setId] = useState<string>("");
	const [openCreate, setOpenCreate] = useState(false);
	const [form, setForm] = useState({ policemanId: "", name: "", surname: "", patronymic: "" });
	const [fieldIsEmpty, setFieldIsEmpty] = useState(false);
	const createPoliceman = useCreatePoliceman();

	const fioPattern = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'-]+$/;
	const isValid = (s: string): boolean => fioPattern.test(s);

	const updateForm = (k: "policemanId" | "name" | "surname" | "patronymic", v: string): void =>
	{ setForm({ ...form, [k]: v }); };

	return (
		<div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-xl space-y-6">
			<Popup
				error={fieldIsEmpty ? "Поле не може бути порожнім" : setPolicemanEmail.isError ? "Поліцейського немає в базі" : null}
				open={openLink}
				onCancel={() => { setOpenLink(false); setFieldIsEmpty(false); }}
				onSubmit={() => {
					if (id === "") {
						setFieldIsEmpty(true);
						return;
					}
					setPolicemanEmail.mutate(id, {
						onSuccess: () => {
							setOpenLink(false);
						}
					})
				}}
			>
				<PopupField label="ID ліцензії">
					<input
						className="border p-2 rounded w-full"
						value={id}
						onChange={event_ => { setId(event_.target.value); }}
					/>
				</PopupField>
			</Popup>
			<Popup
				error={fieldIsEmpty ? "Введіть дані" : createPoliceman.isError ? "Поліцейський вже існує в базі" : null}
				open={openCreate}
				onCancel={() => { setOpenCreate(false); setFieldIsEmpty(false); }}
				onSubmit={() => {
					if (form.policemanId === "" || !isValid(form.name) || !isValid(form.surname) || !isValid(form.patronymic)) {
						setFieldIsEmpty(true);
						return;
					}
					setFieldIsEmpty(false);
					createPoliceman.mutate(form, {
						onSuccess: () => {
							setOpenLink(false);
						}
					})
				}}
			>
				<PopupField label="ID ліцензії">
					<input
						className="border p-2 rounded w-full"
						value={form.policemanId}
						onChange={event_ => { updateForm('policemanId', event_.target.value); }}
					/>
				</PopupField>
				<PopupField label="Ім'я">
					<input
						className="border p-2 rounded w-full"
						value={form.name}
						onChange={event_ => { updateForm('name', event_.target.value); }}
					/>
				</PopupField>
				<PopupField label="Прізвище">
					<input
						className="border p-2 rounded w-full"
						value={form.surname}
						onChange={event_ => { updateForm('surname', event_.target.value); }}
					/>
				</PopupField>
				<PopupField label="По-батькові">
					<input
						className="border p-2 rounded w-full"
						value={form.patronymic}
						onChange={event_ => { updateForm('patronymic', event_.target.value); }}
					/>
				</PopupField>
			</Popup>
			<h1 className="text-xl font-semibold text-gray-800 text-center">
				Ваш акаунт поки ще не прив'язаний. Можете зробити це
			</h1>
			<div className="flex flex-col items-center space-y-4">
				<RoundedButton
					className="w-full text-lg font-medium py-3"
					variant="blue"
					onClick={() => { setOpenLink(true); }}
				>
					Надавши номер посвідчення
				</RoundedButton>
				<p className="text-gray-500 font-medium">або</p>
				<RoundedButton
					className="w-full text-lg font-medium py-3"
					variant="blue"
					onClick={() => { setOpenCreate(true); }}
				>
					Створивши новий обліковий запис
				</RoundedButton>
			</div>
		</div>
	);

}
