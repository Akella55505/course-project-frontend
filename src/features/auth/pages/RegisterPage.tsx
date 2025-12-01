import { useForm } from 'react-hook-form';
import { useRegister } from '../api.ts';
import type { ReactElement } from "react";
import { useNavigate } from "@tanstack/react-router";

type FormValues = {
	username: string;
	email: string;
	password: string;
};

export function RegisterPage(): ReactElement {
	const { register, handleSubmit } = useForm<FormValues>();
	const { mutate, isPending, error } = useRegister();
	const navigate = useNavigate();

	const onSubmit = (data: FormValues): void => { mutate(data); };

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form className="flex flex-col gap-2 w-64" onSubmit={handleSubmit(onSubmit)}>
				<input {...register('email')} className="border p-2" placeholder="Email" />
				<input {...register('password')} className="border p-2" placeholder="Password" type="password" />
				<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer" disabled={isPending} type="submit">
					{isPending ? 'Зачекайте...' : 'Зареєструватися'}
				</button>
				{error && <p className="text-red-500 text-sm">Помилка</p>}
				<button
					className="hover:cursor-pointer text-blue-700 underline underline-offset-4"
					type="button"
					onClick={() => navigate({ to: "/login" })}
				>
					Увійти
				</button>
			</form>
		</div>
	);
}
