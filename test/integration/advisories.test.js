import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: Agriculture & Disaster Advisory Endpoints', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('GET /api/advisories/agriculture?city=Pune&crop=cotton should return agro advisory', async () => {
    const res = await fetch(`${context.baseUrl}/api/advisories/agriculture?city=Pune&crop=cotton`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.cropSelected, 'cotton');
    assert.ok(body.data.fieldConditions);
    assert.ok(body.data.recommendations);
    assert.ok(body.data.recommendations.irrigation);
    assert.ok(body.data.recommendations.pesticideSpraying);
  });

  await t.test('GET /api/advisories/disaster?city=Mumbai should return safety checklist', async () => {
    const res = await fetch(`${context.baseUrl}/api/advisories/disaster?city=Mumbai`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.safetyActionChecklist));
    assert.ok(Array.isArray(body.data.emergencyHotlines));
  });
});
