const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadSource } = require('./load-source.cjs');
const { advanceIstighfar } = loadSource('src/lib/istighfar.ts');
const today = '2026-10-05';
const fresh = () => ({ day: today, recorded: 0, visible: false });

test('every prayer or bulk entry reopens a dismissed reminder without a daily limit', () => {
  const initial = fresh();
  assert.equal(advanceIstighfar(initial, today, 0), initial);
  const shown = advanceIstighfar(initial, today, 1);
  assert.equal(shown.visible, true);
  const dismissed = { ...shown, visible: false };
  assert.equal(advanceIstighfar(dismissed, today, 1).visible, false);
  assert.equal(advanceIstighfar(dismissed, today, 2).visible, true);
  assert.equal(advanceIstighfar(dismissed, today, 21).visible, true);
});

test('corrections and a new day hide the reminder; the next recording shows it again', () => {
  const shown = advanceIstighfar(fresh(), today, 5);
  const corrected = advanceIstighfar(shown, today, 4);
  assert.equal(corrected.visible, false);
  assert.equal(advanceIstighfar(corrected, today, 5).visible, true);
  const undone = advanceIstighfar(shown, today, 0);
  assert.equal(undone.visible, false);
  assert.equal(advanceIstighfar(undone, today, 5).visible, true);
  const tomorrow = advanceIstighfar(shown, '2026-10-06', 0);
  assert.equal(tomorrow.visible, false);
  assert.equal(advanceIstighfar(tomorrow, '2026-10-06', 1).visible, true);
});

test('existing records on reload wait for the next recording', () => {
  const restored = { day: today, recorded: 5, visible: false };
  assert.equal(advanceIstighfar(restored, today, 5).visible, false);
  assert.equal(advanceIstighfar(restored, today, 6).visible, true);
});
