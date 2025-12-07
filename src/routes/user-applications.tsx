import { createFileRoute } from '@tanstack/react-router'
import { UserApplicationsListPage } from "../features/user/pages/UserApplicationsListPage.tsx";

export const Route = createFileRoute('/user-applications')({
  component: UserApplicationsListPage,
})
