/** URLs inside the app. The app lives under one prefix so `/` is free for the landing page. */
export const APP_HOME = "/digidojo";

export const dojoHref = (dojoId: string) => `${APP_HOME}/dojo/${dojoId}`;

export const scenarioHref = (dojoId: string, scenarioId: string) =>
  `${dojoHref(dojoId)}/${scenarioId}`;
