import { createFileRoute } from '@tanstack/react-router'
import {
	AccidentsStatisticsPreviousQuarterPage
} from "../../features/accidents/pages/statistics/AccidentsStatisticsPreviousQuarterPage.tsx";

export const Route = createFileRoute('/statistics/previous-quarter')({
  component: AccidentsStatisticsPreviousQuarterPage,
})
