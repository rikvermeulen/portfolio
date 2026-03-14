type AllowedTypes = string | boolean | null | undefined;
type NestedAllowedTypes = AllowedTypes | AllowedTypes[];
type ClassValue = NestedAllowedTypes | NestedAllowedTypes[];

/**
 * Constructs a single string from an array of class names, filtering out any falsy values.
 * It can handle individual class names, arrays of class names, and deeply nested arrays.
 * Falsy values (like false, null, undefined, 0, "", NaN) are automatically filtered out.
 *
 * @param {...ClassValue} classes - A list of class names, which can be individual strings, arrays of strings, nested arrays of strings, or falsy values.
 * @returns {string} A space-separated string of class names.
 *
 * @example
 * Basic usage with strings
 * classnames('btn', 'btn-primary');
 * @returns 'btn btn-primary'
 *
 * @example
 * Usage with conditional classes
 * const isPrimary = true;
 * classnames('btn', isPrimary && 'btn-primary');
 * @returns 'btn btn-primary' if isPrimary is true, otherwise returns 'btn'
 *
 * @example
 * Usage with arrays
 * classnames(['btn', 'btn-large'], 'text-center');
 * @returns 'btn btn-large text-center'
 *
 * @example
 * Usage with nested arrays
 * classnames(['btn', ['btn-primary', 'active']], 'text-center');
 * @returns 'btn btn-primary active text-center'
 *
 * @example
 * Usage with mixed conditional classes and arrays
 * const isActive = false;
 * classnames(['btn', isActive ? 'active' : null], 'text-center');
 * @returns 'btn text-center' (since isActive is false)
 */

function classnames(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity)
    .filter((value) => value !== true && Boolean(value))
    .join(" ");
}

export default classnames;
