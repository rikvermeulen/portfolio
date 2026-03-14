import { componentGenerator } from "./scripts/plop/generators/components.js";
import { moduleGenerator } from "./scripts/plop/generators/modules.js";
import { utilGenerator } from "./scripts/plop/generators/utils.js";

/**
 * Registers custom Plop actions and generators.
 *
 * @param {import('plop').NodePlopAPI} plop - The Plop API for registering generators and helpers.
 */
function plop(plop) {
  // Define generators
  registerGenerators(plop);
}

/**
 * Registers Plop generators for components and sections.
 *
 * @param {import('plop').NodePlopAPI} plop - The Plop API for registering generators.
 */
function registerGenerators(plop) {
  componentGenerator(plop);
  moduleGenerator(plop);
  utilGenerator(plop);
}

export default plop;
