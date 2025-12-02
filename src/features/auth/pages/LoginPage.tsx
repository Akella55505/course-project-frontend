import { useForm } from 'react-hook-form';
import { useLogin } from "../api";
import type { ReactElement } from "react";
import { useNavigate } from "@tanstack/react-router";

type FormValues = {
	email: string;
	password: string;
};

export function LoginPage(): ReactElement {
	const { register, handleSubmit } = useForm<FormValues>();
	const { mutate, isPending, error } = useLogin();
	const navigate = useNavigate();

	const onSubmit = (data: FormValues): void => { mutate(data); };

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form className="flex flex-col gap-2 w-64" onSubmit={handleSubmit(onSubmit)}>
				<input {...register('email')} className="border p-2" placeholder="Email" />
				<input {...register('password')} className="border p-2" placeholder="Password" type="password" />
				<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer" disabled={isPending} type="submit">
					{isPending ? 'Зачекайте...' : 'Увійти'}
				</button>
				{error && <p className="text-red-500 text-sm">Невірні дані</p>}
				<button
					className="hover:cursor-pointer text-blue-700 underline underline-offset-4"
					type="button"
					onClick={() => navigate({ to: "/register" })}
				>
					Зареєструватися
				</button>
			</form>
		</div>
	);
}
