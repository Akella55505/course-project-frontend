import type { ReactNode, ReactElement} from "react";
import { useEffect } from "react";
import { RoundedButton } from "./RoundedButton";

interface PopupProps {
	open: boolean;
	children: ReactNode;
	error?: string | null;
	onCancel: () => void;
	onSubmit: () => void;
}

const LockScroll = (): null => {
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return (): void => { document.body.style.overflow = ""; };
	}, []);
	return null;
};

export const Popup = ({
												open,
												children,
												error,
												onCancel,
												onSubmit,
											}: PopupProps): ReactElement | null => {
	if (!open) return null;

	return (
		<>
			<LockScroll />
			<div className="z-50 fixed inset-0 bg-black/50 flex items-center justify-center">
				<div className="bg-white p-6 rounded-lg shadow-md w-80 space-y-4">
					{children}

					{error && (
						<div className="text-red-600 text-sm">
							{error}
						</div>
					)}

					<div className="flex justify-end space-x-2">
						<RoundedButton variant="red" onClick={onCancel}>
							Скасувати
						</RoundedButton>
						<RoundedButton variant="blue" onClick={onSubmit}>
							Підтвердити
						</RoundedButton>
					</div>
				</div>
			</div>
		</>
	);
};