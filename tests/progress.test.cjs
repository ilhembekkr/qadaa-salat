const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadSource } = require('./load-source.cjs');
const { deriveProgress, forecastFor, printSchedule } = loadSource('src/lib/progress.ts');
const { defaultState, sanitize, readBackup, loadState, saveState } = loadSource('src/lib/storage.ts');
const { fillCounts } = loadSource('src/lib/prayers.ts');
const today = '2026-09-10';
const plan = (patch = {}) => ({ ...defaultState(), calculated: true, counts: fillCounts(100), ...patch });

test('extra Fajr prayers cannot complete the other daily targets', () => {
  const p = deriveProgress(plan({ log: { [today]: { fajr: 9 } } }), today);
  assert.equal(p.todayDone, 9);
  assert.equal(p.todayCredited, 3);
  assert.equal(p.todayRequired, 9);
  assert.equal(p.todayPct, 33);
  assert.equal(p.todayExtra, 6);
  assert.equal(p.todayComplete, false);
  assert.equal(p.remainingByPrayer.fajr, 91);
  assert.equal(p.remainingByPrayer.dhuhr, 100);
});

test('overall credit is capped independently while raw history is preserved', () => {
  const p = deriveProgress(plan({ counts: fillCounts(10), log: { [today]: { fajr: 50 } } }), today);
  assert.equal(p.totalDone, 50);
  assert.equal(p.totalCredited, 10);
  assert.equal(p.overallPct, 20);
  assert.equal(p.totalRemaining, 40);
});

test('rounding cannot imply completion', () => {
  const p = deriveProgress(plan({ counts: fillCounts(10000), targets: fillCounts(50), log: {
    '2026-09-09': { ...fillCounts(9950), fajr: 9950 },
    [today]: { ...fillCounts(50), fajr: 49 },
  } }), today);
  assert.equal(p.totalRemaining, 1);
  assert.equal(p.overallPct, 99);
  assert.equal(p.todayPct, 99);
  assert.equal(p.todayComplete, false);
});

test('final-day requirement is stable, and disappears tomorrow without target redistribution', () => {
  const s = plan({ counts: { ...fillCounts(0), fajr: 2 }, targets: fillCounts(5) });
  for (const n of [0, 1, 2]) {
    s.log = { [today]: { fajr: n } };
    const p = deriveProgress(s, today);
    assert.equal(p.todayRequired, 2);
    assert.equal(p.todayCredited, n);
    assert.equal(p.todayComplete, n === 2);
  }
  assert.equal(deriveProgress(s, '2026-09-11').todayRequired, 0);
  assert.deepEqual(s.targets, fillCounts(5));
});

test('independent durations use ceiling and the longest unfinished prayer', () => {
  const f = forecastFor(fillCounts(100), { ...fillCounts(1), fajr: 5 });
  assert.equal(f.daysByPrayer.fajr, 20);
  assert.equal(f.daysByPrayer.dhuhr, 100);
  assert.equal(f.days, 100);
  assert.equal(f.status, 'scheduled');
  assert.equal(forecastFor(fillCounts(101), fillCounts(5)).days, 21);
});

test('unfinished zero targets block the overall forecast but not other durations', () => {
  const targets = { ...fillCounts(5), fajr: 0 };
  const f = forecastFor(fillCounts(100), targets);
  assert.equal(f.status, 'incomplete');
  assert.equal(f.days, null);
  assert.equal(f.daysByPrayer.fajr, null);
  assert.equal(f.daysByPrayer.dhuhr, 20);
  assert.equal(forecastFor(fillCounts(100), { ...targets, fajr: 2 }).days, 50);
  const completeFajr = forecastFor({ ...fillCounts(100), fajr: 0 }, targets);
  assert.equal(completeFajr.status, 'scheduled');
  assert.equal(completeFajr.days, 20);
});

test('zero targets permit voluntary records without false daily completion', () => {
  const p = deriveProgress(plan({ targets: fillCounts(0), log: { [today]: { fajr: 2 } } }), today);
  assert.equal(p.todayRequired, 0);
  assert.equal(p.todayCredited, 0);
  assert.equal(p.todayExtra, 2);
  assert.equal(p.todayComplete, false);
  assert.equal(p.forecast.status, 'incomplete');
  assert.equal(p.remainingByPrayer.fajr, 98);
});

test('calculated zero balances are complete, uncalculated tracking remains available', () => {
  const complete = deriveProgress(plan({ counts: fillCounts(0), targets: fillCounts(0) }), today);
  assert.equal(complete.forecast.status, 'complete');
  assert.equal(complete.forecast.days, 0);
  assert.equal(complete.overallPct, 100);
  assert.equal(complete.todayComplete, false);
  const draft = deriveProgress({ ...defaultState(), log: { [today]: { fajr: 1 } } }, today);
  assert.equal(draft.overallPct, null);
  assert.equal(draft.forecast.status, 'uncalculated');
  assert.equal(draft.todayRequired, 9);
  assert.equal(draft.todayCredited, 1);
});

test('target edits, estimate edits and corrections recompute without altering history', () => {
  const s = plan({ counts: fillCounts(10), log: { [today]: { fajr: 3 } } });
  const before = JSON.stringify(s.log);
  const reduced = deriveProgress({ ...s, targets: { ...s.targets, fajr: 1 } }, today);
  assert.equal(reduced.todayCreditedByPrayer.fajr, 1);
  assert.equal(reduced.todayExtraByPrayer.fajr, 2);
  const completed = deriveProgress({ ...s, counts: { ...s.counts, fajr: 2 } }, today);
  assert.equal(completed.remainingByPrayer.fajr, 0);
  assert.equal(completed.totalCredited, 2);
  const revised = deriveProgress({ ...s, counts: { ...s.counts, fajr: 20 } }, today);
  assert.equal(revised.remainingByPrayer.fajr, 17);
  assert.equal(revised.todayRequiredByPrayer.fajr, 3);
  const corrected = deriveProgress({ ...s, log: { [today]: { fajr: 1 } } }, today);
  assert.equal(corrected.remainingByPrayer.fajr, 9);
  assert.equal(corrected.todayCreditedByPrayer.fajr, 1);
  assert.equal(JSON.stringify(s.log), before);
});

test('print schedule subtracts today, caps final days, and never transfers capacity', () => {
  const s = plan({ counts: { fajr: 7, dhuhr: 2, asr: 10, maghrib: 0, isha: 3 },
    targets: { fajr: 3, dhuhr: 5, asr: 0, maghrib: 5, isha: 1 }, log: { [today]: { fajr: 2, isha: 3 } } });
  const before = JSON.stringify(s);
  assert.deepEqual(printSchedule(s, today, 4), [
    { fajr: 1, dhuhr: 2, asr: 0, maghrib: 0, isha: 0 },
    { fajr: 3, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    { fajr: 1, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    fillCounts(0),
  ]);
  assert.equal(JSON.stringify(s), before);
  assert.equal(printSchedule(s, today, 90).length, 90);
});

test('pre-calculation print tracking uses configured targets', () => {
  const s = { ...defaultState(), log: { [today]: { fajr: 2 } } };
  const rows = printSchedule(s, today, 2);
  assert.equal(rows[0].fajr, 1);
  assert.deepEqual(rows[1], s.targets);
});

test('existing saved plans and zero targets round-trip without migration', async () => {
  const old = plan({ log: { [today]: { fajr: 2 } } });
  assert.deepEqual(sanitize(JSON.parse(JSON.stringify(old))), old);
  const s = { ...old, targets: { ...old.targets, fajr: 0 } };
  let stored;
  global.localStorage = { getItem: () => stored, setItem: (_key, value) => { stored = value; } };
  try {
    assert.equal(saveState(s), true);
    assert.deepEqual(loadState(), s);
    const restored = await readBackup(new Blob([JSON.stringify({ ...s, exportedAt: new Date().toISOString() })]));
    assert.deepEqual(restored, s);
  } finally { delete global.localStorage; }
});

test('a tap on the tracker changes the count by exactly one', () => {
  const { nextCountOnTap } = loadSource('src/lib/progress.ts');
  // 3 checked of 5: tapping a checked box (any of 0..2) removes one, never clears the row.
  assert.equal(nextCountOnTap(3, 0), 2);
  assert.equal(nextCountOnTap(3, 1), 2);
  assert.equal(nextCountOnTap(3, 2), 2);
  // tapping an unchecked box adds one regardless of which one.
  assert.equal(nextCountOnTap(3, 3), 4);
  assert.equal(nextCountOnTap(3, 4), 4);
  assert.equal(nextCountOnTap(0, 0), 1);
  assert.equal(nextCountOnTap(1, 0), 0);
});
