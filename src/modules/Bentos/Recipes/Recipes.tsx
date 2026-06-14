"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { RecipesProps } from "./Recipes.types.ts";

import PlusIcon from "@/assets/icons/plus.svg";
import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Link from "@/components/Link/index.ts";

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
const FLIP_MS = 200;

type FlipPhase = "idle" | "out" | "in";

const STACK_STYLES = [
  { background: "#525252", transform: "rotate(-1.5deg) scale(0.97)" },
  { background: "#404040", transform: "rotate(-3deg) scale(0.94)" },
] as const;

const Recipes = ({ recipes, errorMessage }: RecipesProps) => {
  const isEmpty = recipes.length === 0;

  if (errorMessage || isEmpty) {
    return (
      <Bento
        sizes={bentoBoxSizes.recipes}
        className="flex size-full items-center justify-center bg-neutral-900 p-5"
      >
        <p className="text-xs text-white/50">
          {errorMessage ?? "No saved recipes found."}
        </p>
      </Bento>
    );
  }

  return (
    <Bento
      href="https://picnic.app"
      image="/images/icons/picnic.png"
      sizes={bentoBoxSizes.recipes}
      className="size-full p-0"
    >
      <RecipeStack recipes={recipes} />
    </Bento>
  );
};

interface RecipeStackProps {
  readonly recipes: RecipesProps["recipes"];
}

function RecipeStack({ recipes }: RecipeStackProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<FlipPhase>("idle");
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const advance = useCallback(() => {
    if (phase !== "idle" || recipes.length <= 1) {
      return;
    }

    setPhase("out");
    timerRef.current = setTimeout(() => {
      setIndex((current) => (current + 1) % recipes.length);
      setPhase("in");
      timerRef.current = setTimeout(() => setPhase("idle"), FLIP_MS);
    }, FLIP_MS);
  }, [phase, recipes.length]);

  const recipe = recipes[index];

  if (!recipe) {
    return null;
  }

  const { title, servings, totalMinutes, recipeUrl, imageUrl, id } = recipe;

  const stackDepth = Math.min(recipes.length - 1, 2);
  const showImage = Boolean(imageUrl) && !failedIds.has(id);

  return (
    <div className="relative z-0 size-full">
      {STACK_STYLES.slice(0, stackDepth).map((style) => (
        <div
          key={style.background}
          aria-hidden
          style={style}
          className="absolute inset-0 rounded-2xl"
        />
      ))}

      <div
        style={{
          backgroundImage: showImage ? undefined : FALLBACK_GRADIENT,
          transform: `perspective(1000px) rotateY(${phase === "out" ? -90 : 0}deg)`,
          transition:
            phase === "idle"
              ? "none"
              : `transform ${FLIP_MS}ms ${phase === "out" ? "ease-in" : "ease-out"}`,
        }}
        className="absolute inset-0 overflow-hidden rounded-2xl bg-neutral-900"
      >
        {showImage && (
          <Image
            alt={recipe.title}
            fill
            onError={() =>
              setFailedIds((prev) => new Set([...prev, recipe.id]))
            }
            src={recipe.imageUrl!}
            unoptimized
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-5 left-5 text-white">
          <h3 className="text-2xl font-bold text-shadow-sm">My Recipes</h3>
          <p className="relative text-xs text-shadow-sm">{title}</p>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between">
        <Link
          href={recipeUrl}
          className="flex flex-col gap-0.5 text-sm font-medium text-white/90"
        >
          {servings != null && <span>{servings} persons</span>}
          {totalMinutes != null && <span>{totalMinutes} min</span>}
        </Link>

        <button
          aria-label="Next recipe"
          disabled={recipes.length <= 1 || phase !== "idle"}
          onClick={advance}
          className="group relative flex size-8 shrink-0 items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
        >
          <Glass radius={999} />
          <PlusIcon aria-hidden className="relative size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Recipes;
