/**
 * Release builds write nothing to the device logs, including messages from libraries.
 * Our own code never logs (ESLint `no-console`).
 */
if (!__DEV__) {
  const noop = () => {};
  Object.assign(globalThis.console, {
    log: noop,
    info: noop,
    debug: noop,
    trace: noop,
    warn: noop,
    error: noop,
  });
}

export {};
