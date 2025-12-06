import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactElement} from "react";
import { useLogout, useRole } from "../../features/auth/api.ts";
import { RoundedButton } from "../ui/RoundedButton.tsx";
import { ApplicationRole } from "../../features/auth/types.ts";

export function AppLayout(): ReactElement {
	const navigate = useNavigate();
	const location = useLocation();
	const logout = useLogout();
	const getRole = useRole();
	const isLoginPage = location.pathname === "/login" || location.pathname === "/register";
	let userRole;
	if (!isLoginPage && !getRole.isLoading) {
		// @ts-expect-error Always defined
		userRole = getRole.data["role"];
	}

	return (
		<div>
			<header className="bg-gray-800 text-white flex items-center justify-between px-6 py-3 h-14">
				{!isLoginPage && (
					<nav className="flex gap-6">
						{userRole === ApplicationRole.USER && (
							<Link
								className="[&.active]:font-bold hover:underline"
								to="/user"
							>
								ДТП
							</Link>
						)}
						{userRole !== ApplicationRole.USER && (
							<Link
								className="[&.active]:font-bold hover:underline"
								to="/accidents"
							>
								ДТП
							</Link>
						)}
						{userRole === ApplicationRole.POLICE && (
							<>
								<Link
									className="[&.active]:font-bold hover:underline"
									to="/statistics"
								>
									Статистика
								</Link>
								<Link
									className="[&.active]:font-bold hover:underline"
									to="/report"
								>
									Звіт
								</Link>
								<Link
									className="[&.active]:font-bold hover:underline"
									to="/applications"
								>
									Заяви
								</Link>
							</>
						)}
					</nav>
				)}
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
