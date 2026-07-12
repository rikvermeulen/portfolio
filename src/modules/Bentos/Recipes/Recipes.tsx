"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { FlipDirection } from "./Recipes.animate.ts";
import type { RecipesProps, RecipeStackProps } from "./Recipes.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import Link from "@/components/Link/index.ts";

import { cardTransition, cardVariants } from "./Recipes.animate.ts";

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, var(--color-ds-recipe-1) 0%, var(--color-ds-recipe-2) 50%, var(--color-ds-recipe-3) 100%)";

const STACK_STYLES = [
  {
    background: "var(--color-ds-stack-1)",
    transform: "rotate(-1.5deg) scale(0.97)",
  },
  {
    background: "var(--color-ds-stack-2)",
    transform: "rotate(-3deg) scale(0.94)",
  },
] as const;

const Recipes = ({ recipes }: RecipesProps) => {
  return (
    <Bento
      app="recipes"
      href="https://picnic.app"
      sizes={bentoBoxSizes.recipes}
      className="size-full p-0"
    >
      <RecipeStack recipes={recipes} />
    </Bento>
  );
};

function RecipeStack({ recipes }: RecipeStackProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<FlipDirection>(1);
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const prefersReducedMotion = useReducedMotion();

  // Warm the browser cache for every recipe cover up front so switching swaps
  // in an already-decoded image instead of loading it in mid-animation.
  useEffect(() => {
    for (const { imageUrl } of recipes) {
      if (imageUrl) {
        const img = new window.Image();
        img.src = imageUrl;
      }
    }
  }, [recipes]);

  const switchRecipe = useCallback(
    (nextDirection: FlipDirection) => {
      if (recipes.length <= 1) {
        return;
      }

      setDirection(nextDirection);
      setIndex((current) => {
        if (nextDirection === 1) {
          return (current + 1) % recipes.length;
        }

        return (current - 1 + recipes.length) % recipes.length;
      });
    },
    [recipes.length],
  );

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

      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={index}
          animate="center"
          custom={direction}
          exit="exit"
          initial="enter"
          style={{ backgroundImage: showImage ? undefined : FALLBACK_GRADIENT }}
          transition={
            prefersReducedMotion ? { duration: 0.15 } : cardTransition
          }
          variants={prefersReducedMotion ? undefined : cardVariants}
          className="absolute inset-0 overflow-hidden rounded-2xl bg-neutral-900"
        >
          {showImage && imageUrl && (
            <Image
              alt={recipe.title}
              fill
              onError={() =>
                setFailedIds((prev) => new Set([...prev, recipe.id]))
              }
              src={imageUrl}
              unoptimized
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-5 left-5 text-white">
            <h3 className="text-2xl font-bold text-shadow-sm">My Recipes</h3>
            <p className="relative text-xs text-shadow-sm">{title}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute right-4 bottom-4 left-4 z-10 flex flex-col justify-between gap-2">
        <div className="flex flex-col text-xs font-medium text-white/90">
          {servings != null && (
            <span className="flex items-center gap-1">
              {servings}
              <Icon
                iconClassName="relative size-3.5 text-white"
                name="persons"
              />
            </span>
          )}
          {totalMinutes != null && (
            <span className="flex items-center gap-1">
              {totalMinutes} min{" "}
              <Icon iconClassName="relative size-3.5 text-white" name="timer" />
            </span>
          )}
        </div>
        <div className="flex w-full justify-between gap-2">
          <div className="relative flex overflow-hidden rounded-full">
            <Glass intensity={2} interactive radius={999} />
            <button
              aria-label="Previous recipe"
              disabled={recipes.length <= 1}
              onClick={() => switchRecipe(-1)}
              type="button"
              className="relative flex size-9 items-center justify-center text-white transition-transform active:scale-90 disabled:opacity-40"
            >
              <Icon
                iconClassName="relative size-4 text-white"
                name="chevronUp"
              />
            </button>
            <button
              aria-label="Next recipe"
              disabled={recipes.length <= 1}
              onClick={() => switchRecipe(1)}
              type="button"
              className="relative flex size-9 items-center justify-center text-white transition-transform active:scale-90 disabled:opacity-40"
            >
              <Icon
                iconClassName="relative size-4 text-white"
                name="chevronDown"
              />
            </button>
          </div>
          <Link
            aria-label={`Open ${title}`}
            href={recipeUrl}
            className="group relative flex size-9 shrink-0 items-center justify-center transition-transform active:scale-90"
          >
            <Glass interactive radius={999} />
            <Icon iconClassName="relative size-3.5 text-white" name="plus" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Recipes;
