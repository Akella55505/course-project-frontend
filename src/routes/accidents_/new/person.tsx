import { createFileRoute } from "@tanstack/react-router";
import { PersonCreatePage } from "../../../features/persons/pages/PersonCreatePage.tsx";

export const Route = createFileRoute("/accidents_/new/person")({
	component: PersonCreatePage,
});