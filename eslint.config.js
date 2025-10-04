import { eslintConfig } from "@greenberry/linting-config";

/**
 * Don't add any rules here, edited the linting-config package instead. Please discuss with the team before adding any rules.
 */
const config = [...eslintConfig, { ignores: [".contentlayer"] }];

export default config;
