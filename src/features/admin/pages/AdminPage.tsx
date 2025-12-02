import { type ReactElement, useState } from "react";
import { RoundedButton } from "../../../components/ui/RoundedButton";
import { ApplicationRole } from "../../auth/types";
import { useUpdateUserRole } from "../api.ts";

export function AdminPage(): ReactElement {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<ApplicationRole>(ApplicationRole.USER);
	const { mutate, isPending, isError } = useUpdateUserRole();

	const handleSubmit = (event_: React.FormEvent): void => {
		event_.preventDefault();
		mutate({ email, role });
	};

	const roleOptions = Object.values(ApplicationRole);

	return (
		<div className="max-w-lg mx-auto p-6">
			<form
				className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg"
				onSubmit={handleSubmit}
			>
				<h1 className="text-xl font-bold">Надати роль користувачу</h1>

				<input
					className="border p-2 rounded"
					placeholder="Email"
					type="email"
					value={email}
					onChange={event_ => { setEmail(event_.target.value); }}
				/>

				<select
					className="border p-2 rounded"
					value={role}
					onChange={event_ => { setRole(event_.target.value as ApplicationRole); }}
				>
					{roleOptions.map(r => (
						<option key={r} value={r}>
							{r}
						</option>
					))}
				</select>

				{isError && (
					<div className="text-red-600 text-sm border border-red-300 p-2 rounded">
						Користувача не існує
					</div>
				)}

				<RoundedButton
					className="transition p-2"
					disabled={isPending}
					size="large"
					type="submit"
					variant="blue"
				>
					{isPending ? "Зачекайте..." : "Надати"}
				</RoundedButton>
			</form>
		</div>
	);
}
