import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Icon from "@/components/Icon/index.ts";

import Button from "./Button.tsx";

/**
 * `Button` is an iOS-27 "Liquid Glass" capsule built on the agnostic `Glass`
 * material. Two variants — `glass` (clear frosted, tinted label) and
 * `prominent` (solid tone fill, white label) — across the `neutral`, `accent`,
 * and `destructive` tones, in three sizes, plus a circular `iconOnly` form.
 * Renders a `<button>` by default, or paints onto a child element with
 * `asChild`.
 */
const meta = {
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Liquid-glass capsule following the iOS & iPadOS 27 design. Uses the " +
          "`Glass` material for refraction, specular rim, and the interactive " +
          "press light.",
      },
    },
  },
  args: {
    variant: "glass",
    tone: "neutral",
    size: "md",
    iconOnly: false,
    children: "Done",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["glass", "prominent"] },
    tone: {
      control: "inline-radio",
      options: ["neutral", "accent", "destructive"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    iconOnly: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="grid min-h-[13.75rem] place-items-center rounded-3xl bg-[url(/images/me.jpg)] bg-cover bg-center p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Clear frosted glass with a neutral label — the default. */
export const Default: Story = {};

/** Solid accent fill with a white label — the iOS "prominent" style. */
export const Prominent: Story = {
  args: { variant: "prominent", tone: "accent" },
};

/** Destructive intent on a clear glass capsule. */
export const Destructive: Story = {
  args: { tone: "destructive", children: "Delete" },
};

/** The four capsules from the Figma reference, side by side. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <Button tone="accent" variant="prominent">
          Done
        </Button>
        <Button tone="neutral" variant="glass">
          Done
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button tone="destructive" variant="prominent">
          Delete
        </Button>
        <Button tone="destructive" variant="glass">
          Delete
        </Button>
      </div>
    </div>
  ),
};

/** Every size, text form. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/** Circular icon-only capsules (Figma "Symbol" form). */
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button aria-label="Confirm" iconOnly tone="accent" variant="prominent">
        <Icon iconClassName="size-5" name="check" />
      </Button>
      <Button aria-label="Confirm" iconOnly tone="neutral" variant="glass">
        <Icon iconClassName="size-5" name="check" />
      </Button>
      <Button
        aria-label="Remove"
        iconOnly
        tone="destructive"
        variant="prominent"
      >
        <Icon iconClassName="size-5" name="minus" />
      </Button>
    </div>
  ),
};

/** Disabled state. */
export const Disabled: Story = {
  args: { variant: "prominent", tone: "accent", disabled: true },
};

/** Painted onto an anchor with `asChild`. */
export const AsLink: Story = {
  args: { asChild: true, tone: "accent" },
  render: (args) => (
    <Button {...args}>
      <a href="#section">Open link</a>
    </Button>
  ),
};
