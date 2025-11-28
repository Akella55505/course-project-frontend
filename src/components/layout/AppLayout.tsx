import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactElement} from "react";

export function AppLayout(): ReactElement {
	const navigate = useNavigate();
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

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
					<button
						className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded cursor-pointer"
						onClick={async () => {
							document.cookie = "Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
							await navigate({ to: "/login" });
						}}
					>
						Logout
					</button>
				)}
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	);
}
