const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {}, URLSearchParams, Date, Error };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../valence.js'), 'utf8'), context);
const api = context.window.EXPERIMENT_VALENCE;
const condition = 'high_process_high_outcome';
const sessionKey = 'test:hh:participant';
function store(entries = []) {
  const values = new Map(entries);
  return { values, getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) };
}
function bind(storage, assignedValence = 'positive', key = sessionKey, c = condition) {
  return api.bind({ storage, sessionKey: key, condition: c, assignedValence });
}

test('accepts only one explicit, exact Qualtrics valence value', () => {
  assert.equal(api.read('?valence=positive'), 'positive');
  assert.equal(api.read('?other=1&valence=negative'), 'negative');
  for (const search of ['', '?valence=', '?valence=above', '?valence=Positive', '?valence=positive&valence=negative', '?valence=positive&valence=positive']) {
    assert.throws(() => api.read(search), /missing a valid assignment/);
  }
});

test('persists the externally assigned value and reuses it on return', () => {
  const storage = store();
  const first = bind(storage, 'negative');
  const next = bind(storage, 'negative');
  assert.equal(first.assigned_valence, 'negative');
  assert.equal(next.assigned_at, first.assigned_at);
  assert.equal(next.assignment_source, 'qualtrics_url');
  assert.equal(next.assignment_version, 'qualtrics-valence-v1');
  assert.equal(storage.values.size, 1);
});

test('a conflicting link does not overwrite assignment or participant history', () => {
  const storage = store();
  bind(storage);
  storage.setItem(sessionKey, JSON.stringify({ assigned_valence: 'positive', posts: [{ outcome: { assigned_valence: 'positive', assignment_version: api.version } }] }));
  const before = [...storage.values];
  assert.throws(() => bind(storage, 'negative'), /conflicts/);
  assert.deepEqual([...storage.values], before);
});

test('same-ID assignments are independent across condition namespaces', () => {
  const storage = store();
  bind(storage, 'positive');
  const second = bind(storage, 'negative', 'test:lh:participant', 'low_process_high_outcome');
  assert.equal(second.assigned_valence, 'negative');
  assert.equal(storage.values.size, 2);
});

test('saved posts from the old design block silent migration without deleting records', () => {
  const history = JSON.stringify({ posts: [{ outcome: { valence: 'above', revenue: 12 } }] });
  const storage = store([[sessionKey, history]]);
  assert.throws(() => bind(storage), /earlier experiment version/);
  assert.equal(storage.getItem(sessionKey), history);
  assert.equal(storage.values.size, 1);
});

test('legacy practice-only work can continue; practice assignment conflicts cannot', () => {
  const storage = store([[sessionKey + ':practice', JSON.stringify({ posts: [{ outcome: null }] })]]);
  assert.equal(bind(storage).assigned_valence, 'positive');
  const conflicting = store([[sessionKey + ':practice', JSON.stringify({ assigned_valence: 'negative', posts: [] })]]);
  assert.throws(() => bind(conflicting), /conflicts/);
  assert.equal(conflicting.values.size, 1);
});

test('corrupt or unavailable storage fails closed rather than selecting a default', () => {
  assert.throws(() => bind(store([[sessionKey + ':valence-assignment', '{bad json']])), /could not be read/);
  const storage = { getItem() { const e = new Error(); e.name = 'SecurityError'; throw e; } };
  assert.throws(() => bind(storage), /allow site storage/);
});

test('contradictory assigned and displayed historical valence blocks return', () => {
  const storage = store();
  bind(storage);
  storage.setItem(sessionKey, JSON.stringify({ posts: [{ outcome: { assigned_valence: 'positive', assignment_version: api.version, valence: 'below' } }] }));
  assert.throws(() => bind(storage), /conflicts/);
});
