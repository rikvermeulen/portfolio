# Plop Generator Documentation

## Overview

This project uses Plop.js for code generation. It helps maintain consistency across the codebase by automating the creation of components, modules, and utilities.

## Available Generators

**Note**: Run `npm run plop` to list all available generators.

### 1. Components (`plop component`)
- Creates React components with TypeScript support
- Creates component in `src/components/<ComponentName>`

Example:
```bash
npm run plop component
```

### 2. Modules (`plop module`)
- Creates full module structure with animation support
- Includes GSAP animation setup
- Creates module in `src/modules/<ModuleName>`
- Generates three files:
  - `<ModuleName>.tsx`: Main component
  - `animation.ts`: GSAP animations
  - `fragment.ts`: GraphQL fragment

Example:
```bash
npm run plop module
```

### 3. Utilities (`plop util`)
- Creates utility functions with TypeScript support
- Organizes utilities by categories
- Creates in `src/utils/<category>/<utilName>`
- Generates:
  - Main utility file
  - Test file
  - Updates category index

Example:
```bash
npm run plop util
```

## Structure

plop/
├── actions/        # Custom plop actions
├── generators/     # Generator configurations
└── templates/      # Handlebars templates

## Configuration

### Required Environment Variables
```env
GSAP_AUTH_TOKEN=              # Required: For GSAP business version
```

## Templates

All templates use Handlebars syntax and are located in the `scripts/plop/templates` directory:

- Components: Basic React component structure
- Modules: GSAP-enabled component with animations
- Utils: Utility function with tests

## Best Practices

1. Always use the generator for new components/modules/utils
2. Follow the prompts for consistent naming
3. Add tests for utilities
4. Use category organization for utilities
