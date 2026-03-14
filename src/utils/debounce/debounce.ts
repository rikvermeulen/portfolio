interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

interface DebouncedFunction<F extends (...args: unknown[]) => unknown> {
  (...args: Parameters<F>): ReturnType<F> | undefined;
  cancel: () => void;
}

/**
 * Debounces a function, delaying its execution until after a specified delay has elapsed since the last time it was invoked.
 * Supports `leading` and `trailing` execution options.
 *
 * @param func The function to debounce.
 * @param delay The delay in milliseconds. Defaults to 500ms.
 * @param options Configuration options for leading and trailing execution.
 * @returns A debounced version of the input function with a `cancel` method.
 */
function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  delay: number = 500,
  options: DebounceOptions = {},
): DebouncedFunction<F> {
  let timerId: number | NodeJS.Timeout | null = null;
  let lastArgs: Parameters<F> | undefined;
  let lastThis: ThisParameterType<F> | undefined;
  let result: ReturnType<F> | undefined;
  const { leading = false, trailing = true } = options;

  const invokeFunction = () => {
    timerId = null;
    if (trailing && lastArgs) {
      result = func.apply(lastThis, lastArgs) as ReturnType<F>;
      lastArgs = lastThis = undefined;
    }
  };

  const debounced = (...args: Parameters<F>) => {
    lastArgs = args;

    const shouldInvoke = leading && !timerId;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(invokeFunction, delay);

    if (shouldInvoke) {
      result = func(...args) as ReturnType<F>;
    }

    return result;
  };

  // Assign the cancel method to the debounced function
  Object.assign(debounced, {
    cancel: () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      lastArgs = lastThis = undefined;
    },
  });

  return debounced as DebouncedFunction<F>;
}

export default debounce;
