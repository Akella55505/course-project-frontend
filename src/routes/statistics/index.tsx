import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

function RouteComponent(): ReactElement {
	return <h1 className="flex justify-center text-gray-800 text-2xl font-semibold">Оберіть вид статистики</h1>;
}

export const Route = createFileRoute("/statistics/")({
	component: RouteComponent,
});
