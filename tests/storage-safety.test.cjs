const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadSource } = require('./load-source.cjs');
const { defaultState, readStored, writeState, saveState, statesEqual, storageAvailable, STORAGE_KEY } =
  loadSource('src/lib/storage.ts');

function fakeStorage({ failOnSet = false } = {}) {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { if (failOnSet) throw new DOMException('quota', 'QuotaExceededError'); map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _map: map,
  };
}

test('write stamps the envelope and readStored returns state + stamp separately', () => {
  global.localStorage = fakeStorage();
  try {
    const s = { ...defaultState(), calculated: true };
    const stamp = writeState(s, '2026-09-10T10:00:00.000Z');
    assert.equal(stamp, '2026-09-10T10:00:00.000Z');
    const stored = readStored();
    assert.deepEqual(stored.state, s);          // savedAt is not part of AppState
    assert.equal(stored.savedAt, stamp);
    assert.equal(statesEqual(stored.state, s), true);
  } finally { delete global.localStorage; }
});

test('rejected writes are reported, never swallowed', () => {
  global.localStorage = fakeStorage({ failOnSet: true });
  try {
    assert.equal(writeState(defaultState()), null);
    assert.equal(saveState(defaultState()), false);
    assert.equal(storageAvailable(), false);
  } finally { delete global.localStorage; }
});

test('storage probe leaves no residue and reports availability', () => {
  const ls = fakeStorage();
  global.localStorage = ls;
  try {
    assert.equal(storageAvailable(), true);
    assert.equal(ls._map.size, 0);
  } finally { delete global.localStorage; }
});

test('legacy envelopes without a stamp still load', () => {
  global.localStorage = fakeStorage();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState()));
    const stored = readStored();
    assert.deepEqual(stored.state, defaultState());
    assert.equal(stored.savedAt, null);
  } finally { delete global.localStorage; }
});

test('corrupt or foreign storage content is ignored', () => {
  global.localStorage = fakeStorage();
  try {
    localStorage.setItem(STORAGE_KEY, '{not json');
    assert.equal(readStored(), null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hello: 1 }));
    assert.equal(readStored(), null);
  } finally { delete global.localStorage; }
});

test('two tabs converge: the later writer wins and the other tab can detect it by stamp', () => {
  global.localStorage = fakeStorage();
  try {
    const a = { ...defaultState(), calculated: true, log: { '2026-09-10': { fajr: 1 } } };
    const stampA = writeState(a, '2026-09-10T10:00:00.000Z');
    const b = { ...a, log: { '2026-09-10': { fajr: 2 } } };
    const stampB = writeState(b, '2026-09-10T10:00:01.000Z');
    const stored = readStored();
    assert.notEqual(stored.savedAt, stampA);
    assert.equal(stored.savedAt, stampB);
    assert.deepEqual(stored.state, b);
  } finally { delete global.localStorage; }
});

test('backup files expose their export time and are summarised for the restore preview', async () => {
  const { readBackupFile } = loadSource('src/lib/storage.ts');
  const { summarizePlan } = loadSource('src/lib/progress.ts');
  const { fillCounts } = loadSource('src/lib/prayers.ts');
  const s = { ...defaultState(), calculated: true, counts: fillCounts(10),
    log: { '2026-09-08': { fajr: 2 }, '2026-09-10': { asr: 1, isha: 0 }, '2026-09-09': {} } };
  const file = new Blob([JSON.stringify({ ...s, exportedAt: '2026-09-10T08:00:00.000Z' })]);
  const b = await readBackupFile(file);
  assert.equal(b.exportedAt, '2026-09-10T08:00:00.000Z');
  const sum = summarizePlan(b.state);
  assert.deepEqual(sum, { calculated: true, estimated: 50, remaining: 47, recorded: 3, loggedDays: 2, lastLoggedDay: '2026-09-10', empty: false });
  assert.equal((await readBackupFile(new Blob([JSON.stringify(s)]))).exportedAt, null);
  assert.equal((await readBackupFile(new Blob([JSON.stringify({ ...s, exportedAt: 'yesterday' })]))).exportedAt, null);
  assert.equal(summarizePlan(defaultState()).empty, true);
  assert.equal(summarizePlan({ ...defaultState(), log: { '2026-09-10': { fajr: 1 } } }).empty, false);
});
