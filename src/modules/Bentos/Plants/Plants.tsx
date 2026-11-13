"use client";

import { useState } from "react";
import Image from "next/image";

import type { NudgeButtonProps, PlantsProps } from "./Plants.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Drawer from "@/components/Drawer/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { notify } from "@/components/Toast/index.ts";
import { getPlantaCardStatuses } from "@/lib/plants/plantCardFormat.ts";
import classnames from "@/utils/classnames/index.ts";

import PlantDetail from "./PlantDetail.tsx";
import {
  ACTION_TILE,
  HEALTHY_TILE,
  MAX_VISIBLE_PLANTS,
  NUDGE_TOAST,
} from "./Plants.const.ts";

/**
 * Bottom-right nudge button — lets a visitor ping Rik that his plants need
 * care. Optimistically toasts on click, then fires a best-effort POST: a
 * notification hiccup must never make the button feel broken, so failures are
 * logged and the toast stays.
 */
function NudgeButton({ onRemind }: NudgeButtonProps) {
  const [pending, setPending] = useState(false);

  const nudgeRik = async () => {
    setPending(true);
    notify({ app: "plants", ...NUDGE_TOAST });

    try {
      const { ok } = await onRemind();
      if (!ok) {
        console.error("Plant nudge failed");
      }
    } catch (error) {
      console.error("Plant nudge request failed:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      aria-label="Let Rik know his plants need attention"
      disabled={pending}
      onClick={() => void nudgeRik()}
      type="button"
      className="absolute right-5 bottom-5 z-20 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white"
    >
      <Glass intensity={2} radius={18} tint="none" className="bg-white/15" />
      <Icon iconClassName="relative z-10 size-4" name="bell" />
    </button>
  );
}

const Plants = ({ sizeKey, plants, onRemind }: PlantsProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = plants.find((plant) => plant.id === selectedId) ?? null;

  return (
    <Bento
      app="plants"
      sizes={bentos[sizeKey].sizes}
      surfaceClassName="bg-linear-to-b from-ds-forest-from to-ds-forest-to"
      className="relative z-0 text-ds-forest-ink"
    >
      <div className="flex size-full flex-col gap-3 p-5">
        <h2 className="bento-title">Plant Care</h2>
        <ul className="flex flex-1 flex-col justify-center gap-2.5">
          {plants.slice(0, MAX_VISIBLE_PLANTS).map((plant) => (
            <li key={plant.id}>
              <button
                aria-haspopup="dialog"
                aria-label={`View care details for ${plant.name}`}
                onClick={() => setSelectedId(plant.id)}
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-2xl text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/60"
              >
                {plant.imageUrl && (
                  <Image
                    alt=""
                    height={56}
                    sizes="56px"
                    src={plant.imageUrl}
                    width={56}
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="flex min-w-0 flex-col">
                  <h3 className="bento-body max-w-42 truncate font-bold">
                    {plant.name}
                  </h3>
                  <div className="relative z-10 flex flex-wrap gap-2 p-1">
                    {getPlantaCardStatuses(plant).map((status) => {
                      const tile = status.actionType
                        ? ACTION_TILE[status.actionType]
                        : HEALTHY_TILE;

                      return (
                        <div
                          key={`${status.state}-${status.label}`}
                          className={classnames(
                            "relative flex size-5 shrink-0 items-center justify-center rounded-full border-[0.5px] border-white text-white",
                            tile.bg,
                          )}
                        >
                          <Icon
                            iconClassName="size-3"
                            label={status.label}
                            name={tile.icon}
                          />
                          {status.state !== "due" && (
                            <span className="absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full border-[0.5px] border-white bg-ds-plant-done p-0.5 text-white">
                              <Icon iconClassName="size-2.5" name="check" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <NudgeButton onRemind={onRemind} />
      <Drawer
        description={selected?.scientificName}
        isOpen={selected !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title={selected?.name ?? "Plant"}
      >
        {selected && <PlantDetail plant={selected} />}
      </Drawer>
    </Bento>
  );
};

export default Plants;
