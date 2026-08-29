import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: Climate & Historical Trends Endpoints', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('GET /api/climate/trends?city=Pune should return multi-year climate anomaly data', async () => {
    const res = await fetch(`${context.baseUrl}/api/climate/trends?city=Pune&startYear=2021&endYear=2023`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.baselineNormals);
    assert.ok(body.data.climateShift);
    assert.ok(Array.isArray(body.data.yearlyTrends));
  });
});
