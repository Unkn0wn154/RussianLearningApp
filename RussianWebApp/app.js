'use strict';

// ---------- data ----------
const POS = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', pron: 'pronoun', prep: 'preposition',
  conj: 'conjunction', part: 'particle', num: 'number', int: 'interjection', pred: 'predicative' };
const GENDER = { m: 'masc.', f: 'fem.', n: 'neut.', pl: 'plural' };
const THEMES = {
  core: 'Grammar words · Mots-outils', people: 'People & family · Personnes & famille', body: 'Body · Corps',
  home: 'Home & objects · Maison & objets', nature: 'Nature & weather · Nature & météo', time: 'Time · Temps',
  color: 'Colors · Couleurs', num: 'Numbers & quantity · Nombres', place: 'Places & travel · Lieux & voyages',
  food: 'Food & drink · Nourriture', feel: 'Mind & feelings · Esprit & sentiments', move: 'Motion · Mouvement',
  talk: 'Speech · Parole', act: 'Actions · Actions', society: 'Society & work · Société & travail',
  war: 'Military · Armée', qual: 'Qualities · Qualités', abstract: 'Abstract · Notions abstraites',
};
// line format: rank|ru|pos|gender|en|fr|theme|emoji|note|example
const WORDS = window.WORD_DATA.join('\n').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
  const [id, ru, pos, g, en, fr, theme, emoji, note, ex] = l.split('|');
  return { id: +id, ru, pos, g, en, fr, theme, emoji, note, ex };
});
const BY_ID = new Map(WORDS.map(w => [w.id, w]));
const band = w => w.id <= 200 ? 0 : w.id <= 500 ? 1 : 2;

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const today = () => new Date().toLocaleDateString('sv'); // local YYYY-MM-DD
const addDays = (d, n) => { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv'); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
// strip stress marks, ё→е, punctuation: what we compare typed answers on
const plain = s => s.normalize('NFD').replace(/́/g, '').normalize('NFC').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я -]/g, '').trim();
const meaning = w => `${w.en} · ${w.fr}`;

// ---------- state ----------
const KEY = 'ru-daily-v1';
const fresh = () => ({ quota: 30, theme: '', rate: 0.9, words: {}, day: null, lessons: {}, active: [], created: today(), lastExport: null });
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
  if (!S.active.includes(today())) S.active = [...S.active.slice(-400), today()];
}
const status = id => { const p = S.words[id]; return !p ? 'new' : p.box >= 4 ? 'mastered' : 'learning'; };
const dueIds = () => Object.keys(S.words).filter(id => S.words[id].due <= today() && BY_ID.has(+id)).map(Number)
  .sort((a, b) => (S.words[b].ko - S.words[b].ok) - (S.words[a].ko - S.words[a].ok));
const hardIds = () => Object.keys(S.words).map(Number).filter(id => S.words[id].ko > 0 && BY_ID.has(id))
  .sort((a, b) => (S.words[b].ko - S.words[b].ok) - (S.words[a].ko - S.words[a].ok)).slice(0, 20);
function streak() {
  let d = S.active.includes(today()) ? today() : addDays(today(), -1), n = 0;
  while (S.active.includes(d)) { n++; d = addDays(d, -1); }
  return n;
}

// random inside frequency bands (top 200, 201-500, 501-1000), easiest band first
function pickNew(n, theme) {
  const pool = WORDS.filter(w => !S.words[w.id] && (!theme || w.theme === theme));
  const out = [];
  for (const b of [0, 1, 2]) out.push(...shuffle(pool.filter(w => band(w) === b)).slice(0, n - out.length));
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
function say(text, rate = S.rate) {
  if (!hasTTS) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/́/g, ''));
  u.lang = 'ru-RU'; if (ruVoice) u.voice = ruVoice; u.rate = rate;
  speechSynthesis.speak(u);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) say(b.dataset.say, b.textContent === '🐢' ? 0.55 : S.rate); });
const sayBtn = (text, label = '🔊') => `<button class="say" data-say="${esc(text)}">${label}</button>`;

// ---------- word card ----------
function card(w) {
  const [exRu, exFr] = (w.ex || '').split(' = ');
  return `<div class="row"><div class="grow"><div class="ru">${esc(w.ru)}</div>
      <span class="tag">${POS[w.pos] || w.pos}${w.g ? ' · ' + GENDER[w.g] : ''}</span> <span class="tag">${esc(THEMES[w.theme] || '')}</span></div>
      ${w.emoji ? `<div class="emoji">${w.emoji}</div>` : ''}</div>
    <div class="row" style="margin-top:8px">${sayBtn(w.ru)} ${sayBtn(w.ru, '🐢')}</div>
    <div class="meaning">🇬🇧 ${esc(w.en)}<br><span class="fr">🇫🇷 ${esc(w.fr)}</span></div>
    ${w.note ? `<div class="note">💡 ${esc(w.note)}</div>` : ''}
    ${exRu ? `<div class="ex">${sayBtn(exRu)} <b>${esc(exRu)}</b><br><span class="muted">${esc(exFr || '')}</span></div>` : ''}`;
}

// ---------- quiz engine ----------
function options(w, label) {
  const others = shuffle(WORDS.filter(x => x.id !== w.id && plain(x.ru) !== plain(w.ru) && x.en !== w.en));
  const same = others.filter(x => x.pos === w.pos);
  const picks = [...new Set([...same, ...others])].slice(0, 3);
  const opts = shuffle([w, ...picks]);
  return { opts: opts.map(label).map(esc), a: opts.indexOf(w) };
}
function wordQ(w) {
  const types = ['ru2m', 'm2ru', 'type', 'type'];
  if (w.emoji) types.push('pic');
  if (hasTTS) types.push('ear');
  const t = types[Math.random() * types.length | 0];
  const emo = w.emoji ? `<div class="emoji">${w.emoji}</div>` : '';
  const base = { key: w.id, after: w.ru, why: `<b>${esc(w.ru)}</b> = ${esc(meaning(w))}` };
  if (t === 'ru2m') return { ...base, ...options(w, meaning), speak: w.ru,
    html: `<div class="ru">${esc(w.ru)}</div>${sayBtn(w.ru)}<p class="muted">What does it mean? · Que veut dire…?</p>` };
  if (t === 'ear') return { ...base, ...options(w, meaning), speak: w.ru,
    html: `<button class="say" style="font-size:2.5rem;padding:16px 28px" data-say="${esc(w.ru)}">🔊</button><p class="muted">Listen — what does it mean?</p>` };
  if (t === 'pic') return { ...base, ...options(w, x => x.ru), html: `<div class="emoji">${w.emoji}</div><p class="muted">Which word? · Quel mot ?</p>` };
  if (t === 'm2ru') return { ...base, ...options(w, x => x.ru), html: `${emo}<h2>${esc(meaning(w))}</h2><p class="muted">Which Russian word?</p>` };
  return { ...base, a: w.ru, html: `${emo}<h2>${esc(meaning(w))}</h2><p class="muted">Type it in Russian · Écris-le en russe</p>` };
}

// qs: [{key, html, opts?, a (index | answer text), why?, speak?, after?}] → onDone(results Map key→firstTryOk)
function runQuiz(qs, title, onDone) {
  const queue = qs.slice(), results = new Map();
  let i = 0;
  step();
  function step() {
    const q = queue[i];
    if (!q) return onDone(results);
    const mc = typeof q.a === 'number';
    app.innerHTML = `<h1>${esc(title)}</h1><div class="muted">${Math.min(i + 1, qs.length)} / ${qs.length}${i >= qs.length ? ' · retry' : ''}</div>
      <div class="bar"><span style="width:${100 * results.size / qs.length}%"></span></div>
      <div class="card"><div class="q">${q.html}</div>
      ${mc ? `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join('')}</div>`
           : `<form class="typing"><input id="ans" lang="ru" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="по-русски…"><button>OK</button></form>`}
      <div id="fb"></div></div>`;
    if (q.speak) say(q.speak);
    if (mc) app.querySelectorAll('.opt').forEach(b => b.onclick = () => check(+b.dataset.k === q.a, b));
    else { const inp = $('#ans'); inp.focus(); $('.typing').onsubmit = e => { e.preventDefault(); if (inp.value.trim()) check(plain(inp.value) === plain(q.a)); }; }
    function check(ok, btn) {
      if (!results.has(q.key)) { results.set(q.key, ok); if (!ok) queue.push(q); } // retry missed ones at the end
      if (mc) { app.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); }); if (!ok) btn.classList.add('wrong'); }
      else $('#ans').disabled = true;
      if (q.after) say(q.after);
      $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'ko'}"><b>${ok ? '✓ Correct' : '✗ Not quite'}</b>
        ${!mc && !ok ? `<p>Answer: <b>${esc(q.a)}</b></p>` : ''}${q.why ? `<p>${q.why}</p>` : ''}</div>
        <button class="wide" id="next" style="margin-top:10px">Continue →</button>`;
      $('#next').onclick = () => { i++; step(); };
      $('#next').focus();
    }
  }
}
function wordQuiz(ids, title) {
  if (!ids.length) { location.hash = '#today'; return; }
  runQuiz(shuffle(ids.slice()).map(id => wordQ(BY_ID.get(id))), title, res => {
    res.forEach((ok, id) => grade(id, ok));
    const right = [...res.values()].filter(Boolean).length, missed = [...res].filter(([, ok]) => !ok).map(([id]) => BY_ID.get(id));
    if (title.startsWith('Today') && S.day) S.day.score = `${right}/${res.size}`;
    save();
    app.innerHTML = `<h1>${right} / ${res.size} ✓</h1>
      ${missed.length ? `<div class="card"><h2>To review · À revoir</h2><ul class="list">${missed.map(w =>
        `<li>${sayBtn(w.ru)} <b>${esc(w.ru)}</b> — ${esc(meaning(w))}</li>`).join('')}</ul>
        <p class="muted">These come back tomorrow in Review.</p></div>` : '<div class="card">Perfect! · Parfait ! 🎉</div>'}
      <a class="btn wide" href="#today">Home</a>`;
  });
}

// ---------- views ----------
const views = {
  today() {
    const d = todaySet(), learnedTotal = Object.keys(S.words).length, mastered = Object.keys(S.words).filter(id => status(id) === 'mastered').length;
    const due = dueIds().length, hard = hardIds().length;
    const since = S.lastExport ? daysBetween(S.lastExport, today()) : daysBetween(S.created, today());
    const remind = learnedTotal > 0 && since >= 7;
    return `<h1>Привет! 👋</h1>
      ${remind ? `<div class="banner">💾 ${S.lastExport ? `Last backup ${since} days ago.` : 'No backup yet.'} Save your progress weekly.
        <button class="wide" style="margin-top:8px" onclick="exportData()">Export backup now</button></div>` : ''}
      <div class="card stats"><div><b>${learnedTotal}</b><span class="muted">seen / ${WORDS.length}</span></div>
        <div><b>${mastered}</b><span class="muted">mastered</span></div><div><b>🔥 ${streak()}</b><span class="muted">day streak</span></div></div>
      <div class="card"><h2>Today's words · Mots du jour</h2>
        ${d.ids.length ? `<p class="muted">${d.ids.length} words${S.theme ? ' · ' + esc(THEMES[S.theme]) : ''}</p>
        <div class="bar"><span style="width:${100 * d.learned / d.ids.length}%"></span></div>
        <div class="row"><a class="btn grow" href="#learn">${d.learned ? d.learned >= d.ids.length ? 'Look again' : 'Continue' : 'Start learning'}</a>
        <a class="btn grow ${d.learned ? '' : 'ghost'}" href="#test">${d.score ? `Test again (${d.score})` : 'Evening test'}</a></div>`
        : `<p>No new words left${S.theme ? ' in this theme — pick another in Settings' : ' — you have seen them all! 🎓'}.</p>`}</div>
      <div class="card"><h2>Review · Révision</h2><p class="muted">${due} due today${hard ? ` · ${hard} hard words` : ''}</p>
        <div class="row"><a class="btn grow ${due ? '' : 'ghost'}" href="#review">Review</a>${hard ? '<a class="btn ghost grow" href="#hard">Hard words</a>' : ''}</div></div>`;
  },
  learn() {
    const d = todaySet();
    let i = Math.min(d.learned, d.ids.length - 1);
    if (d.learned >= d.ids.length) i = 0;
    const show = () => {
      const id = d.ids[i], w = BY_ID.get(id);
      if (!S.words[id]) S.words[id] = { box: 0, ok: 0, ko: 0, due: addDays(today(), 1) };
      d.learned = Math.max(d.learned, i + 1); save();
      app.innerHTML = `<h1>Learn · Apprendre</h1><div class="muted">${i + 1} / ${d.ids.length}</div>
        <div class="bar"><span style="width:${100 * (i + 1) / d.ids.length}%"></span></div>
        <div class="card">${card(w)}</div>
        <div class="row"><button class="ghost" id="prev" ${i ? '' : 'disabled'}>←</button>
        ${i + 1 < d.ids.length ? '<button class="grow" id="nx">Next →</button>' : '<a class="btn grow" href="#test">Done — take the test</a>'}</div>`;
      say(w.ru);
      $('#prev').onclick = () => { i--; show(); };
      $('#nx') && ($('#nx').onclick = () => { i++; show(); });
    };
    if (!d.ids.length) return views.today();
    setTimeout(show);
    return '';
  },
  test() { const d = todaySet(); setTimeout(() => wordQuiz(d.ids.slice(0, d.learned), "Today's test · Test du jour")); return ''; },
  review() {
    const ids = dueIds().slice(0, 40); // shortcut: 40 per session keeps sessions short; the rest stay due
    if (!ids.length) return `<h1>Review</h1><div class="card">Nothing due today ✓ · Rien à réviser.</div>
      ${hardIds().length ? '<a class="btn wide" href="#hard">Practice hard words</a>' : ''}`;
    setTimeout(() => wordQuiz(ids, 'Review · Révision'));
    return '';
  },
  hard() { setTimeout(() => wordQuiz(hardIds(), 'Hard words · Mots difficiles')); return ''; },
  lessons() {
    return `<h1>Lessons · Leçons</h1><ul class="list card">${LESSONS.map((l, k) =>
      `<li><a href="#lesson/${k}" style="text-decoration:none;color:inherit;display:block"><b>${k + 1}. ${esc(l.title)}</b>
        ${S.lessons[k] != null ? `<span class="tag">✓ ${S.lessons[k]}/${l.quiz.length}</span>` : ''}<br><span class="muted">${esc(l.sub)}</span></a></li>`).join('')}</ul>`;
  },
  lesson(k) {
    const l = LESSONS[k];
    if (!l) return views.lessons();
    return `<a href="#lessons">← Lessons</a><h1>${esc(l.title)}</h1><div class="card lesson-body">${l.body}</div>
      <button class="wide" onclick="lessonQuiz(${k})">Quiz (${l.quiz.length} questions)</button>
      ${LESSONS[+k + 1] ? `<p style="text-align:center"><a href="#lesson/${+k + 1}">Next lesson →</a></p>` : ''}`;
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
      <p class="muted" style="text-align:center">Word list: masterrussian.com top 1000 · ${WORDS.length} words</p>`;
  },
};
function resetDayIfUnstarted() { if (S.day && !S.day.learned) S.day = null; save(); }

function lessonQuiz(k) {
  const l = LESSONS[k];
  runQuiz(l.quiz.map((q, j) => ({ key: j, html: `<h2>${q.q}</h2>`, opts: q.opts, a: q.a, why: q.why })), l.title, res => {
    const right = [...res.values()].filter(Boolean).length;
    S.lessons[k] = Math.max(S.lessons[k] ?? 0, right); save();
    app.innerHTML = `<h1>${right} / ${res.size} ✓</h1><div class="card">${esc(l.title)}</div>
      <div class="row"><a class="btn ghost grow" href="#lesson/${k}">Read again</a><a class="btn grow" href="#lessons">Lessons</a></div>`;
  });
}

// ---------- backup ----------
function exportData() {
  const blob = new Blob([JSON.stringify({ app: 'ru-daily', version: 1, exported: today(), state: S })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `russian-backup-${today()}.json`; a.click();
  S.lastExport = today(); save(); route();
}
function importData(text) {
  try {
    const st = JSON.parse(text).state;
    if (!st || typeof st.words !== 'object') throw new Error('not a Russian Daily backup');
    const words = {};
    for (const [id, p] of Object.entries(st.words)) {
      if (BY_ID.has(+id) && [p.box, p.ok, p.ko].every(Number.isFinite) && /^\d{4}-\d\d-\d\d$/.test(p.due)) words[id] = { box: p.box, ok: p.ok, ko: p.ko, due: p.due };
    }
    if (!confirm(`Replace current progress with this backup (${Object.keys(words).length} words)?`)) return;
    const f = fresh();
    S = { ...f, words, quota: +st.quota || f.quota, theme: THEMES[st.theme] ? st.theme : '', rate: +st.rate || f.rate,
      lessons: Object.fromEntries(Object.entries(st.lessons || {}).filter(([, v]) => Number.isFinite(v))), active: Array.isArray(st.active) ? st.active.filter(d => typeof d === 'string') : [],
      created: st.created || f.created, lastExport: today() };
    save(); alert('Backup restored ✓'); location.hash = '#today'; route();
  } catch (e) { alert('Import failed: ' + e.message); }
}

// ---------- router ----------
function route() {
  const [name, arg] = (location.hash.slice(1) || 'today').split('/');
  if (hasTTS) speechSynthesis.cancel();
  app.innerHTML = (views[name] || views.today)(arg);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.hash === '#' + name));
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
