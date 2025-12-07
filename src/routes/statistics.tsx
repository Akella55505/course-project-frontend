import { createFileRoute } from "@tanstack/react-router";
import { AccidentsStatisticsPage } from "../features/accidents/pages/statistics/AccidentsStatisticsPage.tsx";

export const Route = createFileRoute("/statistics")({
	component: AccidentsStatisticsPage,
});
