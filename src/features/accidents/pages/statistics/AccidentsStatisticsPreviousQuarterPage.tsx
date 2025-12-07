import type { ReactElement} from "react";
import { useState } from "react";
import React from "react";
import { useStatisticsPreviousQuarter } from "../../api.ts";
import { loadingAnimation } from "../../../../common/elements.tsx";
import { RoundedButton } from "../../../../components/ui/RoundedButton.tsx";

export function AccidentsStatisticsPreviousQuarterPage(): ReactElement {
	const [ pageIndex, setPageIndex ] = useState<number>(0);
	const statistics = useStatisticsPreviousQuarter(pageIndex);

	if (statistics.isLoading) return loadingAnimation();

	const statisticsData = statistics.data;
	if (statisticsData === undefined) return <h1 className="text-red-600 text-2xl font-bold flex justify-center">ПОМИЛКА ПОШУКУ ДАНИХ</h1>;

	const nextPage = (): void =>
	{ setPageIndex(pageIndex + 1); };

	const previousPage = (): void =>
	{ setPageIndex(Math.max(0, pageIndex - 1)); };

	return (
		<div>
			<div className="flex gap-4 mb-4 mt-4 items-center">
				<RoundedButton onClick={previousPage}>
					&lt;
				</RoundedButton>

				<span>Сторінка {pageIndex + 1}</span>

				<RoundedButton onClick={nextPage}>
					&gt;
				</RoundedButton>
			</div>
			<table className="w-full table-auto border border-gray-300 rounded-lg overflow-hidden shadow-sm">
				<thead className="border-b border-gray-300">
				<tr className="bg-gray-200 text-left uppercase text-sm font-semibold text-gray-700 divide-x divide-gray-300">
					<th className="px-4 py-2">Тип</th>
					<th className="px-4 py-2">Кількість випадків</th>
					<th className="px-4 py-2">Кількість потерпілих</th>
					<th className="px-4 py-2">Виплачено</th>
				</tr>
				</thead>
				<tbody className="divide-y  divide-x divide-gray-300">
				{statisticsData.map((accumulator) => {
					return (
						<React.Fragment key={accumulator.accidentType}>
							<tr className="border-b hover:bg-gray-50 divide-x divide-gray-300">
								<td className="px-4 py-2">{accumulator.accidentType}</td>
								<td className="px-4 py-2">{accumulator.accidentCount}</td>
								<td className="px-4 py-2">{accumulator.victimCount}</td>
								<td className="px-4 py-2">{accumulator.paymentAmount / 100 + " UAH"}</td>
							</tr>
						</React.Fragment>
					);
				})}
				</tbody>
			</table>
		</div>
	);
}
