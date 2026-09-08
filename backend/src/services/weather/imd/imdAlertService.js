import { getImdCapAlerts } from "./imdAlertClient.js";
import { normalizeImdCapAlert } from "./imdAlertNormalizer.js";

/**
 * Fetch and normalize IMD alerts.
 */
export async function getImdAlerts(limit = 10) {
  const rawAlerts = await getImdCapAlerts(limit);

  return rawAlerts.map((alert) =>
    normalizeImdCapAlert(alert.xml, alert)
  );
}

/**
 * Fetch a single latest IMD alert.
 */
export async function getLatestImdAlert() {
  const alerts = await getImdAlerts(1);

  return alerts[0] ?? null;
}