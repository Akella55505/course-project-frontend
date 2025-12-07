import { createFileRoute } from '@tanstack/react-router'
import { AccidentsReportPage } from "../features/accidents/pages/AccidentsReportPage.tsx";

export const Route = createFileRoute('/report')({
  component: AccidentsReportPage,
})
