import type { FunctionComponent } from "../../../common/types.ts";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Home = (): FunctionComponent => {
	const navigate = useNavigate();

	useEffect(() => {
		void navigate({ to: "/login" });
	}, [navigate]);

	return null;
};