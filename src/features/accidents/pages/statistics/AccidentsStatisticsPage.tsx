import {
	Outlet, useLocation,
	useNavigate,
} from "@tanstack/react-router";
import type { ReactElement} from "react";
import type React from "react";

export function AccidentsStatisticsPage(): ReactElement {
	const location = useLocation();
	const navigate = useNavigate();

	const handleChange = async (
		event_: React.ChangeEvent<HTMLSelectElement>
	): Promise<void> => {
		const v = event_.target.value;
		await navigate({ to: `/statistics/${v}` });
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Статистика</h1>
			<div className="max-w-sm mb-4">
				<select
					className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
					value={location.pathname.split("/statistics")[1]}
					onChange={handleChange}
				>
					<option disabled value="">Оберіть вид</option>
					<option value="/main">Загальна</option>
					<option value="/streets">За вулицями</option>
					<option value="/previous-quarter">За минулий квартал</option>
				</select>
			</div>
			<Outlet />
		</div>
	);
}
