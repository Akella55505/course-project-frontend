import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactElement} from "react";
import { useLogout } from "../../features/auth/api.ts";
import { RoundedButton } from "../ui/RoundedButton.tsx";

export function AppLayout(): ReactElement {
	const navigate = useNavigate();
	const location = useLocation();
	const logout = useLogout();
	const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

	return (
		<div>
			<header className="bg-gray-800 text-white flex items-center justify-between px-6 py-3 h-14">
				<nav className="flex gap-6">
					<Link
						className="[&.active]:font-bold hover:underline"
						to="/accidents"
					>
						Accidents
					</Link>
					<Link className="[&.active]:font-bold hover:underline" to="/persons">
						Persons
					</Link>
					<Link className="[&.active]:font-bold hover:underline" to="/vehicles">
						Vehicles
					</Link>
				</nav>
				{!isLoginPage && (
					<RoundedButton
						variant='red'
						onClick={async () => {
							await logout.mutateAsync({});
							await navigate({ to: "/login" });
						}}
					>
					Вийти
					</RoundedButton>
				)}
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	);
}
