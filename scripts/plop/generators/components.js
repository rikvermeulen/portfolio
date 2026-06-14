/**
 * @param {import('plop').NodePlopAPI} plop - The Plop API for registering generators and helpers.
 */
export const componentGenerator = (plop) => {
  plop.setGenerator("component", {
    description: "Create a new component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
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
          path: "src/components/{{name}}/{{name}}.tsx",
          templateFile: "scripts/plop/templates/components/component.tsx.hbs",
        },
        {
          type: "add",
          path: "src/components/{{name}}/{{name}}.types.ts",
          templateFile: "scripts/plop/templates/components/types.ts.hbs",
        },
        {
          type: "add",
          path: "src/components/{{name}}/{{name}}.mock.ts",
          templateFile: "scripts/plop/templates/components/mock.ts.hbs",
        },
        {
          type: "add",
          path: "src/components/{{name}}/{{name}}.stories.tsx",
          templateFile: "scripts/plop/templates/components/stories.tsx.hbs",
        },
        {
          type: "add",
          path: "src/components/{{name}}/index.ts",
          templateFile: "scripts/plop/templates/components/index.ts.hbs",
        },
      ];
    },
  });
};
