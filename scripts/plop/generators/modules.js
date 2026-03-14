/**
 * @param {import('plop').NodePlopAPI} plop - The Plop API for registering generators and helpers.
 */
export const moduleGenerator = (plop) => {
  plop.setGenerator("module", {
    description: "Create a new module",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Module name:",
      },
    ],
    actions: (data) => {
      if (!data?.name) {
        throw new Error("Name is required");
      }
      data.name = plop.getHelper("pascalCase")(data.name);

      return [
        {
          type: "add",
          path: "src/modules/{{name}}/{{name}}.tsx",
          templateFile: "scripts/plop/templates/modules/module.tsx.hbs",
        },
        {
          type: "add",
          path: "src/modules/{{name}}/animations.ts",
          templateFile: "scripts/plop/templates/modules/animations.ts.hbs",
        },
        {
          type: "add",
          path: "src/modules/{{name}}/fragments.ts",
          templateFile: "scripts/plop/templates/modules/fragments.ts.hbs",
        },
        {
          type: "add",
          path: "src/modules/{{name}}/{{name}}.stories.tsx",
          templateFile: "scripts/plop/templates/modules/stories.tsx.hbs",
        },
      ];
    },
  });
};
