import { createFileRoute } from "@tanstack/react-router";
import { PersonViewPage } from "../features/persons/pages/PersonViewPage.tsx";

export const Route = createFileRoute("/persons/$personId")({
	component: PersonViewPage,
});
