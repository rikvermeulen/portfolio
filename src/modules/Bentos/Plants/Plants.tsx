import Image from "next/image";

import type { PlantsProps } from "./Plants.types.ts";
import type { IconName } from "@/components/Icon/index.ts";
import type { PlantaCareState } from "@/lib/plants/plantCardFormat.ts";
import type { PlantaActionType } from "@/vendors/planta/types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { getPlantaCardStatuses } from "@/lib/plants/plantCardFormat.ts";

const MAX_VISIBLE_PLANTS = 3 as const;

interface ActionTile {
  readonly bg: string;
  readonly icon: IconName;
}

/** Care action → its tile colour + icon (one tint per action type). */
const ACTION_TILE: Record<PlantaActionType, ActionTile> = {
  watering: { bg: "bg-ds-plant-water", icon: "watering-can" },
  misting: { bg: "bg-ds-plant-mist", icon: "spray" },
  fertilizing: { bg: "bg-ds-plant-fertilize", icon: "flower" },
  cleaning: { bg: "bg-ds-plant-clean", icon: "brush" },
  repotting: { bg: "bg-ds-plant-repot", icon: "trowel" },
  progressUpdate: { bg: "bg-ds-plant-water", icon: "timer" },
};

/** Fallback tile when a status has no action (a plant that's simply doing well). */
const HEALTHY_TILE: ActionTile = { bg: "bg-ds-plant-done", icon: "heart" };

const tileForStatus = (actionType?: PlantaActionType): ActionTile =>
  actionType ? ACTION_TILE[actionType] : HEALTHY_TILE;

/** A `due` status still needs doing; everything else is up to date → checkmark. */
const isDone = (state: PlantaCareState): boolean => state !== "due";

const TILE_BASE =
  "relative flex size-7 shrink-0 items-center justify-center rounded-full text-white";

const Plants = ({ sizeKey, plants }: PlantsProps) => {
  const visiblePlants = plants.slice(0, MAX_VISIBLE_PLANTS);

  return (
    <Bento
      app="plants"
      sizes={bentos[sizeKey].sizes}
      className="relative z-0 text-ds-forest-ink"
    >
      <Glass
        intensity={1}
        radius={24}
        tint="none"
        className="-z-10 bg-linear-to-b from-ds-forest-from to-ds-forest-to"
      />
      <div className="flex size-full flex-col gap-3 p-5">
        <h2 className="text-2xl font-semibold">Plant Care</h2>
        <ul className="flex flex-1 flex-col gap-2.5">
          {visiblePlants.map((plant) => {
            const statuses = getPlantaCardStatuses(plant);

            return (
              <li key={plant.id} className="flex items-center gap-2">
                {plant.imageUrl ? (
                  <Image
                    alt={plant.name}
                    height={56}
                    sizes="56px"
                    src={plant.imageUrl}
                    width={56}
                    className="size-14 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-ds-forest-ink uppercase">
                    {plant.name.slice(0, 2)}
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-sm font-semibold">
                    {plant.name}
                  </h3>

                  <div className="relative z-10 flex flex-wrap gap-2 p-1">
                    {statuses.map((status) => {
                      const tile = tileForStatus(status.actionType);
                      const done = isDone(status.state);
                      const key = `${plant.id}-${status.state}-${status.label}`;
                      const tileClassName = `${TILE_BASE} ${tile.bg}`;

                      return (
                        <div key={key} className={tileClassName}>
                          <Icon
                            iconClassName="size-4"
                            label={status.label}
                            name={tile.icon}
                          />
                          {done ? (
                            <span className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-ds-plant-done text-white ring-2 ring-ds-forest-to">
                              <Icon iconClassName="size-2.5" name="check" />
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Bento>
  );
};

export default Plants;
