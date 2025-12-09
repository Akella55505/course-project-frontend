import { createFileRoute } from '@tanstack/react-router'
import { VehicleCreatePage } from "../../../features/vehicles/pages/VehicleCreatePage.tsx";

export const Route = createFileRoute('/accidents_/new/vehicle')({
  component: VehicleCreatePage,
})
