import { createFileRoute } from '@tanstack/react-router'
import { PolicemanRegisterPage } from "../features/policeman/pages/PolicemanRegisterPage.tsx";

export const Route = createFileRoute('/register_/police')({
  component: PolicemanRegisterPage,
})