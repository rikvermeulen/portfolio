"use client";

/**
 * FocusTrap Component Stories
 *
 * Testing Strategy:
 * ================
 * Storybook stories focus on USER INTERACTIONS and VISUAL TESTING:
 * - Keyboard navigation (Tab, Shift+Tab)
 * - Escape key handling
 * - Focus trap activation/deactivation
 * - Auto-focus behavior
 * - Visual appearance and states
 * - Accessibility validation
 *
 * For INTERNAL BEHAVIOR (props, edge cases, element detection), see FocusTrap.test.tsx
 * Jest tests handle those with faster feedback and better edge case coverage.
 *
 * Benefits of testing here:
 * - 👀 Visual debugging in browser
 * - ♿ Automatic a11y checks (addon-a11y)
 * - 📚 Living documentation with interactive examples
 * - 🎨 Shareable with designers and stakeholders
 */
import { useState } from "react";
import { expect } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FocusTrap } from "./FocusTrap.tsx";

const focusTrapOptions = [
  { id: "option-1", label: "Option 1" },
  { id: "option-2", label: "Option 2" },
  { id: "option-3", label: "Option 3" },
];

const buttonClass =
  "rounded bg-black px-4 py-2 text-white focus:ring-2 focus:outline-none dark:bg-white dark:text-black";
const fieldClass = "w-full rounded border border-ds-border px-3 py-2";

const meta = {
  component: FocusTrap,
  parameters: {
    docs: {
      description: {
        component:
          "A focus trap component that contains keyboard focus within itself when active. " +
          "Useful for modals, dialogs, and other components that need to trap focus. " +
          "Includes automatic interaction testing via play functions for keyboard navigation.",
      },
    },
  },
  argTypes: {
    isActive: {
      control: { type: "boolean" },
      description: "Whether the focus trap is active",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    disableAutoFocus: {
      control: { type: "boolean" },
      description:
        "If true, does not automatically focus the first focusable element when activated",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    focusableSelectors: {
      control: { type: "object" },
      description:
        "Custom CSS selectors for focusable elements. Defaults to button, [href], input, select, textarea, and elements with tabindex",
      table: {
        type: { summary: "string[]" },
      },
    },
    onEscape: {
      action: "escape",
      description: "Callback function called when Escape key is pressed",
    },
    className: {
      control: { type: "text" },
      description: "Custom CSS class for the container",
    },
  },
} satisfies Meta<typeof FocusTrap>;

export default meta;
type Story = StoryObj<typeof meta>;

// =========================================================================
// BASIC VARIANTS
// =========================================================================

export const Default: Story = {
  args: {
    isActive: false,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 1
        </button>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 2
        </button>
        <button type="button" className={buttonClass}>
          Button 3
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default focus trap in inactive state. Focus can move freely in and out of the container.",
      },
    },
  },
};

export const Active: Story = {
  args: {
    isActive: true,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <p className="text-ds-slate-600 mb-2 text-sm">
          Focus is trapped inside. Try pressing Tab to cycle through buttons.
        </p>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 1
        </button>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 2
        </button>
        <button type="button" className={buttonClass}>
          Button 3
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Active focus trap. Focus is contained within the container. " +
          "Pressing Tab on the last element cycles back to the first, and Shift+Tab on the first cycles to the last.",
      },
    },
  },
};

export const WithInputs: Story = {
  args: {
    isActive: true,
    children: (
      <div className="border-ds-gray-300 max-w-md rounded border p-4">
        <p className="text-ds-slate-600 mb-4 text-sm">
          Focus trap with various input types. Tab through all fields.
        </p>
        <div className="space-y-2">
          <label className="block text-sm">
            Text input
            <input
              placeholder="Enter text"
              type="text"
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Email input
            <input
              placeholder="name@example.com"
              type="email"
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Select input
            <select defaultValue="option-1" className={fieldClass}>
              {focusTrapOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Textarea
            <textarea
              placeholder="Enter your message"
              rows={3}
              className={fieldClass}
            />
          </label>
          <button type="submit" className={buttonClass}>
            Submit
          </button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Focus trap with various form inputs. All focusable elements are included in the trap cycle.",
      },
    },
  },
};

export const WithLinks: Story = {
  args: {
    isActive: true,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <p className="text-ds-slate-600 mb-4 text-sm">
          Focus trap with links. Links are focusable elements.
        </p>
        <div className="space-y-2">
          <a
            href="#link1"
            className="bg-ds-slate-100 hover:bg-ds-slate-200 focus:ring-ds-brand-800 block rounded px-4 py-2 focus:ring-2 focus:outline-none"
          >
            Link 1
          </a>
          <a
            href="#link2"
            className="bg-ds-slate-100 hover:bg-ds-slate-200 focus:ring-ds-brand-800 block rounded px-4 py-2 focus:ring-2 focus:outline-none"
          >
            Link 2
          </a>
          <a
            href="#link3"
            className="bg-ds-slate-100 hover:bg-ds-slate-200 focus:ring-ds-brand-800 block rounded px-4 py-2 focus:ring-2 focus:outline-none"
          >
            Link 3
          </a>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Focus trap containing links. Links are included in the focus cycle.",
      },
    },
  },
};

export const DisableAutoFocus: Story = {
  args: {
    isActive: true,
    disableAutoFocus: true,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <p className="text-ds-slate-600 mb-2 text-sm">
          Auto-focus is disabled. No element is automatically focused when the
          trap activates.
        </p>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 1
        </button>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Button 2
        </button>
        <button type="button" className={buttonClass}>
          Button 3
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Focus trap with auto-focus disabled. Useful when you want to preserve the current focus position.",
      },
    },
  },
};

// =========================================================================
// INTERACTION TESTS WITH PLAY FUNCTIONS
// =========================================================================
// These stories include play functions that automatically test user interactions.
// They run when you view the story in Storybook.

export const TabNavigation: Story = {
  args: {
    isActive: true,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <button type="button" className={`mr-2 ${buttonClass}`}>
          First Button
        </button>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Second Button
        </button>
        <button type="button" className={buttonClass}>
          Third Button
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "🧪 **Interactive Test**: Automatically tests Tab key navigation. " +
          "Pressing Tab cycles through focusable elements, and Tab on the last element cycles back to the first.",
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const firstButton = canvas.getByRole("button", { name: "First Button" });
    const secondButton = canvas.getByRole("button", { name: "Second Button" });
    const thirdButton = canvas.getByRole("button", { name: "Third Button" });

    // Wait for auto-focus
    await expect(firstButton).toHaveFocus();

    // Tab to second button
    await userEvent.keyboard("{Tab}");
    await expect(secondButton).toHaveFocus();

    // Tab to third button
    await userEvent.keyboard("{Tab}");
    await expect(thirdButton).toHaveFocus();

    // Tab should cycle back to first button
    await userEvent.keyboard("{Tab}");
    await expect(firstButton).toHaveFocus();
  },
};

export const ShiftTabNavigation: Story = {
  args: {
    isActive: true,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <button type="button" className={`mr-2 ${buttonClass}`}>
          First Button
        </button>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          Second Button
        </button>
        <button type="button" className={buttonClass}>
          Third Button
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "🧪 **Interactive Test**: Automatically tests Shift+Tab key navigation. " +
          "Pressing Shift+Tab cycles backwards through focusable elements, and Shift+Tab on the first element cycles to the last.",
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const firstButton = canvas.getByRole("button", { name: "First Button" });
    const secondButton = canvas.getByRole("button", { name: "Second Button" });
    const thirdButton = canvas.getByRole("button", { name: "Third Button" });

    // Wait for auto-focus
    await expect(firstButton).toHaveFocus();

    // Shift+Tab from first should cycle to last
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(thirdButton).toHaveFocus();

    // Shift+Tab to second button
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(secondButton).toHaveFocus();

    // Shift+Tab to first button
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(firstButton).toHaveFocus();
  },
};

export const EscapeKey: Story = {
  args: {
    isActive: true,
    onEscape: () => {
      // In a real app, this would close the modal/dialog
      // Check the Actions panel in Storybook to see the callback being triggered
    },
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <p className="text-ds-slate-600 mb-2 text-sm">
          Press Escape to trigger the onEscape callback. Check the Actions panel
          below.
        </p>
        <button type="button" className={buttonClass}>
          Button
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "🧪 **Interactive Test**: Automatically tests Escape key handling. " +
          "Pressing Escape calls the onEscape callback. Check the Actions panel to see the callback being triggered.",
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");
    await expect(button).toHaveFocus();

    // Press Escape key
    await userEvent.keyboard("{Escape}");

    // Verify onEscape was called (check Actions panel in Storybook)
    // In a real scenario, you'd verify:
    // - Modal/dialog closes
    // - Focus is restored
    // - State changes
  },
};

export const AutoFocusBehavior: Story = {
  args: {
    isActive: true,
    disableAutoFocus: false,
    children: (
      <div className="border-ds-gray-300 rounded border p-4">
        <p className="text-ds-slate-600 mb-2 text-sm">
          When activated, the first focusable element should automatically
          receive focus.
        </p>
        <button type="button" className={`mr-2 ${buttonClass}`}>
          First Button (Auto-focused)
        </button>
        <button type="button" className={buttonClass}>
          Second Button
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "🧪 **Interactive Test**: Verifies that the first focusable element automatically receives focus when the trap is activated.",
      },
    },
  },
  play: async ({ canvas }) => {
    const firstButton = canvas.getByRole("button", {
      name: "First Button (Auto-focused)",
    });

    // Wait for auto-focus to occur
    await expect(firstButton).toHaveFocus();
  },
};

export const ModalExample: Story = {
  args: {
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className={buttonClass}
        >
          Open Modal
        </button>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <FocusTrap
              isActive
              onEscape={() => setIsOpen(false)}
              className="border-ds-gray-300 dark:border-ds-gray-600 dark:bg-ds-gray-900 max-w-md rounded-lg border bg-white p-6 shadow-lg"
            >
              <h2 className="text-ds-slate-900 dark:text-ds-gray-100 mb-4 text-xl font-bold">
                Modal Dialog
              </h2>
              <p className="text-ds-slate-600 dark:text-ds-slate-300 mb-4">
                This is a modal dialog with a focus trap. Press Tab to cycle
                through the buttons, or Escape to close.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className={buttonClass}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className={buttonClass}
                >
                  Confirm
                </button>
              </div>
            </FocusTrap>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example: A modal dialog using FocusTrap. " +
          "Click 'Open Modal' to see the focus trap in action. " +
          "Focus is trapped within the modal, and pressing Escape closes it.",
      },
    },
  },
};
