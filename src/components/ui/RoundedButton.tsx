import type { ReactNode, ButtonHTMLAttributes, ReactElement } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: 'grey' | 'blue' | 'red' | 'green';
	size?: 'large' | 'default';
}

export const RoundedButton = ({ children, className = "", variant = "grey", size = 'default', ...props }: ButtonProps): ReactElement => {
	const baseClasses = "rounded shadow-sm transition-transform duration-150 ease-in-out cursor-pointer hover:scale-105";
	let variantClasses = '';
	switch (variant) {
		case "grey":
		{
			variantClasses = "bg-gray-200 hover:bg-gray-300";
			break;
		}
		case "blue":
		{
			variantClasses = "bg-blue-500 hover:bg-blue-600 text-white";
			break;
		}
		case "red":
		{
			variantClasses = "bg-red-600 hover:bg-red-700 text-white";
			break;
		}
		case "green":
		{
			variantClasses = "bg-green-400 hover:bg-green-500 text-white";
			break;
		}
	}

	let sizeClasses = '';
	switch (size) {
		case "default":
		{
			sizeClasses = "px-3 py-1";
			break;
		}
		case "large":
		{
			sizeClasses = "p-2";
			break;
		}
	}

	return (
		<button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
			{children}
		</button>
	);
};
