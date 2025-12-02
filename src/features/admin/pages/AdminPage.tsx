import { type ReactElement, useState } from "react";
import { RoundedButton } from "../../../components/ui/RoundedButton";
import { ApplicationRole } from "../../auth/types";
import { useUpdateUserRole } from "../api.ts";

export function AdminPage(): ReactElement {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<ApplicationRole>(ApplicationRole.USER);
	const { mutate, isPending, isError } = useUpdateUserRole();

	const handleSubmit = (): void => {
		mutate({ email, role });
	};

	return (
		<div className="flex flex-col items-center gap-4 p-6">
			<h1 className="text-xl font-bold">Update User Role</h1>

			<input
				className="border p-2 rounded w-64"
				placeholder="User Email"
				type="email"
				value={email}
				onChange={event_ => { setEmail(event_.target.value); }}
			/>

			<select
				className="border p-2 rounded w-64"
				value={role}
				onChange={event_ => { setRole(event_.target.value as ApplicationRole); }}
			>
				{Object.values(ApplicationRole).map(r => (
					<option key={r} value={r}>
						{r}
					</option>
				))}
			</select>

			<RoundedButton
				disabled={isPending}
				variant="blue"
				onClick={handleSubmit}
			>
				{isPending ? "Updating..." : "Update Role"}
			</RoundedButton>

			{isError && (
				<p className="text-red-500 text-sm">Failed to update role</p>
			)}
		</div>
	);
}
