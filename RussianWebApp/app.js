'use strict';

// ---------- data ----------
const POS = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', pron: 'pronoun', prep: 'preposition',
  conj: 'conjunction', part: 'particle', num: 'number', int: 'interjection', pred: 'predicative' };
const GENDER = { m: 'masc.', f: 'fem.', n: 'neut.', pl: 'plural' };
const THEMES = {
  core: 'Grammar words · Mots-outils', people: 'People & family · Personnes & famille', body: 'Body & health · Corps & santé',
  home: 'Home & objects · Maison & objets', nature: 'Nature & weather · Nature & météo', time: 'Time · Temps',
  color: 'Colors · Couleurs', num: 'Numbers & quantity · Nombres', place: 'Places & travel · Lieux & voyages',
  food: 'Food & drink · Nourriture', feel: 'Mind & feelings · Esprit & sentiments', move: 'Motion · Mouvement',
  talk: 'Speech · Parole', act: 'Actions · Actions', society: 'Society & work · Société & travail',
  war: 'Military · Armée', qual: 'Qualities · Qualités', abstract: 'Abstract · Notions abstraites',
  culture: 'Culture & leisure · Culture & loisirs', tech: 'Science & technology · Sciences & techniques',
};
// line format: rank|ru|pos|gender|en|fr|theme|emoji|note|example
const WORDS = window.WORD_DATA.join('\n').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
  const [id, ru, pos, g, en, fr, theme, emoji, note, ex] = l.split('|');
  return { id: +id, ru, pos, g, en, fr, theme, emoji, note, ex };
});
const BY_ID = new Map(WORDS.map(w => [w.id, w]));
// frequency bands: top 200, 201-500, 501-1000, then the 1001-2000 extension
const band = w => w.id <= 200 ? 0 : w.id <= 500 ? 1 : w.id <= 1000 ? 2 : 3;

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const today = () => new Date().toLocaleDateString('sv'); // local YYYY-MM-DD
const addDays = (d, n) => { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv'); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
// strip stress marks, ё→е, punctuation: what we compare typed answers on
const plain = s => String(s ?? '').normalize('NFD').replace(/́/g, '').normalize('NFC').toLowerCase().replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
const unstress = s => String(s).replace(/́/g, '');
const meaning = w => `${w.en} · ${w.fr}`;

// ---------- state ----------
const KEY = 'ru-daily-v1';
const fresh = () => ({ quota: 30, theme: '', rate: 0.9, words: {}, day: null, lessons: {}, texts: {}, reads: {}, tenses: ['pres'],
  active: [], created: today(), lastExport: null });
let S = load();
function load() { try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return fresh(); } }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { alert('Could not save progress: ' + e.message + '\nExport a backup now (Settings).'); }
}
navigator.storage?.persist?.(); // ask Chrome not to evict our data

// spaced repetition: box 0 = new/failed, box k → next review after STEPS[k-1] days
const STEPS = [1, 2, 4, 7, 15, 30, 60];
function grade(id, ok) {
  const p = S.words[id] ||= { box: 0, ok: 0, ko: 0 };
  if (ok) { p.ok++; p.box = Math.min(p.box + 1, STEPS.length); } else { p.ko++; p.box = 0; }
  p.due = addDays(today(), ok ? STEPS[p.box - 1] : 1);
  markActive();
}
const markActive = () => { if (!S.active.includes(today())) S.active = [...S.active.slice(-400), today()]; };
const status = id => { const p = S.words[id]; return !p ? 'new' : p.box >= 4 ? 'mastered' : 'learning'; };
const known = () => Object.keys(S.words).map(Number).filter(id => BY_ID.has(id));
const score = p => p.ko - p.ok;
const dueIds = () => known().filter(id => S.words[id].due <= today()).sort((a, b) => score(S.words[b]) - score(S.words[a]));
const hardIds = () => known().filter(id => S.words[id].ko > 0).sort((a, b) => score(S.words[b]) - score(S.words[a])).slice(0, 20);
function streak() {
  let d = S.active.includes(today()) ? today() : addDays(today(), -1), n = 0;
  while (S.active.includes(d)) { n++; d = addDays(d, -1); }
  return n;
}

// random inside frequency bands, easiest band first
function pickNew(n, theme) {
  const pool = WORDS.filter(w => !S.words[w.id] && (!theme || w.theme === theme));
  const out = [];
  for (const b of [0, 1, 2, 3]) out.push(...shuffle(pool.filter(w => band(w) === b)).slice(0, n - out.length));
  return out.map(w => w.id);
}
function todaySet() {
  if (S.day?.date !== today()) { S.day = { date: today(), ids: pickNew(S.quota, S.theme), learned: 0, score: null }; save(); }
  return S.day;
}

// ---------- speech (Android built-in TTS) ----------
let ruVoice = null;
const hasTTS = 'speechSynthesis' in window;
function pickVoice() { ruVoice = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').toLowerCase().startsWith('ru')) || null; }
if (hasTTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, slow) {
  if (!hasTTS || !text) return;
  speechSynthesis.cancel();
  // long texts are queued sentence by sentence: Chrome may cut off one very long utterance
  for (const part of unstress(text).split(/(?<=[.!?…»])\s+/)) {
    const u = new SpeechSynthesisUtterance(part);
    u.lang = 'ru-RU'; if (ruVoice) u.voice = ruVoice; u.rate = slow ? 0.55 : S.rate;
    speechSynthesis.speak(u);
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) return say(b.dataset.say, b.dataset.slow === '1');
  const s = e.target.closest('.s');
  if (s) say(s.dataset.t || s.textContent);
});
const sayBtn = (text, label = '🔊') => `<button class="say" data-say="${esc(text)}">${label}</button>`;
const slowBtn = text => `<button class="say" data-say="${esc(text)}" data-slow="1">🐢</button>`;
const bigEar = text => `<button class="say" style="font-size:2.5rem;padding:16px 28px" data-say="${esc(text)}">🔊</button> ${slowBtn(text)}`;

// ---------- word card ----------
const exParts = w => (w.ex || '').split(' = ');
function card(w) {
  const [exRu, exFr] = exParts(w);
  return `<div class="row"><div class="grow"><div class="ru">${esc(w.ru)}</div>
      <span class="tag">${POS[w.pos] || w.pos}${w.g ? ' · ' + GENDER[w.g] : ''}</span> <span class="tag">${esc(THEMES[w.theme] || '')}</span> <span class="tag">n° ${w.id}</span></div>
      ${w.emoji ? `<div class="emoji">${w.emoji}</div>` : ''}</div>
    <div class="row" style="margin-top:8px">${sayBtn(w.ru)} ${slowBtn(w.ru)}</div>
    <div class="meaning">🇬🇧 ${esc(w.en)}<br><span class="fr">🇫🇷 ${esc(w.fr)}</span></div>
    ${w.note ? `<div class="note">💡 ${esc(w.note)}</div>` : ''}
    ${exRu ? `<div class="ex">${sayBtn(exRu)} <b>${esc(exRu)}</b><br><span class="muted">${esc(exFr || '')}</span></div>` : ''}`;
}

// ---------- quiz engine ----------
function options(w, label) {
  const others = shuffle(WORDS.filter(x => x.id !== w.id && plain(x.ru) !== plain(w.ru) && x.en !== w.en));
  const picks = [...new Set([...others.filter(x => x.pos === w.pos), ...others])].slice(0, 3);
  const opts = shuffle([w, ...picks]);
  return { opts: opts.map(label).map(esc), a: opts.indexOf(w) };
}
const WORD_TYPES = ['read', 'pick', 'type', 'type', 'ear', 'dict'];
function wordQ(w, only) {
  const types = (only ? [only] : [...WORD_TYPES, ...(w.emoji ? ['pic'] : [])]).filter(t => hasTTS || (t !== 'ear' && t !== 'dict'));
  const t = pick(types.length ? types : ['read']);
  const emo = w.emoji && t !== 'pic' ? `<div class="emoji">${w.emoji}</div>` : '';
  const base = { key: w.id, after: w.ru, why: `<b>${esc(w.ru)}</b> = ${esc(meaning(w))}` };
  if (t === 'read') return { ...base, ...options(w, meaning), speak: w.ru,
    html: `<div class="ru">${esc(w.ru)}</div>${sayBtn(w.ru)}<p class="muted">What does it mean? · Que veut dire… ?</p>` };
  if (t === 'ear') return { ...base, ...options(w, meaning), speak: w.ru, html: `${bigEar(w.ru)}<p class="muted">Listen — what does it mean? · Écoute — que veut dire… ?</p>` };
  if (t === 'pic') return { ...base, ...options(w, x => x.ru), html: `<div class="emoji">${w.emoji || '❔'}</div><p class="muted">Which word? · Quel mot ?</p>` };
  if (t === 'pick') return { ...base, ...options(w, x => x.ru), html: `${emo}<h2>${esc(meaning(w))}</h2><p class="muted">Which Russian word? · Quel mot russe ?</p>` };
  if (t === 'dict') return { ...base, a: w.ru, speak: w.ru, html: `${bigEar(w.ru)}<p class="muted">Dictation — type what you hear · Dictée</p>` };
  return { ...base, a: w.ru, html: `${emo}<h2>${esc(meaning(w))}</h2><p class="muted">Type it in Russian · Écris-le en russe</p>` };
}
// word-order question from a Russian sentence
function orderQ(key, ru, prompt) {
  const tokens = ru.split(' ');
  if (tokens.length < 3 || tokens.length > 12) return null;
  return { key, tokens: shuffle(tokens.slice()), a: ru, after: ru, html: `<h2>${esc(prompt)}</h2><p class="muted">Put the words in order · Remets les mots dans l’ordre</p>` };
}
// stress quiz: where does the stress fall?
const VOWEL = /[аеиоуыэюя]/i;
function stressQ(w) {
  const bare = unstress(w.ru), right = w.ru.indexOf('́') - 1;
  if (right < 0 || /[ё\s-]/i.test(bare)) return null;
  const pos = [...bare].map((c, i) => VOWEL.test(c) ? i : -1).filter(i => i >= 0);
  if (pos.length < 2) return null;
  const opts = shuffle([right, ...shuffle(pos.filter(i => i !== right)).slice(0, 3)]);
  const mark = i => esc(bare.slice(0, i)) + `<b class="st">${esc(bare[i])}́</b>` + esc(bare.slice(i + 1));
  return { key: w.id, opts: opts.map(mark), a: opts.indexOf(right), after: w.ru, why: `<b>${esc(w.ru)}</b> = ${esc(meaning(w))}`,
    html: `<div class="ru">${esc(bare)}</div><p class="muted">${esc(meaning(w))}</p><p class="muted">Where is the stress? · Où est l’accent tonique ?</p>` };
}

// qs: [{key, html, opts?, a (index | answer text), alt?, tokens?, why?, speak?, after?}] → onDone(results Map key→firstTryOk)
function runQuiz(qs, title, onDone) {
  const queue = qs.slice(), results = new Map();
  let i = 0;
  step();
  function step() {
    const q = queue[i];
    if (!q) return onDone(results);
    const mc = typeof q.a === 'number';
    let body;
    if (mc) body = `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join('')}</div>`;
    else if (q.tokens) body = `<div class="chips ans" id="built"></div><div class="chips" id="pool">${q.tokens.map((t, k) =>
      `<button class="chip" data-k="${k}">${esc(t)}</button>`).join('')}</div><button class="wide" id="ok">Check · Valider</button>`;
    else body = `<form class="typing"><input id="ans" lang="ru" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
      placeholder="по-русски…"><button>OK</button></form>`;
    app.innerHTML = `<h1>${esc(title)}</h1><div class="muted">${Math.min(i + 1, qs.length)} / ${qs.length}${i >= qs.length ? ' · retry · rattrapage' : ''}</div>
      <div class="bar"><span style="width:${100 * results.size / qs.length}%"></span></div>
      <div class="card"><div class="q">${q.html}</div>${body}<div id="fb"></div></div>`;
    if (q.speak) say(q.speak);
    if (mc) app.querySelectorAll('.opt').forEach(b => b.onclick = () => check(+b.dataset.k === q.a, b));
    else if (q.tokens) {
      const built = [];
      const draw = () => { $('#built').innerHTML = built.map((k, j) => `<button class="chip" data-j="${j}">${esc(q.tokens[k])}</button>`).join('');
        app.querySelectorAll('#pool .chip').forEach(b => b.disabled = built.includes(+b.dataset.k)); };
      $('#pool').onclick = e => { const b = e.target.closest('.chip'); if (b && !b.disabled) { built.push(+b.dataset.k); draw(); } };
      $('#built').onclick = e => { const b = e.target.closest('.chip'); if (b) { built.splice(+b.dataset.j, 1); draw(); } };
      $('#ok').onclick = () => { if (built.length) { $('#ok').disabled = true; check(plain(built.map(k => q.tokens[k]).join(' ')) === plain(q.a)); } };
    } else {
      const inp = $('#ans'); inp.focus();
      $('.typing').onsubmit = e => { e.preventDefault(); if (inp.value.trim()) check([q.a, ...(q.alt || [])].some(x => plain(x) === plain(inp.value))); };
    }
    function check(ok, btn) {
      if (!results.has(q.key)) { results.set(q.key, ok); if (!ok) queue.push(q); } // retry missed ones at the end
      if (mc) { app.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); }); if (!ok) btn.classList.add('wrong'); }
      else if (!q.tokens) $('#ans').disabled = true;
      if (q.after) say(q.after);
      $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'ko'}"><b>${ok ? '✓ Correct' : '✗ Not quite · Pas tout à fait'}</b>
        ${!mc && !ok ? `<p>Answer · Réponse : <b>${esc(q.a)}</b></p>` : ''}${q.why ? `<p>${q.why}</p>` : ''}</div>
        <button class="wide" id="next" style="margin-top:10px">Continue →</button>`;
      $('#next').onclick = () => { i++; step(); };
      $('#next').focus();
    }
  }
}
const resultHtml = (res, missedHtml, backHref, backLabel) => {
  const right = [...res.values()].filter(Boolean).length;
  return `<h1>${right} / ${res.size} ✓</h1>
    ${missedHtml ? `<div class="card"><h2>To review · À revoir</h2><ul class="list">${missedHtml}</ul></div>` : right === res.size ? '<div class="card">Perfect! · Parfait ! 🎉</div>' : ''}
    <div class="row"><a class="btn ghost grow" href="#tests">Tests</a><a class="btn grow" href="${backHref}">${backLabel}</a></div>`;
};
const noWords = title => `<h1>${esc(title)}</h1><div class="card">Learn a few words first (Today → Start learning). · Apprends d’abord quelques mots.</div>`;
// mode 'srs' grades every answer; 'drill' only records misses so free practice never pushes reviews further away
function wordQuiz(ids, title, { only, mode = 'srs' } = {}) {
  if (!ids.length) { app.innerHTML = noWords(title); return; }
  runQuiz(shuffle(ids.slice()).map(id => wordQ(BY_ID.get(id), only)), title, res => {
    res.forEach((ok, id) => { if (mode !== 'drill' || !ok) grade(id, ok); });
    markActive();
    if (mode === 'today' && S.day) S.day.score = `${[...res.values()].filter(Boolean).length}/${res.size}`;
    save();
    const missed = [...res].filter(([, ok]) => !ok).map(([id]) => BY_ID.get(id));
    app.innerHTML = resultHtml(res, missed.map(w => `<li>${sayBtn(w.ru)} <b>${esc(w.ru)}</b> — ${esc(meaning(w))}</li>`).join(''), location.hash, 'Again · Encore');
  });
}
// generic multiple-choice / typed drill: qs already built; misses listed at the end
function drill(qs, title, again = location.hash) {
  qs = qs.filter(Boolean);
  if (!qs.length) { app.innerHTML = noWords(title); return; }
  runQuiz(qs, title, res => { markActive(); save(); app.innerHTML = resultHtml(res, '', again, 'Again · Encore'); });
}
// pick 3 distractor labels different from the answer
function mcq(right, pool) {
  const wrong = shuffle([...new Set(pool.filter(x => plain(x) !== plain(right)))]).slice(0, 3);
  const opts = shuffle([right, ...wrong]);
  return { opts: opts.map(esc), a: opts.indexOf(right) };
}

// ---------- conjugation ----------
const PERS = ['я', 'ты', 'он / она́', 'мы', 'вы', 'они́'];
const PAST_P = ['он (m.)', 'она́ (f.)', 'оно́ (n.)', 'они́ (pl.)'];
const IMP_P = ['ты', 'вы'];
const BUDU = ['бу́ду', 'бу́дешь', 'бу́дет', 'бу́дем', 'бу́дете', 'бу́дут'];
const TENSES = { pres: 'Present · Présent', past: 'Past · Passé', fut: 'Future · Futur', imp: 'Imperative · Impératif' };
const VTYPES = {
  1: ['1st conjugation · 1re conjugaison', 'Endings -ю/-у, -ешь, -ет, -ем, -ете, -ют/-ут. Regular: the stem never changes. · Radical stable.'],
  2: ['2nd conjugation · 2e conjugaison', 'Endings -ю/-у, -ишь, -ит, -им, -ите, -ят/-ат. Most -ить verbs. · La plupart des verbes en -ить.'],
  m: ['Consonant change · Alternance de consonne', 'The last consonant of the stem changes: in the я form only (2nd conj.: ви́деть → ви́жу) or in all forms (1st conj.: писа́ть → пишу́, пи́шешь). · La consonne change : seulement à « я » (2e conj.) ou partout (1re conj.).'],
  s: ['Stem change · Radical modifié', 'The present stem cannot be guessed from the infinitive: жить → живу́, дава́ть → даю́, мыть → мо́ю. Learn the я and ты forms. · Le radical du présent est différent de l’infinitif : apprends « я » et « ты ».'],
  x: ['Irregular · Irréguliers', 'Truly irregular verbs: mixed conjugations, odd pasts, unique forms. Learn them by heart. · Vrais irréguliers : à apprendre par cœur.'],
};
// verbs.js line: ipf|pf|en|fr|type|forms|note — forms: P = ipf present (6), F = pf future (6), Fi = ipf future (if not буду + inf),
// pi / pp = past ipf / pf (m, f, n, pl; only when not the regular -л, -ла, -ло, -ли), ii / ip = imperative ipf / pf (ты, вы)
const VERBS = (window.RU_VERBS || []).map(l => {
  const [ipf, pf, en, fr, t, ov = '', note = ''] = l.split('|'), o = {};
  for (const kv of ov.split(';').filter(Boolean)) { const [k, v] = kv.split('='); o[k] = v.split(','); }
  return { ipf, pf, en, fr, t, o, note };
});
// regular past: vowel + ть(ся) → -л, -ла, -ло, -ли (stress stays where the infinitive has it); anything else must be listed
function autoPast(inf) {
  const refl = inf.endsWith('ся'), b = refl ? inf.slice(0, -2) : inf, st = b.slice(0, -2);
  if (!b.endsWith('ть') || !/[аеёиоуыэюя]$/.test(unstress(st))) return null;
  return (refl ? ['лся', 'лась', 'лось', 'лись'] : ['л', 'ла', 'ло', 'ли']).map(e => st + e);
}
// perfective = prefix + imperfective (чита́ть → прочита́ть, учи́ть → вы́учить): build its forms from the imperfective ones.
// A stressed prefix (вы́-) takes the stress away from the rest of the word.
function prefixer(v) {
  const a = unstress(v.ipf), b = unstress(v.pf);
  if (!v.ipf || !v.pf || b === a || !b.endsWith(a)) return null;
  const n = b.length - a.length, stressed = v.pf.indexOf('́') === n;
  // a one-syllable form (жду, спи, мой) carries no mark: once prefixed, its stress falls on that last vowel (подожду́, поспи́)
  const mark = f => /[́ё]/.test(f) || !/[аеиоуыэюя]/.test(b.slice(0, n)) ? f : f.replace(/([аеиоуыэюя])([^аеиоуыэюя]*)$/, '$1́$2');
  return stressed ? f => v.pf.slice(0, n + 1) + unstress(f) : f => b.slice(0, n) + mark(f);
}
const derive = (v, list) => { const p = prefixer(v); return p && list ? list.map(p) : null; };
// asp 'i' = imperfective, 'p' = perfective → array of forms or null
function forms(v, asp, t) {
  const inf = asp === 'i' ? v.ipf : v.pf, o = v.o;
  if (!inf) return null;
  if (t === 'pres') return asp === 'i' ? o.P || null : null;
  if (t === 'fut') return asp === 'i' ? o.Fi || BUDU.map(b => b + ' ' + inf) : o.F || derive(v, o.P);
  if (t === 'past') return asp === 'i' ? o.pi || autoPast(inf) : o.pp || derive(v, o.pi) || autoPast(inf);
  return asp === 'i' ? o.ii || null : o.ip || derive(v, o.ii);
}
const whoList = t => t === 'past' ? PAST_P : t === 'imp' ? IMP_P : PERS;
const verbLabel = v => `${v.en} · ${v.fr}`;
function conjQ(k, ts) {
  for (;;) {
    const v = pick(VERBS), t = pick(ts), asp = t === 'pres' || !v.pf ? 'i' : v.ipf && Math.random() < .5 ? 'i' : 'p';
    const f = forms(v, asp, t);
    if (!f) continue;
    const p = Math.random() * f.length | 0, inf = asp === 'i' ? v.ipf : v.pf, who = whoList(t);
    const aspName = asp === 'i' ? 'imperfective · imperfectif' : 'perfective · perfectif';
    return { key: k, a: f[p], alt: f[p].includes('/') ? f[p].split('/') : undefined,
      after: t === 'imp' ? f[p] : `${who[p].split(' ')[0]} ${f[p]}`,
      html: `<div class="ru">${esc(inf)}</div><p class="muted">${esc(verbLabel(v))} · ${aspName}</p><h2>${esc(TENSES[t])}</h2><h2>👤 ${esc(who[p])}</h2>`,
      why: f.map((x, j) => `${esc(who[j])} <b>${esc(x)}</b>`).join(', ') };
  }
}
function conjQuiz() {
  const ts = S.tenses.filter(t => TENSES[t]);
  drill(Array.from({ length: 15 }, (_, k) => conjQ(k, ts.length ? ts : ['pres'])), 'Conjugation · Conjugaison', '#conj');
}
// aspect partner: from one aspect, find the other (typed or multiple choice)
function aspectQ(k) {
  const pairs = VERBS.filter(v => v.ipf && v.pf), v = pick(pairs), toPf = Math.random() < .6;
  const from = toPf ? v.ipf : v.pf, to = toPf ? v.pf : v.ipf;
  const html = `<div class="ru">${esc(from)}</div><p class="muted">${esc(verbLabel(v))}</p><h2>${toPf ? 'Perfective partner? · Perfectif ?' : 'Imperfective partner? · Imperfectif ?'}</h2>`;
  const why = `<b>${esc(v.ipf)}</b> (impf.) → <b>${esc(v.pf)}</b> (pf.)${v.note ? '<br>' + esc(v.note) : ''}`;
  if (Math.random() < .5) return { key: k, a: to, html, why, after: to };
  return { key: k, ...mcq(to, pairs.map(x => toPf ? x.pf : x.ipf)), html, why, after: to };
}

// ---------- declension ----------
const CASES = [['Nominative', 'Nominatif', 'кто? что?'], ['Genitive', 'Génitif', 'кого́? чего́?'], ['Dative', 'Datif', 'кому́? чему́?'],
  ['Accusative', 'Accusatif', 'кого́? что?'], ['Instrumental', 'Instrumental', 'кем? чем?'], ['Prepositional', 'Prépositionnel', 'о ком? о чём?']];
const caseName = r => `${CASES[r][0]} · ${CASES[r][1]}`;
const DKINDS = {
  n: ['Nouns — regular patterns · Noms — modèles réguliers', ['Singular', 'Plural']],
  ni: ['Nouns — irregular · Noms irréguliers', ['Singular', 'Plural']],
  a: ['Adjectives & possessives · Adjectifs & possessifs', ['m.', 'n.', 'f.', 'pl.']],
  p: ['Personal pronouns · Pronoms personnels', ['']],
};
// decl.js line: kind|word|en|fr|note|col1 (6 forms, nom→prep)|col2… — "a/b" = animate/inanimate accusative or two accepted forms
const DECL = (window.RU_DECL || []).map(l => {
  const [kind, w, en, fr, note, ...cols] = l.split('|');
  return { kind, w, en, fr, note, cols: cols.map(c => c.split(',')) };
});
function declTable(d) {
  const heads = DKINDS[d.kind][1];
  return `<div class="scroll"><table class="conj"><tr><th></th>${d.cols.map((_, c) => `<th>${heads[c]}</th>`).join('')}</tr>${CASES.map((cs, r) =>
    `<tr><td class="muted">${cs[0].slice(0, 3)}. <small>${cs[2]}</small></td>${d.cols.map(col => `<td><span class="s">${esc(col[r])}</span></td>`).join('')}</tr>`).join('')}</table></div>`;
}
function caseQ(k) {
  const ctx = window.RU_DRILLS?.cases || [];
  if (ctx.length && Math.random() < .5) { const c = pick(ctx); return { key: k, html: `<h2>${esc(c.q)}</h2>${c.hint ? `<p class="muted">${esc(c.hint)}</p>` : ''}`, opts: c.opts.map(esc), a: c.a, why: c.why, after: c.q.replace('___', unstress(c.opts[c.a])) }; }
  const d = pick(DECL), c = Math.random() * d.cols.length | 0, r = 1 + (Math.random() * 5 | 0);
  const right = d.cols[c][r], heads = DKINDS[d.kind][1];
  return { key: k, ...mcq(right, d.cols.flat().filter(x => x !== '—')), after: right.split('/')[0],
    html: `<div class="ru">${esc(d.w)}</div><p class="muted">${esc(d.en)} · ${esc(d.fr)}</p><h2>${caseName(r)}${heads[c] ? ' · ' + heads[c] : ''}</h2>`,
    why: CASES.map((cs, j) => `${cs[0].slice(0, 3)}. <b>${esc(d.cols[c][j])}</b>`).join(', ') };
}

// ---------- numbers + case ----------
const COUNT_N = (window.RU_DRILLS?.counts || []).map(l => { const [one, few, many, en, fr] = l.split('|'); return { f: [one, few, many], en, fr }; });
const countForm = n => { const d = n % 10, h = n % 100; return d === 1 && h !== 11 ? 0 : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 1 : 2; };
const COUNT_NUMS = [1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 13, 14, 15, 19, 20, 21, 22, 23, 24, 25, 30, 31, 32, 34, 40, 41, 44, 50, 51, 52, 100, 101, 102, 103, 105, 111, 112, 121, 200, 1000];
function countQ(k) {
  const x = pick(COUNT_N), n = pick(COUNT_NUMS), f = countForm(n), forms = [...new Set(x.f)], opts = shuffle(forms.slice());
  const rule = ['1, 21, 31… → nominative singular · nominatif singulier', '2, 3, 4 (22, 33…) → genitive singular · génitif singulier', '5–20, 25… (and 11–14) → genitive plural · génitif pluriel'][f];
  return { key: k, opts: opts.map(esc), a: opts.indexOf(x.f[f]), after: `${n} ${x.f[f]}`,
    html: `<div class="ru">${n} ___</div><p class="muted">${esc(x.f[0])} — ${esc(x.en)} · ${esc(x.fr)}</p>`, why: `<b>${n} ${esc(x.f[f])}</b> — ${rule}` };
}
const numbersQuiz = () => drill(Array.from({ length: 15 }, (_, k) => countQ(k)), 'Numbers + case · Nombres + cas', '#numbers');

// ---------- texts & phrases ----------
const TEXTS = { oral: window.RU_TEXTS || [], read: window.RU_READ || [] };
const TEXT_KEY = { oral: 'texts', read: 'reads' };
const PHR_THEMES = window.RU_PHRASE_THEMES || {};
// phrases.js line: theme|ru|en|fr
const PHRASES = (window.RU_PHRASES || []).join('\n').split('\n').filter(l => l.trim() && !l.startsWith('#')).map((l, i) => {
  const [theme, ru, en, fr] = l.split('|');
  return { i, theme, ru, en, fr };
});
const pmeaning = p => `${p.en} · ${p.fr}`;
function phraseQ(p, kind) {
  const same = PHRASES.filter(x => x.theme === p.theme && x !== p), pool = [...shuffle(same), ...shuffle(PHRASES.slice(0, 60))];
  const why = `<b>${esc(p.ru)}</b><br>${esc(pmeaning(p))}`;
  if (kind === 'order') return orderQ(p.i, p.ru, pmeaning(p));
  if (kind === 'ear' && hasTTS) return { key: p.i, ...mcq(pmeaning(p), pool.map(pmeaning)), speak: p.ru, after: p.ru, why, html: `${bigEar(p.ru)}<p class="muted">What did you hear? · Qu’as-tu entendu ?</p>` };
  if (kind === 'trans') return { key: p.i, ...mcq(p.ru, pool.map(x => x.ru)), after: p.ru, why, html: `<h2>${esc(pmeaning(p))}</h2><p class="muted">How do you say it in Russian? · Comment le dire en russe ?</p>` };
  return { key: p.i, ...mcq(pmeaning(p), pool.map(pmeaning)), after: p.ru, why, html: `<div class="big">${esc(p.ru)}</div>${sayBtn(p.ru)}<p class="muted">What does it mean? · Que veut dire… ?</p>` };
}

// ---------- views ----------
const item = (href, title, sub, tag = '') => `<li><a class="item" href="${href}"><b>${title}</b> ${tag}<br><span class="muted">${sub}</span></a></li>`;
const best = (n, of) => n != null ? `<span class="tag">✓ ${n}/${of}</span>` : '';
const views = {
  today() {
    const d = todaySet(), seen = known().length, mastered = known().filter(id => status(id) === 'mastered').length;
    const due = dueIds().length, hard = hardIds().length;
    const since = S.lastExport ? daysBetween(S.lastExport, today()) : daysBetween(S.created, today());
    const remind = seen > 0 && since >= 7;
    return `<h1>Привет! 👋</h1>
      ${remind ? `<div class="banner">💾 ${S.lastExport ? `Last backup ${since} days ago.` : 'No backup yet.'} Save your progress weekly.
        <button class="wide" style="margin-top:8px" onclick="exportData()">Export backup now</button></div>` : ''}
      <div class="card stats"><div><b>${seen}</b><span class="muted">seen / ${WORDS.length}</span></div>
        <div><b>${mastered}</b><span class="muted">mastered</span></div><div><b>🔥 ${streak()}</b><span class="muted">day streak</span></div></div>
      <div class="card"><h2>Today's words · Mots du jour</h2>
        ${d.ids.length ? `<p class="muted">${d.ids.length} words${S.theme ? ' · ' + esc(THEMES[S.theme]) : ''}</p>
        <div class="bar"><span style="width:${100 * d.learned / d.ids.length}%"></span></div>
        <div class="row"><a class="btn grow" href="#learn">${d.learned ? d.learned >= d.ids.length ? 'Look again' : 'Continue' : 'Start learning'}</a>
        <a class="btn grow ${d.learned ? '' : 'ghost'}" href="#test">${d.score ? `Test again (${d.score})` : 'Evening test'}</a></div>`
        : `<p>No new words left${S.theme ? ' in this theme — pick another in Settings' : ' — you have seen them all! 🎓'}.</p>`}</div>
      <div class="card"><h2>Review · Révision</h2><p class="muted">${due} due today${hard ? ` · ${hard} hard words` : ''}</p>
        <div class="row"><a class="btn grow ${due ? '' : 'ghost'}" href="#review">Review</a><a class="btn ghost grow" href="#tests">All tests</a></div></div>`;
  },
  learn() {
    const d = todaySet();
    if (!d.ids.length) return views.today();
    let i = d.learned >= d.ids.length ? 0 : Math.min(d.learned, d.ids.length - 1);
    const show = () => {
      const id = d.ids[i], w = BY_ID.get(id);
      if (!S.words[id]) S.words[id] = { box: 0, ok: 0, ko: 0, due: addDays(today(), 1) };
      d.learned = Math.max(d.learned, i + 1); markActive(); save();
      app.innerHTML = `<h1>Learn · Apprendre</h1><div class="muted">${i + 1} / ${d.ids.length}</div>
        <div class="bar"><span style="width:${100 * (i + 1) / d.ids.length}%"></span></div>
        <div class="card">${card(w)}</div>
        <div class="row"><button class="ghost" id="prev" ${i ? '' : 'disabled'}>←</button>
        ${i + 1 < d.ids.length ? '<button class="grow" id="nx">Next →</button>' : '<a class="btn grow" href="#test">Done — take the test</a>'}</div>`;
      say(w.ru);
      $('#prev').onclick = () => { i--; show(); };
      $('#nx') && ($('#nx').onclick = () => { i++; show(); });
    };
    setTimeout(show);
    return '';
  },
  test() { const d = todaySet(); setTimeout(() => wordQuiz(d.ids.slice(0, d.learned), "Today's test · Test du jour", { mode: 'today' })); return ''; },
  review() {
    const ids = dueIds().slice(0, 40); // 40 per session keeps sessions short; the rest stay due
    if (!ids.length) return `<h1>Review · Révision</h1><div class="card">Nothing due today ✓ · Rien à réviser.</div>
      ${hardIds().length ? '<a class="btn wide" href="#hard">Practice hard words</a>' : ''}<a class="btn ghost wide" style="margin-top:10px" href="#tests">Tests</a>`;
    setTimeout(() => wordQuiz(ids, 'Review · Révision'));
    return '';
  },
  hard() { setTimeout(() => wordQuiz(hardIds(), 'Hard words · Mots difficiles')); return ''; },
  drill(kind) {
    const titles = { ear: 'Listening · Écoute', read: 'Reading · Lecture', type: 'Writing · Écriture', dict: 'Dictation · Dictée', pic: 'Pictures · Images' };
    if (!titles[kind]) return views.tests();
    const pool = kind === 'pic' ? known().filter(id => BY_ID.get(id).emoji) : known();
    setTimeout(() => wordQuiz(shuffle(pool).slice(0, 20), titles[kind], { only: kind, mode: 'drill' }));
    return '';
  },
  stress() { setTimeout(() => drill(shuffle(known().map(id => BY_ID.get(id))).map(stressQ).filter(Boolean).slice(0, 15), 'Stress · Accent tonique')); return ''; },
  order() {
    setTimeout(() => drill(shuffle(known().map(id => BY_ID.get(id))).map(w => { const [ru, fr] = exParts(w); return ru && orderQ(w.id, ru, fr); }).filter(Boolean).slice(0, 12),
      'Sentences · Phrases'));
    return '';
  },
  phrasetest(kind) {
    const titles = { order: 'Phrase order · Phrases dans l’ordre', ear: 'Phrase listening · Écoute de phrases', read: 'Phrase meaning · Sens des phrases', trans: 'Say it in Russian · Dis-le en russe' };
    if (!titles[kind]) return views.tests();
    setTimeout(() => drill(shuffle(PHRASES.slice()).map(p => phraseQ(p, kind)).filter(Boolean).slice(0, 12), titles[kind]));
    return '';
  },
  tests() {
    const n = known().length, due = dueIds().length;
    return `<h1>Tests</h1>
      <div class="card"><h2>📚 Vocabulary · Vocabulaire</h2><ul class="list">
        ${item('#test', '📅 Today’s test · Test du jour', 'Words learned today · Les mots du jour')}
        ${item('#review', '🔁 Review · Révision', `${due} due (spaced repetition) · à réviser`)}
        ${item('#hard', '💪 Hard words · Mots difficiles', `${hardIds().length} words you often miss · que tu rates souvent`)}
        ${item('#drill/ear', '🎧 Listening · Écoute', 'Hear the word, pick the meaning')}
        ${item('#drill/read', '👀 Reading · Lecture', 'Read the word, pick the meaning')}
        ${item('#drill/type', '⌨️ Writing · Écriture', 'Translate into Russian, type it in Cyrillic')}
        ${item('#drill/dict', '✏️ Dictation · Dictée', 'Type the word you hear')}
        ${item('#drill/pic', '🖼️ Pictures · Images', 'Match the picture to the word')}
        ${item('#stress', '🎯 Stress · Accent tonique', 'Find the stressed syllable · Trouve la syllabe accentuée')}
      </ul><p class="muted">Based on the ${n} words you have seen · Basé sur tes ${n} mots vus.</p></div>
      <div class="card"><h2>🔤 Grammar · Grammaire</h2><ul class="list">
        ${item('#conj', '📝 Conjugation · Conjugaison', `${VERBS.length} verb pairs — choose your tenses · choisis tes temps`)}
        ${item('#aspect', '⚖️ Aspect pairs · Paires d’aspect', 'Find the perfective / imperfective partner')}
        ${item('#ctx/aspect', '🧭 Aspect in context · Aspect en contexte', 'Imperfective or perfective? · Imperfectif ou perfectif ?')}
        ${item('#ctx/motion', '🚶 Verbs of motion · Verbes de mouvement', 'идти́ / ходи́ть, е́хать / е́здить, prefixes')}
        ${item('#cases', '🧩 Cases · Déclinaisons', 'Pick the right ending · Choisis la bonne terminaison')}
        ${item('#numbers', '🔢 Numbers + case · Nombres + cas', '1 год, 2 го́да, 5 лет…')}
      </ul></div>
      <div class="card"><h2>🗣️ Comprehension · Compréhension</h2><ul class="list">
        ${item('#texts/oral', '🎙️ Listening texts · Compréhension orale', `${TEXTS.oral.length} texts to listen to, with questions`)}
        ${item('#texts/read', '📰 Reading texts · Compréhension écrite', `${TEXTS.read.length} texts to read, with questions`)}
        ${item('#phrasetest/ear', '👂 Phrase listening · Écoute de phrases', 'Hear an everyday phrase, pick its meaning')}
        ${item('#phrasetest/read', '📖 Phrase meaning · Sens des phrases', 'Read a phrase, pick its meaning')}
        ${item('#phrasetest/trans', '💬 Say it in Russian · Dis-le en russe', 'Pick the right Russian phrase')}
        ${item('#phrasetest/order', '🧱 Phrase order · Phrases dans l’ordre', 'Rebuild everyday phrases')}
        ${item('#order', '🔀 Sentences from your words · Phrases de tes mots', 'Rebuild the example sentences of words you know')}
      </ul></div>
      <div class="card"><h2>🎓 Lesson tests · Tests des leçons</h2><ul class="list">${LESSONS.map((x, k) =>
        `<li><a class="item" href="#lquiz/${k}"><b>${k + 1}. ${esc(x.title)}</b> ${best(S.lessons[k], x.quiz.length)}</a></li>`).join('')}</ul></div>`;
  },
  lessons() {
    return `<h1>Lessons · Leçons</h1>
      <div class="row" style="margin-bottom:14px"><a class="btn ghost grow" href="#verbs">📋 Verbs · Verbes</a><a class="btn ghost grow" href="#decl">📋 Cases · Cas</a><a class="btn ghost grow" href="#phrases">💬 Phrases</a></div>
      <ul class="list card">${LESSONS.map((l, k) =>
      `<li><a class="item" href="#lesson/${k}"><b>${k + 1}. ${esc(l.title)}</b> ${best(S.lessons[k], l.quiz.length)}<br><span class="muted">${esc(l.sub)}</span></a></li>`).join('')}</ul>`;
  },
  lesson(k) {
    const l = LESSONS[k];
    if (!l) return views.lessons();
    return `<a href="#lessons">← Lessons</a><h1>${esc(l.title)}</h1><div class="card lesson-body">${l.body}</div>
      <a class="btn wide" href="#lquiz/${k}">Quiz (${l.quiz.length} questions)</a>
      ${LESSONS[+k + 1] ? `<p style="text-align:center"><a href="#lesson/${+k + 1}">Next lesson →</a></p>` : ''}`;
  },
  lquiz(k) {
    const l = LESSONS[k];
    if (!l) return views.tests();
    setTimeout(() => runQuiz(shuffle(l.quiz.map((q, j) => ({ key: j, html: `<h2>${q.q}</h2>`, opts: q.opts, a: q.a, why: q.why }))), l.title, res => {
      const right = [...res.values()].filter(Boolean).length;
      S.lessons[k] = Math.max(S.lessons[k] ?? 0, right); markActive(); save();
      app.innerHTML = `<h1>${right} / ${res.size} ✓</h1><div class="card">${esc(l.title)}</div>
        <div class="row"><a class="btn ghost grow" href="#lesson/${k}">Read again</a><a class="btn grow" href="#tests">Tests</a></div>`;
    }));
    return '';
  },
  conj() {
    setTimeout(() => app.querySelectorAll('[data-tense]').forEach(c => c.onchange = () => {
      S.tenses = [...app.querySelectorAll('[data-tense]:checked')].map(x => x.dataset.tense); save();
    }));
    return `<h1>Conjugation · Conjugaison</h1><div class="card"><h2>Tenses to practise · Temps à travailler</h2>
      ${Object.entries(TENSES).map(([k, v]) => `<label class="check"><input type="checkbox" data-tense="${k}" ${S.tenses.includes(k) ? 'checked' : ''}>${v}</label>`).join('')}
      <p class="muted">Present = imperfective verbs only. Future = perfective simple future (прочита́ю) or imperfective бу́ду + inf. Type the form in Cyrillic; stress marks are not needed.<br>
      Présent = verbes imperfectifs. Futur = futur perfectif ou бу́ду + infinitif. Les accents toniques ne sont pas exigés.</p>
      <button class="wide" onclick="conjQuiz()">15 questions</button></div><a class="btn ghost wide" href="#verbs">📋 Conjugation tables · Tableaux</a>`;
  },
  verbs(inf) {
    const v = VERBS.find(x => x.ipf === inf || x.pf === inf);
    if (!v) {
      setTimeout(() => { $('#vq').oninput = e => { const q = plain(e.target.value); app.querySelectorAll('[data-v]').forEach(li => li.hidden = q && !li.dataset.v.includes(q)); }; });
      return `<a href="#lessons">← Lessons</a><h1>Verbs · Verbes</h1>
        <p class="muted">Each line is an aspect pair: imperfective (process, habit) / perfective (one finished result). Tap a verb for its full tables. · Chaque ligne est une paire d’aspect.</p>
        <input id="vq" type="search" placeholder="Search ru / en / fr…">
        ${Object.entries(VTYPES).map(([t, [name, desc]]) => {
          const vs = VERBS.filter(x => x.t === t);
          return vs.length ? `<div class="card" style="margin-top:12px"><h2>${name} <span class="tag">${vs.length}</span></h2><p class="muted">${esc(desc)}</p><ul class="list">${vs.map(x =>
            `<li data-v="${esc(plain(`${x.ipf} ${x.pf} ${x.en} ${x.fr}`))}"><a class="item" href="#verbs/${encodeURIComponent(x.ipf || x.pf)}"><b>${esc(x.ipf || '—')}</b> / <b>${esc(x.pf || '—')}</b>
              <span class="muted">— ${esc(verbLabel(x))}</span><br><span class="muted">я ${esc((x.o.P || x.o.F || [''])[0])}, ты ${esc((x.o.P || x.o.F || ['', ''])[1])}</span></a></li>`).join('')}</ul></div>` : '';
        }).join('')}`;
    }
    const block = (asp, t, title) => {
      const f = forms(v, asp, t), who = whoList(t);
      return f ? `<div class="card"><h2>${title}</h2><table class="conj">${f.map((x, p) =>
        `<tr><td class="muted">${esc(who[p])}</td><td><span class="s" data-t="${esc(t === 'imp' ? x : who[p].split(' ')[0] + ' ' + x)}">${esc(x)}</span></td></tr>`).join('')}</table></div>` : '';
    };
    const side = (asp, inf, name) => inf ? `<h2 style="margin-top:18px">${name}: ${esc(inf)} ${sayBtn(inf)}</h2>
      ${block(asp, 'pres', 'Present · Présent')}${block(asp, 'past', 'Past · Passé')}${block(asp, 'fut', asp === 'p' ? 'Future (simple) · Futur' : 'Future (compound) · Futur composé')}${block(asp, 'imp', 'Imperative · Impératif')}` : '';
    return `<a href="#verbs">← Verbs</a><h1>${esc(v.ipf || '—')} / ${esc(v.pf || '—')}</h1><p class="muted">${esc(verbLabel(v))}</p>
      <span class="tag">${esc(VTYPES[v.t][0])}</span>${v.note ? `<div class="note">💡 ${esc(v.note)}</div>` : ''}
      ${side('i', v.ipf, 'Imperfective · Imperfectif')}${side('p', v.pf, 'Perfective · Perfectif')}`;
  },
  aspect() { setTimeout(() => drill(Array.from({ length: 15 }, (_, k) => aspectQ(k)), 'Aspect pairs · Paires d’aspect')); return ''; },
  ctx(kind) {
    const items = window.RU_DRILLS?.[kind];
    if (!items || kind === 'counts' || kind === 'cases') return views.tests();
    const title = kind === 'aspect' ? 'Aspect in context · Aspect en contexte' : 'Verbs of motion · Verbes de mouvement';
    setTimeout(() => drill(shuffle(items.slice()).slice(0, 15).map((c, k) => ({ key: k, html: `<h2>${esc(c.q)}</h2>${c.hint ? `<p class="muted">${esc(c.hint)}</p>` : ''}`,
      opts: c.opts.map(esc), a: c.a, why: c.why, after: c.q.replace('___', unstress(c.opts[c.a])) })), title));
    return '';
  },
  cases() { setTimeout(() => drill(Array.from({ length: 15 }, (_, k) => caseQ(k)), 'Cases · Déclinaisons')); return ''; },
  numbers() {
    return `<h1>Numbers + case · Nombres + cas</h1><div class="card lesson-body">
      <p>After a number, the noun's form depends on the <b>last word</b> of the number:</p>
      <table><tr><th>Ends in…</th><th>Form</th><th>Example</th></tr>
      <tr><td>1 (21, 31, 101…)</td><td>nominative sg.</td><td>оди́н год, два́дцать оди́н год</td></tr>
      <tr><td>2, 3, 4 (22, 34…)</td><td>genitive sg.</td><td>два го́да, три кни́ги</td></tr>
      <tr><td>5–20, 0 (25, 100…)</td><td>genitive pl.</td><td>пять лет, де́сять книг</td></tr></table>
      <p>⚠️ 11–14 always take genitive plural: оди́ннадцать лет, двена́дцать дней.</p>
      <div class="fr-box">🇫🇷 Le français ne marque rien après un nombre (deux ans, cinq ans). Le russe, lui, « compte » à la dernière unité : 21 se comporte comme 1, 22 comme 2. Retiens le trio <b>год – го́да – лет</b> : c’est le modèle de tous les autres.</div></div>
      <button class="wide" onclick="numbersQuiz()">15 questions</button>`;
  },
  decl(w) {
    const d = DECL.find(x => x.w === w);
    if (!d) return `<a href="#lessons">← Lessons</a><h1>Cases · Déclinaisons</h1>
      <div class="card lesson-body"><table><tr><th>Case</th><th>Question</th><th>Main use · Emploi</th></tr>
      <tr><td>Nom.</td><td>кто? что?</td><td>subject · sujet</td></tr><tr><td>Gen.</td><td>кого́? чего́?</td><td>of, нет, quantities, из/от/до/у/без/для · de, absence</td></tr>
      <tr><td>Dat.</td><td>кому́? чему́?</td><td>to (someone), мне нра́вится, к, по · à (COI)</td></tr><tr><td>Acc.</td><td>кого́? что?</td><td>direct object, в/на + direction · COD</td></tr>
      <tr><td>Instr.</td><td>кем? чем?</td><td>with (tool), с, быть/стать + job · avec, par</td></tr><tr><td>Prep.</td><td>о ком? о чём?</td><td>в/на + location, о (about) · lieu, à propos de</td></tr></table>
      <p class="muted">Accusative "x/y" = inanimate / animate (что / кого́): Я ви́жу но́вый дом / но́вого студе́нта. · Accusatif « x/y » = inanimé / animé.</p></div>
      ${Object.entries(DKINDS).map(([k, [name]]) => `<div class="card"><h2>${name}</h2><ul class="list">${DECL.filter(x => x.kind === k).map(x =>
        `<li><a class="item" href="#decl/${encodeURIComponent(x.w)}"><b>${esc(x.w)}</b> <span class="muted">— ${esc(x.en)} · ${esc(x.fr)}</span></a></li>`).join('')}</ul></div>`).join('')}
      <a class="btn wide" href="#cases">🧩 Practise · S’entraîner</a>`;
    return `<a href="#decl">← Cases</a><h1>${esc(d.w)} ${sayBtn(d.w)}</h1><p class="muted">${esc(d.en)} · ${esc(d.fr)}</p>
      <span class="tag">${esc(DKINDS[d.kind][0])}</span>${d.note ? `<div class="note">💡 ${esc(d.note)}</div>` : ''}
      <div class="card" style="margin-top:12px">${declTable(d)}</div>`;
  },
  texts(kind = 'oral') {
    const list = TEXTS[kind];
    if (!list) return views.tests();
    const done = S[TEXT_KEY[kind]];
    return `<h1>${kind === 'oral' ? 'Listening · Compréhension orale' : 'Reading · Compréhension écrite'}</h1>
      <p class="muted">${kind === 'oral' ? 'Listen first without reading, then answer. Show the text only if you are stuck. · Écoute d’abord sans lire.' : 'Read, use the vocabulary list, then answer. · Lis, puis réponds.'}</p>
      <ul class="list card">${list.map((t, k) => `<li><a class="item" href="#text/${kind}/${k}"><b>${k + 1}. ${esc(t.title)}</b> <span class="tag">${esc(t.level)}</span>
      ${best(done[k], t.qs.length)}<br><span class="muted">${esc(t.sub || '')}</span></a></li>`).join('')}</ul>`;
  },
  text(kind, k) {
    const t = TEXTS[kind]?.[k];
    if (!t) return views.texts(kind);
    const oral = kind === 'oral', body = `<div class="text">${esc(t.text).replace(/\n/g, '<br>')}</div>`;
    return `<a href="#texts/${kind}">← Texts</a><h1>${esc(t.title)}</h1><p class="muted">${esc(t.sub || '')} · ${esc(t.level)}</p>
      <div class="card"><div class="row"><button class="grow" data-say="${esc(t.text)}">🔊 Listen · Écouter</button><button class="ghost grow" data-say="${esc(t.text)}" data-slow="1">🐢 Slowly</button></div>
        ${oral ? `<details style="margin-top:12px"><summary>Show the text · Afficher le texte</summary>${body}</details>` : `<div style="margin-top:12px">${body}</div>`}
        ${t.words ? `<details style="margin-top:8px"><summary>Useful words · Vocabulaire utile</summary><p class="muted">${esc(t.words)}</p></details>` : ''}
        <details style="margin-top:8px"><summary>🇬🇧 Translation</summary><p class="muted">${esc(t.en)}</p></details>
        <details style="margin-top:8px"><summary>🇫🇷 Traduction</summary><p class="muted">${esc(t.fr)}</p></details></div>
      <button class="wide" onclick="textQuiz('${kind}', ${+k})">Answer the questions · Questions (${t.qs.length})</button>`;
  },
  phrases(theme) {
    if (!PHR_THEMES[theme]) return `<a href="#lessons">← Lessons</a><h1>Phrasebook · Phrases utiles</h1><ul class="list card">${Object.entries(PHR_THEMES).map(([k, v]) =>
      `<li><a class="item" href="#phrases/${k}"><b>${esc(v)}</b> <span class="tag">${PHRASES.filter(p => p.theme === k).length}</span></a></li>`).join('')}</ul>
      <a class="btn wide" href="#tests">Practise in Tests · S’entraîner</a>`;
    return `<a href="#phrases">← Phrasebook</a><h1>${esc(PHR_THEMES[theme])}</h1><ul class="list card">${PHRASES.filter(p => p.theme === theme).map(p =>
      `<li>${sayBtn(p.ru)} <b>${esc(p.ru)}</b><br><span class="muted">🇬🇧 ${esc(p.en)}<br>🇫🇷 ${esc(p.fr)}</span></li>`).join('')}</ul>`;
  },
  words() {
    setTimeout(() => {
      const draw = () => {
        const q = plain($('#q').value), t = $('#th').value;
        const hits = WORDS.filter(w => (!t || w.theme === t) && (!q || plain(w.ru).includes(q) || (w.en + ' ' + w.fr).toLowerCase().includes(q)));
        $('#list').innerHTML = hits.slice(0, 300).map(w => `<li data-id="${w.id}"><span class="dot ${status(w.id)}"></span><b>${esc(w.ru)}</b> ${w.emoji || ''}
          <span class="muted">— ${esc(meaning(w))}</span></li>`).join('') + (hits.length > 300 ? '<li class="muted">…refine your search</li>' : '');
        $('#count').textContent = hits.length + ' words';
      };
      $('#q').oninput = $('#th').onchange = draw;
      $('#list').onclick = e => {
        const li = e.target.closest('li[data-id]');
        if (!li || e.target.closest('.card')) return;
        if (li.querySelector('.card')) { li.querySelector('.card').remove(); return; }
        li.insertAdjacentHTML('beforeend', `<div class="card" style="margin-top:8px">${card(BY_ID.get(+li.dataset.id))}</div>`);
      };
      draw();
    });
    return `<h1>Words · Mots</h1><input id="q" type="search" placeholder="Search ru / en / fr…">
      <select id="th" style="margin-top:8px"><option value="">All themes</option>${Object.entries(THEMES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
      <p class="muted" id="count"></p><ul class="list card" id="list"></ul>`;
  },
  settings() {
    setTimeout(() => {
      $('#quota').onchange = e => { S.quota = +e.target.value; resetDayIfUnstarted(); };
      $('#theme').onchange = e => { S.theme = e.target.value; resetDayIfUnstarted(); };
      $('#rate').oninput = e => { S.rate = +e.target.value; save(); };
      $('#imp').onchange = e => e.target.files[0]?.text().then(importData);
      navigator.storage?.persisted?.().then(p => $('#persist').textContent = p ? '✓ Storage is persistent' : '⚠ Storage not persistent yet (install the app to the home screen)');
    });
    const voice = !hasTTS ? '⚠ Speech not supported in this browser' : ruVoice ? `✓ ${esc(ruVoice.name)} (${esc(ruVoice.lang)})`
      : '⚠ No Russian voice found. Android Settings → General management → Text-to-speech → engine settings → Install voice data → Русский';
    return `<h1>Settings</h1>
      <div class="card"><label for="quota">New words per day</label><select id="quota">${[10, 20, 30, 40, 50, 75, 100].map(n => `<option ${n === S.quota ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <label for="theme">Theme of new words</label><select id="theme"><option value="">All (by frequency)</option>${Object.entries(THEMES).map(([k, v]) =>
          `<option value="${k}" ${k === S.theme ? 'selected' : ''}>${v} (${WORDS.filter(w => w.theme === k && !S.words[w.id]).length} new)</option>`).join('')}</select>
        <p class="muted">Changes apply to today if you haven't started, otherwise from tomorrow.</p></div>
      <div class="card"><label for="rate">Speech speed</label><input id="rate" type="range" min="0.5" max="1.2" step="0.05" value="${S.rate}" class="wide">
        <p class="muted">${voice}</p>${sayBtn('Здравствуйте! Как дела?', '🔊 Test voice')}</div>
      <div class="card"><h2>Backup · Sauvegarde</h2><p class="muted">Last export: ${S.lastExport || 'never'} · <span id="persist"></span></p>
        <div class="row"><button class="grow" onclick="exportData()">Export</button><label class="btn ghost grow" style="margin:0">Import<input id="imp" type="file" accept=".json,application/json" hidden></label></div></div>
      <p class="muted" style="text-align:center">Words 1–1000: masterrussian.com · 1001+: Wiktionary (Russian National Corpus frequency list) · ${WORDS.length} words</p>`;
  },
};
function resetDayIfUnstarted() { if (S.day && !S.day.learned) S.day = null; save(); }

function textQuiz(kind, k) {
  const t = TEXTS[kind][k];
  runQuiz(t.qs.map((q, j) => ({ key: j, html: `<h2>${esc(q.q)}</h2>`, opts: q.opts.map(esc), a: q.a, why: q.why && esc(q.why) })), t.title, res => {
    const d = S[TEXT_KEY[kind]];
    d[k] = Math.max(d[k] ?? 0, [...res.values()].filter(Boolean).length); markActive(); save();
    app.innerHTML = resultHtml(res, '', `#text/${kind}/${k}`, 'Back to the text · Retour au texte');
  });
}

// ---------- backup ----------
function exportData() {
  const blob = new Blob([JSON.stringify({ app: 'ru-daily', version: 2, exported: today(), state: S })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `russian-backup-${today()}.json`; a.click();
  S.lastExport = today(); save(); route();
}
const isDay = d => typeof d === 'string' && /^\d{4}-\d\d-\d\d$/.test(d);
const nums = (o, max) => Object.fromEntries(Object.entries(o || {}).filter(([i, v]) => +i < max && Number.isFinite(v)));
function importData(text) {
  try {
    const st = JSON.parse(text).state;
    if (!st || typeof st.words !== 'object') throw new Error('not a Russian Daily backup');
    const words = {};
    for (const [id, p] of Object.entries(st.words)) {
      if (BY_ID.has(+id) && p && [p.box, p.ok, p.ko].every(Number.isFinite) && isDay(p.due)) words[id] = { box: p.box, ok: p.ok, ko: p.ko, due: p.due };
    }
    if (!confirm(`Replace current progress with this backup (${Object.keys(words).length} words)?`)) return;
    const f = fresh();
    S = { ...f, words, quota: +st.quota || f.quota, theme: THEMES[st.theme] ? st.theme : '', rate: Math.min(1.2, Math.max(0.5, +st.rate || f.rate)),
      lessons: nums(st.lessons, LESSONS.length), texts: nums(st.texts, TEXTS.oral.length), reads: nums(st.reads, TEXTS.read.length),
      tenses: Array.isArray(st.tenses) ? st.tenses.filter(t => TENSES[t]) : f.tenses,
      active: Array.isArray(st.active) ? st.active.filter(isDay) : [], created: isDay(st.created) ? st.created : f.created, lastExport: today() };
    save(); alert('Backup restored ✓'); location.hash = '#today'; route();
  } catch (e) { alert('Import failed: ' + e.message); }
}

// ---------- router ----------
const TAB = { learn: 'today', lesson: 'lessons', verbs: 'lessons', decl: 'lessons', phrases: 'lessons', words: 'words', settings: 'settings', today: 'today', lessons: 'lessons' };
function route() {
  const [name, ...args] = (location.hash.slice(1) || 'today').split('/').map(decodeURIComponent);
  if (hasTTS) speechSynthesis.cancel();
  app.innerHTML = (views[name] || views.today)(...args);
  const tab = views[name] ? TAB[name] || 'tests' : 'today';
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.hash === '#' + tab));
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
