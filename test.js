// Self-check: node test.js — validates word data and smoke-tests app.js with a stubbed DOM.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const el = () => ({ innerHTML: '', textContent: '', value: '', dataset: {}, classList: { add() {}, toggle() {} }, focus() {}, querySelector: () => el(), querySelectorAll: () => [] });
const store = {};
const ctx = {
  console, setTimeout: f => f(), Blob: class {}, URL: { createObjectURL: () => '' }, alert() {}, confirm: () => true, scrollTo() {},
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
  navigator: {}, location: { hash: '' }, addEventListener() {},
  document: { querySelector: () => el(), querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ click() {} }) },
};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['words/1.js', 'words/2.js', 'words/3.js', 'words/4.js', 'words/5.js', 'lessons.js', 'app.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const run = s => vm.runInContext(s, ctx);

// data
const words = run('WORDS'), themes = run('THEMES'), pos = run('POS');
const ids = new Set();
for (const w of words) {
  const where = `#${w.id} ${w.ru}`;
  assert(!ids.has(w.id), 'duplicate id ' + where); ids.add(w.id);
  for (const k of ['ru', 'en', 'fr', 'ex']) assert(w[k]?.trim(), `missing ${k} ${where}`);
  assert(pos[w.pos], 'bad pos ' + where);
  assert(themes[w.theme], 'bad theme ' + where);
  assert(['', 'm', 'f', 'n', 'pl'].includes(w.g), 'bad gender ' + where);
  assert(w.pos !== 'n' || w.g, 'noun without gender ' + where);
  assert.equal(w.ex.split(' = ').length, 2, 'example needs exactly one " = " ' + where);
  assert(w.note !== undefined && w.ex !== undefined, 'field count ' + where);
  assert((w.ru.match(/́/g) || []).length <= 1, 'two stress marks ' + where);
}
const vowels = s => (s.match(/[аеёиоуыэюя]/gi) || []).length;
const unstressed = words.filter(w => vowels(w.ru) > 1 && !/[ё́]/.test(w.ru)).map(w => w.ru);
assert(words.length > 990, 'word count ' + words.length);
console.log(`${words.length} words OK${unstressed.length ? ' · no stress mark: ' + unstressed.join(', ') : ''}`);

// helpers
assert.equal(run('plain')('Сказа́ть!'), 'сказать');
assert.equal(run('plain')('ещё'), 'еще');
assert.equal(run('plain')('Мой'), 'мой'); // й must survive NFD/NFC
assert.equal(run('addDays')('2026-12-31', 1), '2027-01-01');

// flow: pick today's words, learn, grade, review, import
const S = () => run('S');
run('route()');
const day = S().day;
assert.equal(day.ids.length, 30);
assert(day.ids.every(id => id <= 200), 'first day should come from the top-200 band');
run('S.words[1] = {box: 0, ok: 0, ko: 0, due: today()}; grade(1, true); grade(1, true)');
assert.equal(S().words[1].box, 2); assert.equal(S().words[1].due, run('addDays(today(), 2)'));
run('grade(1, false)'); assert.equal(S().words[1].box, 0); assert.equal(S().words[1].ko, 1);
assert.deepEqual([...run('hardIds()')], [1]);
for (const v of ['today', 'learn', 'test', 'review', 'hard', 'lessons', 'words', 'settings']) { ctx.location.hash = '#' + v; run('route()'); }
for (let k = 0; k < run('LESSONS.length'); k++) { ctx.location.hash = '#lesson/' + k; run('route()'); }
for (const w of words.slice(0, 200)) { const q = run('wordQ')(w); assert(typeof q.a === 'string' ? q.a === w.ru : q.opts.length === 4 && q.a >= 0, 'question ' + w.ru); }
run(`importData(JSON.stringify({state: {words: {5: {box: 3, ok: 3, ko: 0, due: '2030-01-01'}, 99999: {box: 1, ok: 1, ko: 0, due: '2030-01-01'}}, quota: 50, theme: '<b>', lessons: {0: 5, 1: '<img>'}}}))`);
assert.deepEqual(Object.keys(S().words), ['5']); assert.equal(S().quota, 50); assert.equal(S().theme, ''); assert.deepEqual({ ...S().lessons }, { 0: 5 });
console.log('app OK');
