import {
  eslintConfig,
  eslintStorybookConfig,
} from "@greenberry/linting-config";

/**
 * Don't add rules here — edit @greenberry/linting-config instead.
 * Discuss with the team before adding project-specific overrides.
 */
export default [...eslintConfig, ...eslintStorybookConfig];
