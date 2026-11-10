import test from 'node:test';
import assert from 'node:assert/strict';
import {firstPhoto} from './src/tv-playback.js';

test('a ready preview does not wait for a slow full-size image', async () => {
  const neverReady = new Promise(() => {});
  assert.equal(await firstPhoto([neverReady, Promise.resolve('preview')]), 'preview');
});
test('a failed preview still allows the full image to display', async () => {
  assert.equal(await firstPhoto([Promise.resolve('full'), Promise.reject(new Error('preview failed'))]), 'full');
});
test('photo readiness settles when both sizes fail', async () => {
  await assert.rejects(firstPhoto([Promise.reject(new Error()), Promise.reject(new Error())]), /Photo unavailable/);
});
