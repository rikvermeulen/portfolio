import { existsSync, readdirSync, statSync } from "fs";
import path from "path";

const CAMEL_CASE_AND_LETTER_FIRST_REGEX = /^[a-z][a-zA-Z0-9]*$/;
const ALPHANUMERIC_WITH_UNDERSCORES_AND_HYPHENS_REGEX = /^[a-zA-Z0-9_-]+$/;

const CREATE_NEW_CATEGORY = "Create new category";

/**
 * @param {import('plop').NodePlopAPI} plop - The Plop API for registering generators and helpers.
 */
export const utilGenerator = (plop) => {
  plop.setGenerator("util", {
    description: "Create a new utility function",
    prompts: [
      {
        type: "list",
        name: "existingCategory",
        message: `Select an existing category or choose "${CREATE_NEW_CATEGORY}":`,
        choices: () => {
          const utilsDir = path.join(process.cwd(), "src/utils");
          if (!existsSync(utilsDir)) {
            return [CREATE_NEW_CATEGORY];
          }
          const categories = readdirSync(utilsDir).filter((file) =>
            statSync(path.join(utilsDir, file)).isDirectory(),
          );
          return [...categories, CREATE_NEW_CATEGORY];
        },
      },
      {
        type: "input",
        name: "newCategory",
        message: "Enter the new category name:",
        when: (answers) => answers.existingCategory === CREATE_NEW_CATEGORY,
        validate: (input) => {
          if (ALPHANUMERIC_WITH_UNDERSCORES_AND_HYPHENS_REGEX.test(input)) {
            return true;
          }
          return "Category name must be alphanumeric and can include underscores or hyphens.";
        },
      },
      {
        type: "input",
        name: "name",
        message: "Utility function name (camelCase):",
        validate: (input) => {
          if (CAMEL_CASE_AND_LETTER_FIRST_REGEX.test(input)) {
            return true;
          }
          return "Utility name must be in camelCase and start with a letter.";
        },
      },
    ],
    actions: (data) => {
      if (!data?.name) {
        throw new Error("Utility name is required.");
      }

      // Determine the category
      const category =
        data.existingCategory === CREATE_NEW_CATEGORY
          ? data.newCategory
          : data.existingCategory;
      data.category = plop.getHelper("camelCase")(category);

      return [
        // Create the utility file
        {
          type: "add",
          path: "src/utils/{{category}}/{{name}}.ts",
          templateFile: "scripts/plop/templates/utils/util.ts.hbs",
        },
        // Create the test file
        {
          type: "add",
          path: "src/utils/{{category}}/{{name}}.test.ts",
          templateFile: "scripts/plop/templates/utils/util.test.ts.hbs",
        },
        // create a new category folder with index.ts if it doesn't exist
        {
          type: "add",
          path: "src/utils/{{category}}/index.ts",
          templateFile: "scripts/plop/templates/utils/categoryIndex.ts.hbs",
          skipIfExists: true,
        },
        // Append export to the category's index.ts
        {
          type: "modify",
          path: "src/utils/{{category}}/index.ts",
          pattern: /\n*$/,
          template: '\nexport { {{name}} } from "./{{name}}";\n',
        },
      ];
    },
  });
};
