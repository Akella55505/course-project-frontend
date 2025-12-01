import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAccident } from '../api';
import type { ReactElement } from "react";
import type { Accident} from "../types.ts";
import { AssessmentStatus, ConsiderationStatus } from "../types.ts";

const accidentSchema = z.object({
	date: z.string().regex(new RegExp("^\\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"), "Date must be in YYYY-MM-DD format"),
	media: z.string().refine((value) => {
		if (value === "") return true;
		try {
			JSON.parse(value);
			return true;
		} catch {
			return false;
		}
	}, "Media has to be a JSON"),
	location: z.string().min(3, 'Location is too short'),
	causes: z.string().min(3, 'Causes are too short'),
	considerationStatus: z.enum(ConsiderationStatus, "Invalid consideration status"),
	assessmentStatus: z.enum(AssessmentStatus, "Invalid assessment status"),
	type: z.string().min(3, 'Type is too short'),
	time: z.string().regex(new RegExp("^\\d{2}:\\d{2}:\\d{2}$"), "Time must be in HH:MM:SS format"),
});

type AccidentFormData = z.infer<typeof accidentSchema>;

export function AccidentCreatePage(): ReactElement {
	const createAccidentMutation = useCreateAccident();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<AccidentFormData>({
		resolver: zodResolver(accidentSchema),
	});

	const onSubmit = (data: AccidentFormData): void => {
		createAccidentMutation.mutate(data as unknown as Omit<Accident, "id">, {
			onSuccess: () => { reset(); },
		});
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Create New Accident</h1>
			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				<div>
					<label className="block font-medium" htmlFor="date">Date</label>
					<input id="date" {...register('date')} className="w-full p-2 border rounded" />
					{errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="media">Media</label>
					<input id="media" {...register('media')} className="w-full p-2 border rounded" />
					{errors.media && <p className="text-red-500 text-sm mt-1">{errors.media.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="location">Location</label>
					<input id="location" {...register('location')} className="w-full p-2 border rounded" />
					{errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="causes">Causes</label>
					<input id="causes" {...register('causes')} className="w-full p-2 border rounded" />
					{errors.causes && <p className="text-red-500 text-sm mt-1">{errors.causes.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="considerationStatus">Consideration status</label>
					<select id="considerationStatus" {...register('considerationStatus')} className="w-full p-2 border rounded">
						<option value="">Оберіть статус</option>
						{Object.entries(ConsiderationStatus).map(([key, value]) => (
							<option key={key} value={value}>{value}</option>
						))}
					</select>
					{errors.considerationStatus && <p className="text-red-500 text-sm mt-1">{errors.considerationStatus.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="assessmentStatus">Assessment status</label>
					<select id="assessmentStatus" {...register('assessmentStatus')} className="w-full p-2 border rounded">
						<option value="">Оберіть статус</option>
						{Object.entries(AssessmentStatus).map(([key, value]) => (
							<option key={key} value={value}>{value}</option>
						))}
					</select>
					{errors.assessmentStatus && <p className="text-red-500 text-sm mt-1">{errors.assessmentStatus.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="type">Type</label>
					<input id="type" {...register('type')} className="w-full p-2 border rounded" />
					{errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
				</div>

				<div>
					<label className="block font-medium" htmlFor="time">Time</label>
					<input id="time" {...register('time')} className="w-full p-2 border rounded" />
					{errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
				</div>

				<button
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
					disabled={createAccidentMutation.isPending}
					type="submit"
				>
					{createAccidentMutation.isPending ? 'Creating...' : 'Create Accident'}
				</button>
			</form>
		</div>
	);
}
