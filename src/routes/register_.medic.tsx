import { createFileRoute } from '@tanstack/react-router'
import { MedicRegisterPage } from "../features/medic/pages/MedicRegisterPage.tsx";

export const Route = createFileRoute('/register_/medic')({
  component: MedicRegisterPage,
})