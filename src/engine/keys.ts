/** Key for a scenario in persisted progress: `dojoId/scenarioId`. Safe to use on the server. */
export function scenarioKey(dojoId: string, scenarioId: string): string {
  return `${dojoId}/${scenarioId}`;
}
