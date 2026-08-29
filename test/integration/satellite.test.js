import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: Satellite & WMO WIS 2.0 Endpoints', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('GET /api/satellite/layers should return available MOSDAC/ISRO satellite feeds', async () => {
    const res = await fetch(`${context.baseUrl}/api/satellite/layers`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.products));
    assert.ok(body.data.products.length > 0);
    assert.ok(body.data.wmoWis2Subscription);
  });

  await t.test('GET /api/satellite/cyclone-tracks should return active storm trajectories', async () => {
    const res = await fetch(`${context.baseUrl}/api/satellite/cyclone-tracks`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.systems));
  });
});
