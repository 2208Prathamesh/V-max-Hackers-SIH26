import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: IMD Official Weather Warnings Endpoints', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('GET /api/weather/imd/warnings should return list of active warnings across India', async () => {
    const res = await fetch(`${context.baseUrl}/api/weather/imd/warnings`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  await t.test('GET /api/weather/imd/warnings/district?name=Pune should return district alert status', async () => {
    const res = await fetch(`${context.baseUrl}/api/weather/imd/warnings/district?name=Pune`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.district, 'Pune');
    assert.ok(body.data.warningLevel);
    assert.ok(body.data.colorDetails);
  });

  await t.test('GET /api/weather/imd/bulletin should return meteorological bulletin summary', async () => {
    const res = await fetch(`${context.baseUrl}/api/weather/imd/bulletin`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.synopticFeatures);
    assert.ok(Array.isArray(body.data.synopticFeatures));
  });
});
