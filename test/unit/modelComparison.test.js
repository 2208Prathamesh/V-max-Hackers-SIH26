import test from 'node:test';
import assert from 'node:assert/strict';
import { compareNWPModels } from '../../backend/src/services/weather/nwp/modelComparisonService.js';

test('Unit: NWP Multi-Model Comparison Tests', async (t) => {
  await t.test('compareNWPModels should aggregate models and compute consensus metrics', async () => {
    const comparison = await compareNWPModels(18.5204, 73.8567);

    assert.ok(comparison.location);
    assert.equal(comparison.location.latitude, 18.5204);
    assert.ok(comparison.consensus);
    assert.ok(typeof comparison.consensus.confidenceScore === 'number');
    assert.ok(comparison.consensus.confidenceScore >= 0 && comparison.consensus.confidenceScore <= 100);
    assert.ok(Array.isArray(comparison.models));
    assert.ok(comparison.models.length >= 1);
  });
});
