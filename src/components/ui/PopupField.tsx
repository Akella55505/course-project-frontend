import type { ReactElement, ReactNode } from "react";

interface FieldProps {
	label: string;
	children: ReactNode;
}

export const PopupField = ({ label, children }: FieldProps): ReactElement => {
	return (
		<div className="space-y-1">
			<label className="font-semibold">{label}</label>
			{children}
		</div>
	);
};