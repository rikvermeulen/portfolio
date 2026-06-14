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

const Plants = ({ plants, errorMessage }: PlantsProps) => {
  const visiblePlants = plants.slice(0, MAX_VISIBLE_PLANTS);

  return (
    <Bento
      image="/images/icons/planta.png"
      sizes={bentoBoxSizes.plants}
      className="flex size-full flex-col justify-between gap-2 bg-[#234823] p-5 text-[#e7edde]"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Plant Care</h2>
        {errorMessage ? (
          <p className="max-w-xs text-sm text-[#f3d6d6]">{errorMessage}</p>
        ) : null}
      </div>
      {visiblePlants.length > 0 ? (
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
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-[#e7edde] uppercase">
                    {plant.name.slice(0, 2)}
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <div className="flex flex-col gap-2">
                    <div>
                      <h3 className="text-sm font-medium">
                        {plant.scientificName}
                      </h3>
                      {/* <p className="text-[10px]">{plant.siteName}</p> */}
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
      ) : (
        <p className="text-sm text-[#cfe0cc]">
          {errorMessage ?? "No Planta plants available right now."}
        </p>
      )}
    </Bento>
  );
};

export default Plants;
