/**
 * FocusTrap Component
 *
 * A focus trap component that contains keyboard focus within itself when active.
 * Useful for modals, dialogs, and other components that need to trap focus.
 *
 * Features:
 * - Traps focus within the component when active
 * - Supports Tab and Shift+Tab navigation
 * - Automatically focuses first element when activated (unless disabled)
 * - Restores focus to previous element when deactivated
 * - Handles Escape key callback
 * - Observes DOM changes to update focusable elements dynamically
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | ARIA Dialog Pattern}
 * @memberOf components.FocusTrap
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * return (
 *   <FocusTrap
 *     isActive={isOpen}
 *     onEscape={() => setIsOpen(false)}
 *   >
 *     <button>First Button</button>
 *     <button>Second Button</button>
 *   </FocusTrap>
 * );
 * ```
 */

import { startTransition, useEffect, useRef } from "react";

import type { FocusTrapProps } from "./types";

/**
 * Default CSS selectors for focusable elements.
 */
const DEFAULT_FOCUSABLE_SELECTORS = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  '[tabindex]:not([tabindex="-1"])',
] as const;

/**
 * Attributes that affect focusability and should be observed.
 */
const OBSERVED_ATTRIBUTES = ["disabled", "aria-hidden", "tabindex"] as const;

/**
 * Checks if an element is focusable by verifying it's not disabled
 * and not hidden via aria-hidden.
 *
 * @param element - The element to check
 * @returns True if the element is focusable, false otherwise
 */
const isFocusable = (element: HTMLElement): boolean => {
  if (element.hasAttribute("disabled")) {
    return false;
  }

  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    if (currentElement.getAttribute("aria-hidden") === "true") {
      return false;
    }
    currentElement = currentElement.parentElement;
  }

  return true;
};

/**
 * Gets all focusable elements within a container based on the provided selectors.
 *
 * @param container - The container element to search within
 * @param selectors - Array of CSS selectors for focusable elements
 * @returns Array of focusable HTMLElements
 */
const getFocusableElements = (
  container: HTMLElement,
  selectors: readonly string[],
): HTMLElement[] => {
  const selectorString = selectors.join(",");
  const allElements = container.querySelectorAll<HTMLElement>(selectorString);

  return Array.from(allElements).filter(isFocusable);
};

/**
 * FocusTrap component that contains keyboard focus within itself when active.
 */
export function FocusTrap({
  children,
  isActive = false,
  focusableSelectors = DEFAULT_FOCUSABLE_SELECTORS,
  className,
  disableAutoFocus = false,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Store the previously focused element when activating
    if (isActive && !previousFocusRef.current) {
      previousFocusRef.current =
        (document.activeElement as HTMLElement) || null;
    }

    // Restore focus when deactivating
    if (!isActive) {
      const elementToRestore = previousFocusRef.current;
      if (elementToRestore && document.body.contains(elementToRestore)) {
        // Use startTransition for non-urgent focus restoration
        startTransition(() => {
          elementToRestore.focus({ preventScroll: true });
        });
      }
      previousFocusRef.current = null;
      return;
    }

    /**
     * Updates the list of focusable elements within the container.
     */
    const updateFocusableElements = (): void => {
      focusableElementsRef.current = getFocusableElements(
        container,
        focusableSelectors,
      );
    };

    // Initial update of focusable elements
    updateFocusableElements();
    const focusableElements = focusableElementsRef.current;

    // Early return if no focusable elements found
    if (focusableElements.length === 0) {
      return;
    }

    // Auto-focus first element unless disabled
    if (!disableAutoFocus) {
      focusableElements[0]?.focus({ preventScroll: true });
    }

    /**
     * Handles keyboard events for focus trapping and Escape key.
     *
     * @param event - The keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        onEscape();
        return;
      }

      // Only handle Tab key
      if (event.key !== "Tab") {
        return;
      }

      // Update focusable elements in case DOM changed
      updateFocusableElements();
      const currentFocusableElements = focusableElementsRef.current;

      if (currentFocusableElements.length === 0) {
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1];
      const activeElement = document.activeElement;

      // Handle Shift+Tab (backward navigation)
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus({ preventScroll: true });
        return;
      }

      // Handle Tab (forward navigation)
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus({ preventScroll: true });
      }
    };

    // Observe DOM changes to update focusable elements dynamically
    const mutationObserver = new MutationObserver(updateFocusableElements);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...OBSERVED_ATTRIBUTES],
    });

    container.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      mutationObserver.disconnect();
    };
  }, [focusableSelectors, isActive, disableAutoFocus, onEscape]);

  // Restore focus if the trap is unmounted while still active. The effect above
  // only restores when it re-renders with `isActive === false`, which never
  // happens for consumers that conditionally render the trap out on close (e.g.
  // a drawer inside <AnimatePresence>). Runs on unmount only (empty deps).
  useEffect(() => {
    return () => {
      const elementToRestore = previousFocusRef.current;
      if (elementToRestore && document.body.contains(elementToRestore)) {
        elementToRestore.focus({ preventScroll: true });
      }
      previousFocusRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} data-element="focus-trap" className={className}>
      {children}
    </div>
  );
}
