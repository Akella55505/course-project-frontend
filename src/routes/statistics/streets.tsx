import { createFileRoute } from '@tanstack/react-router'
import {
	AccidentsStatisticsStreetsPage
} from "../../features/accidents/pages/statistics/AccidentsStatisticsStreetsPage.tsx";

export const Route = createFileRoute('/statistics/streets')({
  component: AccidentsStatisticsStreetsPage,
})