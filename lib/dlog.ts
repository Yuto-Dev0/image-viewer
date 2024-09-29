// eslint-disable-next-line no-unused-vars
export function dlog(...args: any[]) {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") console.log(...args);
}
