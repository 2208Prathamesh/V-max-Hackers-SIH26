import test from 'node:test';
import assert from 'node:assert/strict';
import { getDisasterSafetyAdvisory } from '../../backend/src/services/advisory/advisoryService.js';

test('Unit: Advisory & Decision Support Engine', async (t) => {
  await t.test('getDisasterSafetyAdvisory should return safety actions for Red/Orange alert zones', async () => {
    const advisory = await getDisasterSafetyAdvisory('Ratnagiri', 16.99, 73.3);

    assert.equal(advisory.location, 'Ratnagiri');
    assert.equal(advisory.alertLevel, 'Red');
    assert.ok(Array.isArray(advisory.safetyActionChecklist));
    assert.ok(advisory.safetyActionChecklist.length >= 3);
    assert.ok(Array.isArray(advisory.emergencyHotlines));
  });

  await t.test('getDisasterSafetyAdvisory should handle safe / green locations gracefully', async () => {
    const advisory = await getDisasterSafetyAdvisory('UnknownDistrictXYZ', 20.0, 75.0);

    assert.equal(advisory.alertLevel, 'Green');
    assert.ok(advisory.safetyActionChecklist[0].includes('No immediate disaster hazards'));
  });
});
