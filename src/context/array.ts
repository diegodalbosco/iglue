import { isArray, remove } from "../utils";

/**
 * Array methods to patch
 */

const METHODS: string[] = [
  "push",
  "pop",
  "shift",
  "unshift",
  "sort",
  "reverse",
  "splice"
];

/**
 * Property where the notifiers are stored into the array
 */

const STORE = "_oa_";

/**
 * Represents an observed array
 */

interface ObservedArray extends Array<any> {
  [STORE]: ArrayNotifier[];
}

/**
 * Notifier function to call on array change
 */

export type ArrayNotifier = () => void;

/**
 * Apply observe middleware to the array instance
 */

function applyMiddleware(arr: ObservedArray): void {
  // ensure array data store
  if (!arr.hasOwnProperty(STORE)) {
    Object.defineProperty(arr, STORE, {
      // not configurable, prevent double definition
      // not enumerable, prevent Object.assign cloning
      // not writable, prevent value assignation/override
      value: []
    });
  }

  // wrap all array methods that changes the array structure
  for (const method of METHODS) {
    // override the default method
    Object.defineProperty(arr, method, {
      configurable: true,
      // not enumerable, prevent Object.assign cloning
      writable: true,
      value: function middleware(this: ObservedArray, ...args: any[]): any {
        // call the original method and get the result
        const result: any = (Array as any).prototype[method].apply(this, args);
        // trigger all notifiers
        for (const notifier of this[STORE]) {
          notifier();
        }
        // return the result
        return result;
      }
    });
  }
}

/**
 * Remove the observe middleware
 */

function removeMiddleware(arr: ObservedArray): void {
  for (const method of METHODS) {
    // restore the original method
    Object.defineProperty(arr, method, {
      configurable: true,
      // not enumerable, prevent Object.assign cloning
      writable: true,
      value: (Array as any).prototype[method]
    });
  }
}

/**
 * Returns true when the array is observed
 */

export function isObservedArray(arr: any): boolean {
  if (isArray(arr) && arr.hasOwnProperty(STORE)) {
    return arr[STORE].length > 0;
  }
  return false;
}

/**
 * Observe the array
 */

export function observeArray(arr: any, notifier: ArrayNotifier): void {
  if (!isArray(arr)) {
    throw new Error("Unexpected array to observe");
  }
  if (!isObservedArray(arr)) {
    applyMiddleware(arr);
  }
  arr[STORE].push(notifier);
}

/**
 * Remove the observe notifier, returns true when the notifier is removed
 */

export function unobserveArray(arr: any, notifier: ArrayNotifier): boolean {
  if (isObservedArray(arr)) {
    // get the notifiers array
    const notifiers: ArrayNotifier[] = arr[STORE];

    // remove the targeted notifier
    const removed: boolean = remove(notifiers, notifier);

    // remove middleware if necessary
    if (notifiers.length === 0) {
      removeMiddleware(arr);
    }

    // all done
    return removed;
  }
  return false;
}
