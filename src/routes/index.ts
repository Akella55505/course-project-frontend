import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../features/home/pages/Home.tsx";

export const Route = createFileRoute("/")({
	component: Home,
});
