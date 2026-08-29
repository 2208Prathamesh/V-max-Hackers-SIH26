import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestServer } from '../helpers/testServer.js';

test('Integration: Voice Assistance Endpoints (Whisper & Piper)', async (t) => {
  const context = await setupTestServer();

  t.after(async () => {
    await context.cleanup();
  });

  await t.test('POST /api/voice/transcribe should process Whisper speech-to-text', async () => {
    const res = await fetch(`${context.baseUrl}/api/voice/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: 'text:Will it rain in Mumbai tomorrow?',
        language: 'en'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.transcription);
    assert.equal(body.data.transcription, 'Will it rain in Mumbai tomorrow?');
  });

  await t.test('POST /api/voice/synthesize should prepare Piper TTS speech audio metadata', async () => {
    const res = await fetch(`${context.baseUrl}/api/voice/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'The weather in Pune is 28 degrees Celsius with clear skies.',
        language: 'en'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.voiceModel);
    assert.equal(body.data.audioFormat, 'audio/wav');
  });
});
