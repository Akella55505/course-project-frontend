import { createFileRoute } from '@tanstack/react-router'
import { UserCreateApplicationPage } from "../features/user/pages/UserCreateApplicationPage.tsx";

export const Route = createFileRoute('/user_/form')({
  component: UserCreateApplicationPage,
})