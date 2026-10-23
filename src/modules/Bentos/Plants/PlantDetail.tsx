import Image from "next/image";

import type { PlantDetailProps } from "./Plants.types.ts";

import Icon from "@/components/Icon/index.ts";
import {
  formatPlantaDueText,
  getPlantaCardStatuses,
  isPlantaHappyHealth,
} from "@/lib/plants/plantCardFormat.ts";
import { actionLabels } from "@/lib/plants/selectors.ts";
import classnames from "@/utils/classnames/index.ts";

import { ACTION_TILE, HEALTHY_TILE } from "./Plants.const.ts";

/**
 * Compact plant detail rendered inside the drawer, laid out like the Planta app
 * screen: a hero image with location/health pills, a next-action + attention
 * card row, and a "Today" task list. Built from card data only (no raw Planta
 * history), so the task list mirrors what the bento already surfaces.
 */
const PlantDetail = ({ plant }: PlantDetailProps) => {
  const statuses = getPlantaCardStatuses(plant);
  const dueStatuses = statuses.filter((status) => status.state === "due");
  const healthy = isPlantaHappyHealth(plant.health);
  const needsAttention = dueStatuses.length > 0 || (!!plant.health && !healthy);

  const attentionText =
    dueStatuses.length > 0
      ? `Needs ${dueStatuses
          .map((status) =>
            status.actionType
              ? actionLabels[status.actionType].toLowerCase()
              : "care",
          )
          .join(", ")}`
      : plant.health;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
        {plant.imageUrl ? (
          <Image
            alt={plant.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            src={plant.imageUrl}
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-ds-plant-done/30 to-white/5 text-white/70">
            <Icon iconClassName="size-8" name="flower" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1.5 bg-linear-to-t from-black/70 via-black/25 to-transparent p-2.5 pt-8">
          {plant.siteName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Icon iconClassName="size-3.5" name="map" />
              {plant.siteName}
            </span>
          )}
          {plant.health && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
              <span
                aria-hidden
                className={classnames(
                  "size-1.5 rounded-full",
                  healthy ? "bg-ds-plant-done" : "bg-ds-plant-fertilize",
                )}
              />
              {plant.health}
            </span>
          )}
        </div>
      </div>

      {(plant.nextActionType || needsAttention) && (
        <div className="flex gap-2">
          {plant.nextActionType && (
            <div className="flex-1 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <p className="text-xs text-white/50">
                Next {actionLabels[plant.nextActionType].toLowerCase()}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white first-letter:uppercase">
                {formatPlantaDueText(plant.daysUntilNextAction)}
              </p>
            </div>
          )}
          {needsAttention && (
            <div className="flex-1 rounded-2xl bg-ds-plant-mist/20 p-3 ring-1 ring-ds-plant-mist/30">
              <p className="text-xs font-medium text-ds-plant-mist">Heads up</p>
              <p className="mt-0.5 text-sm font-semibold text-white first-letter:uppercase">
                {attentionText}
              </p>
            </div>
          )}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="bento-eyebrow px-1 text-white/60">Today</h3>
        <ul className="flex flex-col gap-1.5">
          {statuses.map((status) => {
            const tile = status.actionType
              ? ACTION_TILE[status.actionType]
              : HEALTHY_TILE;
            const due = status.state === "due";

            return (
              <li
                key={`${status.state}-${status.label}`}
                className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
              >
                <span
                  className={classnames(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-white",
                    tile.bg,
                  )}
                >
                  <Icon iconClassName="size-4.5" name={tile.icon} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {status.label}
                </span>
                {due ? (
                  <span className="shrink-0 rounded-full bg-ds-plant-mist/20 px-2 py-0.5 text-[11px] font-semibold text-ds-plant-mist">
                    Due
                  </span>
                ) : (
                  <Icon
                    iconClassName="size-5 shrink-0 text-ds-plant-done"
                    name="check"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default PlantDetail;
