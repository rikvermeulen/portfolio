import Image from "next/image";

import type { PlantsProps } from "./Plants.types.ts";
import type { PlantaActionType } from "@/lib/planta/types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Icon from "@/components/Icon/index.ts";
import { isPlantaHappyHealth } from "@/lib/planta/plantCardFormat.ts";

const MAX_VISIBLE_PLANTS = 3 as const;

const ACTION_ICON_INDEX: Partial<
  Record<PlantaActionType, "watering-can" | "spray">
> = {
  watering: "watering-can",
  misting: "spray",
};

const Plants = ({ plants }: PlantsProps) => {
  const visiblePlants = plants.slice(0, MAX_VISIBLE_PLANTS);

  return (
    <Bento
      app="plants"
      sizes={bentoBoxSizes.plants}
      className="flex size-full flex-col justify-between gap-2 bg-ds-forest p-5 text-ds-forest-ink"
    >
      <h2 className="text-2xl font-semibold">Plant Care</h2>
      <ul className="flex flex-col gap-4">
        {visiblePlants.map((plant) => {
          const dueCareIcons =
            plant.dueCareActionTypes?.flatMap((actionType) => {
              const iconName = ACTION_ICON_INDEX[actionType];

              if (!iconName) {
                return [];
              }

              return [
                {
                  iconName,
                  label:
                    actionType === "watering"
                      ? `${plant.name} needs watering`
                      : `${plant.name} needs misting`,
                },
              ];
            }) ?? [];

          return (
            <li key={plant.id} className="flex items-center gap-2">
              {plant.imageUrl ? (
                <Image
                  alt={plant.name}
                  height={48}
                  sizes="48px"
                  src={plant.imageUrl}
                  width={48}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-ds-forest-ink uppercase">
                  {plant.name.slice(0, 2)}
                </div>
              )}
              <div className="flex justify-between gap-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <h3 className="text-sm font-medium">
                      {plant.scientificName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dueCareIcons.map(({ iconName, label }) => (
                      <Icon
                        key={`${plant.id}-${iconName}`}
                        iconClassName="size-3.5"
                        label={label}
                        name={iconName}
                        className="rounded-full bg-rose-500/35 p-1 text-rose-50"
                      />
                    ))}
                    {isPlantaHappyHealth(plant.health) ? (
                      <Icon
                        iconClassName="size-4"
                        label="Happy plant"
                        name="happy"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Bento>
  );
};

export default Plants;
