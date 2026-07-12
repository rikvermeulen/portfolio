import type { PlantsProps } from "./Plants.types.ts";
import type { PlantaPlantCardData } from "@/lib/planta/types.ts";

const mockPlants: readonly PlantaPlantCardData[] = [
  {
    id: "plant-1",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    health: "needs attention",
    siteName: "Living room",
    imageUrl: "/images/icons/light/planta.png",
    dueCareActionTypes: ["watering"],
  },
  {
    id: "plant-2",
    name: "Calathea",
    scientificName: "Calathea orbifolia",
    health: "steady",
    siteName: "Studio",
    dueCareActionTypes: ["misting"],
  },
  {
    id: "plant-3",
    name: "Pilea",
    scientificName: "Pilea peperomioides",
    health: "steady",
    siteName: "Kitchen",
  },
];

export const mockPlantsProps = {
  plants: mockPlants,
} satisfies PlantsProps;
