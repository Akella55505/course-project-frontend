import { createFileRoute } from '@tanstack/react-router'
import { UserListPage } from "../features/user/pages/UserListPage";

export const Route = createFileRoute('/user')({
    component: UserListPage,
})
