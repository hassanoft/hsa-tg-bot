export const START_TIME = Date.now();

export function getUptimeMs() {
  return Date.now() - START_TIME;
}
