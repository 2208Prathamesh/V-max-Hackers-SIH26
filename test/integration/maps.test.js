import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: MapLibre GIS GeoJSON Layer Endpoints', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('GET /api/maps/layers/weather?layer=temperature should return GeoJSON points', async () => {
    const res = await fetch(`${context.baseUrl}/api/maps/layers/weather?layer=temperature`);
    assert.equal(res.status, 200);

    const geojson = await res.json();
    assert.equal(geojson.type, 'FeatureCollection');
    assert.ok(Array.isArray(geojson.features));
    assert.ok(geojson.features.length > 0);
    assert.equal(geojson.features[0].type, 'Feature');
    assert.ok(geojson.features[0].properties.temperatureC !== undefined);
  });

  await t.test('GET /api/maps/layers/alerts should return active alert GeoJSON features', async () => {
    const res = await fetch(`${context.baseUrl}/api/maps/layers/alerts`);
    assert.equal(res.status, 200);

    const geojson = await res.json();
    assert.equal(geojson.type, 'FeatureCollection');
    assert.ok(Array.isArray(geojson.features));
  });

  await t.test('GET /api/maps/layers/flood-risk should return flood vulnerability GeoJSON features', async () => {
    const res = await fetch(`${context.baseUrl}/api/maps/layers/flood-risk`);
    assert.equal(res.status, 200);

    const geojson = await res.json();
    assert.equal(geojson.type, 'FeatureCollection');
    assert.ok(Array.isArray(geojson.features));
  });
});
