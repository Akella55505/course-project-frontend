import type { ReactElement} from "react";
import { useState } from "react";
import { useUpdateUserApplication, useUserApplications } from "../api.ts";
import { RoundedButton } from "../../../components/ui/RoundedButton.tsx";

export function UserApplicationsListPage(): ReactElement {
	const [ pageIndex, setPageIndex ] = useState<number>(0);
	const applications = useUserApplications(pageIndex);
	const updateApplication = useUpdateUserApplication();

	const applicationsData = applications.data;
	const dataIsPresent = applicationsData !== undefined && applicationsData.length > 0;

	const nextPage = (): void =>
	{ setPageIndex(pageIndex + 1); };

	const previousPage = (): void =>
	{ setPageIndex(Math.max(0, pageIndex - 1)); };

	const formatDate = (date: string): string => {
		const [year, month, day] = date.split("-");
		// @ts-expect-error Always defined
		return `${day}.${month}.${year.slice(-2)}`;
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Заяви</h1>
			<div className="flex gap-4 mb-4 mt-4 items-center">
				<RoundedButton onClick={previousPage}>&lt;</RoundedButton>

				<span>Сторінка {pageIndex + 1}</span>

				<RoundedButton onClick={nextPage}>&gt;</RoundedButton>
			</div>
			{!dataIsPresent && (
				<h1 className="flex justify-center text-gray-800 text-2xl font-semibold">
					Немає заяв
				</h1>
			)}
			<div className="space-y-6">
				{applicationsData?.map((accumulator) => (
					<div
						key={accumulator.id}
						className="border border-gray-200 rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition-shadow"
					>
						<div className="grid grid-cols-2 gap-6 mb-6 text-gray-700 border-b border-gray-200 pb-4">
							<div className="space-y-2">
								<div className="font-semibold text-gray-900">Дата</div>
								<div>{formatDate(accumulator.date)}</div>
							</div>

							<div className="space-y-2">
								<div className="font-semibold text-gray-900">Час</div>
								<div>{accumulator.time.substring(0, 5)}</div>
							</div>

							<div className="space-y-2">
								<div className="font-semibold text-gray-900">Адреса</div>
								<div>
									{accumulator.addressStreet}, {accumulator.addressNumber}
								</div>
							</div>

							<div className="space-y-2">
								<div className="font-semibold text-gray-900">Номерний знак</div>
								<div>{accumulator.licensePlate}</div>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-6 text-gray-700 text-sm ">
							<div className="space-y-2 border-b border-gray-100 pb-4">
								<div className="font-semibold mb-2 text-gray-900">
									ПІБ відправника
								</div>
								<div>
									{accumulator.surname} {accumulator.name} {accumulator.patronymic}
								</div>
							</div>

							<div className="space-y-2 border-b border-gray-100 pb-4">
								<div className="font-semibold mb-2 text-gray-900">
									Паспортні дані відправника
								</div>
								<div>
									{accumulator.passportDetails.series} {accumulator.passportDetails.id}
								</div>
							</div>

							<div className="space-y-2 border-b border-gray-100 pb-4">
								<div className="font-semibold mb-2 text-gray-900">
									Імейл відправника
								</div>
								<div>{accumulator.senderEmail}</div>
							</div>
						</div>

						<div className="flex gap-4 pt-4 border-t border-gray-200">
							<RoundedButton
								variant="blue"
								onClick={() => {
									updateApplication.mutate({ id: accumulator.id, declined: false });
								}}
							>
								Прийняти
							</RoundedButton>
							<RoundedButton
								variant="red"
								onClick={() => {
									updateApplication.mutate({ id: accumulator.id, declined: true });
								}}
							>Відхилити
							</RoundedButton>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
