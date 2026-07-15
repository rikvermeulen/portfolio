import type { PlantsProps } from "./Plants.types.ts";
import type { PlantaPlantCardData } from "@/lib/plants/types.ts";

const mockPlants: readonly PlantaPlantCardData[] = [
  {
    id: "plant-1",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    health: "needs attention",
    siteName: "Living room",
    imageUrl: "/images/icons/light/planta.png",
    dueCareActionTypes: ["watering"],
    nextActionType: "fertilizing",
    daysUntilNextAction: 5,
  },
  {
    id: "plant-2",
    name: "Calathea",
    scientificName: "Calathea orbifolia",
    health: "happy",
    siteName: "Studio",
    nextActionType: "misting",
    daysUntilNextAction: 3,
  },
  {
    id: "plant-3",
    name: "Pilea",
    scientificName: "Pilea peperomioides",
    health: "thriving",
    siteName: "Kitchen",
    nextActionType: "repotting",
    daysUntilNextAction: 12,
  },
];

export const mockPlantsProps = {
  sizeKey: "plants",
  plants: mockPlants,
} satisfies PlantsProps;
