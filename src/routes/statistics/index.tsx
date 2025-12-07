import { createFileRoute } from '@tanstack/react-router'
import { AccidentsStatisticsMainPage } from "../../features/accidents/pages/statistics/AccidentsStatisticsMainPage.tsx";

export const Route = createFileRoute('/statistics/')({
  component: AccidentsStatisticsMainPage,
})