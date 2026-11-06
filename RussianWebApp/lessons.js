// Grammar lessons. body = HTML (EN text + 🇫🇷 boxes with the French angle), quiz = [{q, opts, a (index), why}]
const LESSONS = [
{
  title: 'Alphabet & pronunciation', sub: 'Cyrillic, false friends, stress · Alphabet, faux amis, accent tonique',
  body: `
<p>Russian uses 33 letters. Many look familiar; some are <b>false friends</b>.</p>
<h3>Same look, same sound</h3>
<p><span class="r">А К М О Т</span> ≈ a, k, m, o, t</p>
<h3>False friends ⚠️</h3>
<table><tr><th>Letter</th><th>Sound</th><th>Example</th></tr>
<tr><td>В в</td><td>v</td><td>вода́ (water)</td></tr><tr><td>Н н</td><td>n</td><td>нос (nose)</td></tr>
<tr><td>Р р</td><td>rolled r</td><td>рот (mouth)</td></tr><tr><td>С с</td><td>s</td><td>сок (juice)</td></tr>
<tr><td>У у</td><td>ou</td><td>ум (mind)</td></tr><tr><td>Х х</td><td>kh (German "Bach")</td><td>хлеб (bread)</td></tr>
<tr><td>Е е</td><td>ye (yé)</td><td>есть (to eat)</td></tr><tr><td>Ё ё</td><td>yo — always stressed</td><td>ёлка</td></tr></table>
<h3>New shapes</h3>
<table><tr><td>Б б</td><td>b</td><td>Г г</td><td>g (always hard)</td></tr><tr><td>Д д</td><td>d</td><td>Ж ж</td><td>j (as in « jour »)</td></tr>
<tr><td>З з</td><td>z</td><td>И и</td><td>i</td></tr><tr><td>Й й</td><td>short y (« paille »)</td><td>Л л</td><td>l</td></tr>
<tr><td>П п</td><td>p</td><td>Ф ф</td><td>f</td></tr><tr><td>Ц ц</td><td>ts</td><td>Ч ч</td><td>tch</td></tr>
<tr><td>Ш ш</td><td>ch (« chat »)</td><td>Щ щ</td><td>soft long « chch »</td></tr>
<tr><td>Ы ы</td><td>a dark « i » (tongue pulled back)</td><td>Э э</td><td>è</td></tr>
<tr><td>Ю ю</td><td>you (« iou »)</td><td>Я я</td><td>ya</td></tr>
<tr><td>Ь</td><td>soft sign: softens the consonant before it</td><td>Ъ</td><td>hard sign: separator</td></tr></table>
<h3>Hard and soft vowels</h3>
<p>Pairs: <b>а/я, э/е, ы/и, о/ё, у/ю</b>. The second of each pair makes the consonant before it <i>soft</i> (palatalised): нос vs нёс.</p>
<h3>Stress is everything</h3>
<p>Stress is free and can move: <b>ру́ки</b> (hands) vs <b>руки́</b> (of the hand). Unstressed <b>о</b> sounds like <b>a</b>: молоко́ → « malakó ». Unstressed <b>е/я</b> sound close to <b>i</b>: язы́к → « yizyk ». The app marks stress with an accent: <b>сло́во</b>.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> le français accentue toujours la dernière syllabe, le russe non : l'accent est mobile et change le sens (<b>за́мок</b> = château, <b>замо́к</b> = cadenas). Bonne nouvelle : beaucoup de sons existent déjà en français et pas en anglais — <b>ж</b> = « j » de <i>jour</i>, <b>ш</b> = « ch » de <i>chat</i>, <b>у</b> = « ou », <b>й</b> = le « ille » de <i>paille</i>, <b>ль</b> mou ≈ le « l » de <i>lit</i>. Le <b>р</b> est roulé (comme en espagnol), jamais grasseyé. Le signe mou <b>ь</b> ressemble à ce qu'on fait dans « gn » de <i>montagne</i> : la langue se plaque contre le palais.</div>`,
  quiz: [
    { q: 'How do you read <b>РОТ</b>?', opts: ['pot', 'rot', 'ret', 'pom'], a: 1, why: 'Р = r. рот = mouth / bouche.' },
    { q: 'Which letter sounds like French « ou »?', opts: ['Ю', 'У', 'Ы', 'О'], a: 1, why: 'У у = « ou ».' },
    { q: 'Ж sounds like…', opts: ['the « j » of « jour »', 'English « j » in « jam »', '« ch » of « chat »', 'z'], a: 0, why: 'Ж = j français (jour). English « jam » is closer to дж.' },
    { q: 'In <b>молоко́</b>, how do the first two <b>о</b> sound?', opts: ['o', 'ou', 'a', 'silent'], a: 2, why: 'Unstressed о → « a »: malakó.' },
    { q: 'What does <b>ь</b> do?', opts: ['Adds a vowel', 'Softens the preceding consonant', 'Marks stress', 'Nothing'], a: 1, why: 'Signe mou: palatalise la consonne.' },
    { q: 'Which letter is always stressed?', opts: ['е', 'ё', 'э', 'я'], a: 1, why: 'ё carries the stress whenever it appears.' },
  ],
},
{
  title: 'Nouns: gender & plural', sub: 'Masculine, feminine, neuter · Genre et pluriel',
  body: `
<p>Every noun has a gender, and you can usually see it from the ending (nominative singular):</p>
<table><tr><th>Gender</th><th>Endings</th><th>Examples</th></tr>
<tr><td>Masculine</td><td>consonant, -й, (-ь)</td><td>дом, музе́й, слова́рь</td></tr>
<tr><td>Feminine</td><td>-а, -я, (-ь)</td><td>ма́ма, неде́ля, ночь</td></tr>
<tr><td>Neuter</td><td>-о, -е, -мя</td><td>окно́, мо́ре, вре́мя</td></tr></table>
<p><b>-ь words</b> can be either gender — learn them with the word (день m., ночь f.). Nouns ending in <b>-ость</b> are always feminine (ра́дость). Male people in -а stay masculine: па́па, дя́дя, мужчи́на.</p>
<h3>Plural (nominative)</h3>
<table><tr><td>m. / f.</td><td>-ы (after hard) / -и (after soft, г к х ж ш ч щ)</td><td>стол → столы́, кни́га → кни́ги</td></tr>
<tr><td>neuter</td><td>-а / -я</td><td>окно́ → о́кна, мо́ре → моря́</td></tr></table>
<p><b>Spelling rule</b>: never write ы after г, к, х, ж, ш, ч, щ → write и (кни́ги, нога́ → но́ги).</p>
<p>Frequent irregulars: челове́к → лю́ди, ребёнок → де́ти, друг → друзья́, глаз → глаза́, дом → дома́, брат → бра́тья.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> comme en français, le genre est grammatical, pas logique — mais il est <i>visible</i> : la terminaison le donne presque toujours, donc pas besoin d'apprendre « le/la » par cœur. Attention aux pièges : <b>стол</b> (la table) est masculin, <b>маши́на</b> (la voiture) est féminin comme en français, mais <b>мо́ре</b> (la mer) est neutre et <b>со́лнце</b> (le soleil) aussi. Le neutre n'existe pas en français : pensez-le comme « ni il ni elle » → on le remplace par <b>оно́</b>.</div>`,
  quiz: [
    { q: 'Gender of <b>окно́</b>?', opts: ['masculine', 'feminine', 'neuter'], a: 2, why: '-о → neuter.' },
    { q: 'Gender of <b>па́па</b>?', opts: ['masculine', 'feminine', 'neuter'], a: 0, why: 'Male person → masculine despite -а.' },
    { q: 'Plural of <b>кни́га</b>?', opts: ['кни́гы', 'кни́ги', 'кни́га', 'книги́ы'], a: 1, why: 'After к write и, not ы.' },
    { q: 'Plural of <b>челове́к</b>?', opts: ['челове́ки', 'лю́ди', 'челове́ка', 'люде́й'], a: 1, why: 'Irregular: лю́ди (gens).' },
    { q: 'Gender of <b>ра́дость</b> (joy)?', opts: ['masculine', 'feminine', 'neuter'], a: 1, why: '-ость is always feminine (like French -ité: la joie, la liberté).' },
    { q: 'Gender of <b>вре́мя</b>?', opts: ['masculine', 'feminine', 'neuter'], a: 2, why: '-мя nouns are neuter (и́мя, вре́мя).' },
  ],
},
{
  title: 'Pronouns, "to be", "to have"', sub: 'Я, ты, он… · Être et avoir à la russe',
  body: `
<table><tr><td>я</td><td>I · je</td><td>мы</td><td>we · nous</td></tr><tr><td>ты</td><td>you (informal) · tu</td><td>вы</td><td>you (formal/pl.) · vous</td></tr>
<tr><td>он / она́ / оно́</td><td>he / she / it</td><td>они́</td><td>they · ils/elles</td></tr></table>
<h3>No "to be" in the present</h3>
<p><b>Я студе́нт.</b> = I [am] a student. <b>Он до́ма.</b> = He [is] at home. In writing, a dash replaces "is" between two nouns: <b>Москва́ — столи́ца.</b> Past and future do use быть: был / была́ / бы́ло / бы́ли; бу́ду, бу́дешь…</p>
<h3>"To have" = "at me there is"</h3>
<p><b>У меня́ есть брат.</b> = I have a brother (lit. "at me is a brother"). The owner is in the genitive after <b>у</b>: у меня́, у тебя́, у него́, у неё, у нас, у вас, у них.</p>
<p>Negative: <b>У меня́ нет бра́та.</b> — нет + genitive.</p>
<p>Possessives agree with the thing owned: мой/моя́/моё/мои́, твой, наш, ваш; его́, её, их never change.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> « у меня́ » se calque presque sur <b>« chez moi »</b> : <i>chez moi, il y a un frère</i>. Le russe préfère dire que les choses <i>se trouvent auprès</i> de quelqu'un plutôt qu'il les « possède » — d'où l'impression plus passive. Le tu/vous fonctionne exactement comme en français (bien plus qu'en anglais) : on vouvoie les inconnus, les aînés, le patron. Et <b>свой</b> lève l'ambiguïté du français « sa » : <i>Il aime sa femme</i> — la sienne (<b>свою́</b>) ou celle d'un autre (<b>его́</b>) ?</div>`,
  quiz: [
    { q: '"I am a doctor" in Russian?', opts: ['Я есть врач.', 'Я врач.', 'Я быть врач.', 'Меня врач.'], a: 1, why: 'No verb "to be" in the present.' },
    { q: '"I have a car"?', opts: ['Я име́ю маши́на.', 'У меня́ есть маши́на.', 'Мне маши́на.', 'Я есть маши́на.'], a: 1, why: 'у + genitive + есть.' },
    { q: '"She doesn\'t have a brother"?', opts: ['У неё нет бра́та.', 'У неё не брат.', 'Она́ нет брат.', 'У её нет брат.'], a: 0, why: 'нет + genitive (бра́та).' },
    { q: 'Talking to your new boss you use…', opts: ['ты', 'вы', 'он', 'оно́'], a: 1, why: 'Just like « vous ».' },
    { q: '"He loves his (own) wife"?', opts: ['Он лю́бит его́ жену́.', 'Он лю́бит свою́ жену́.', 'Он лю́бит её жену́.', 'Он лю́бит мою́ жену́.'], a: 1, why: 'свою́ = his own. его́ = another man\'s!' },
  ],
},
{
  title: 'Cases: the idea + Accusative', sub: 'Why endings change · La logique des cas, le COD',
  body: `
<p>Russian shows a word's <b>role</b> with its ending, not its position. There are 6 cases:</p>
<table><tr><th>Case</th><th>Role</th><th>Question</th></tr>
<tr><td>Nominative</td><td>subject</td><td>кто? что?</td></tr><tr><td>Accusative</td><td>direct object, direction</td><td>кого́? что? куда́?</td></tr>
<tr><td>Genitive</td><td>of, absence, quantity</td><td>кого́? чего́?</td></tr><tr><td>Dative</td><td>to/for someone</td><td>кому́? чему́?</td></tr>
<tr><td>Instrumental</td><td>with, by means of</td><td>кем? чем?</td></tr><tr><td>Prepositional</td><td>about, location</td><td>о ком? о чём? где?</td></tr></table>
<h3>Accusative (direct object)</h3>
<table><tr><td>Feminine -а/-я</td><td>→ -у/-ю</td><td>Я ви́жу ма́му. Я люблю́ Росси́ю.</td></tr>
<tr><td>Feminine -ь</td><td>no change</td><td>Я люблю́ жизнь.</td></tr>
<tr><td>Masc. inanimate, neuter</td><td>no change</td><td>Я ви́жу дом / окно́.</td></tr>
<tr><td>Masc. animate</td><td>= genitive -а/-я</td><td>Я ви́жу бра́та.</td></tr></table>
<p>Also <b>direction</b> with в / на: <b>Я иду́ в шко́лу</b> (to school) vs <b>Я в шко́ле</b> (at school, prepositional).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> vous connaissez déjà les cas sans le savoir : <i>il / le / lui</i>, <i>qui / que / dont</i>. Le français marque le rôle avec l'ordre des mots et les prépositions (« à », « de ») ; le russe le marque dans la terminaison. Conséquence : <b>Ма́му лю́бит па́па</b> = c'est <i>papa</i> qui aime maman (ма́му est COD grâce au -у), malgré l'ordre. L'ordre sert alors à mettre en relief, un peu comme « Maman, papa l'aime ».</div>`,
  quiz: [
    { q: 'Which case is the direct object?', opts: ['Nominative', 'Accusative', 'Dative', 'Genitive'], a: 1, why: 'Accusative = COD.' },
    { q: 'Я чита́ю ___ (кни́га).', opts: ['кни́га', 'кни́гу', 'кни́ге', 'кни́ги'], a: 1, why: 'Feminine -а → -у.' },
    { q: 'Я ви́жу ___ (стол).', opts: ['стола́', 'стол', 'столу́', 'столо́м'], a: 1, why: 'Masculine inanimate: no change.' },
    { q: 'Я ви́жу ___ (брат).', opts: ['брат', 'бра́та', 'бра́ту', 'бра́том'], a: 1, why: 'Masculine animate: accusative = genitive.' },
    { q: '"I am going to school"?', opts: ['Я иду́ в шко́ле.', 'Я иду́ в шко́лу.', 'Я иду́ шко́ла.', 'Я иду́ к шко́ле.'], a: 1, why: 'Direction (куда́?) → в + accusative.' },
    { q: '<b>Ма́му лю́бит па́па.</b> Who loves whom?', opts: ['Mom loves dad', 'Dad loves mom'], a: 1, why: 'Ма́му (-у) is the object; па́па is the subject.' },
  ],
},
{
  title: 'Genitive', sub: '"Of", absence, quantity · Le cas du « de »',
  body: `
<table><tr><th></th><th>Singular</th><th>Plural (main patterns)</th></tr>
<tr><td>m. (дом)</td><td>-а / -я: до́ма, музе́я</td><td>-ов / -ев / -ей: домо́в, музе́ев, рубле́й</td></tr>
<tr><td>f. (ма́ма)</td><td>-ы / -и: ма́мы, неде́ли</td><td>zero ending: мам, книг, недель</td></tr>
<tr><td>n. (окно́)</td><td>-а / -я: окна́, мо́ря</td><td>zero ending: о́кон, мест</td></tr></table>
<h3>Uses</h3>
<p>1. <b>Possession / "of"</b>: маши́на бра́та (brother's car), центр го́рода.</p>
<p>2. <b>Absence</b> with нет, не было: Нет вре́мени. Не́ было воды́.</p>
<p>3. <b>Quantity</b>: мно́го, ма́ло, ско́лько, не́сколько + gen. plural: мно́го книг. Part of something: Дай хле́ба (some bread).</p>
<p>4. <b>Numbers</b>: 1 → nominative (оди́н дом), 2-3-4 → gen. singular (два до́ма), 5-20 → gen. plural (пять домо́в). Then by last digit: 21 дом, 22 до́ма, 25 домо́в.</p>
<p>5. <b>Prepositions</b>: у, из, от, до, без, для, о́коло, по́сле, кро́ме, с (from).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> le génitif est le cas du <b>« de »</b> sous toutes ses formes : <i>la voiture <b>de</b> mon frère</i>, <i>beaucoup <b>de</b> livres</i>, <i>pas <b>de</b> temps</i>, <i>un peu <b>de</b> pain</i> (partitif !). Le français dit « je ne bois pas <b>de</b> vin » et non « pas le vin » — le russe fait exactement pareil : <b>Я не пью вина́</b>. Le partitif français « du pain » ≈ <b>хле́ба</b> au génitif.</div>`,
  quiz: [
    { q: '"No time" = Нет ___', opts: ['вре́мя', 'вре́мени', 'вре́менем', 'вре́мени́'], a: 1, why: 'нет + genitive; вре́мя → вре́мени.' },
    { q: '"two brothers" = два ___', opts: ['бра́т', 'бра́та', 'бра́тьев', 'бра́тья'], a: 1, why: '2-4 → genitive singular.' },
    { q: '"five brothers" = пять ___', opts: ['бра́та', 'бра́тья', 'бра́тьев', 'брат'], a: 2, why: '5+ → genitive plural.' },
    { q: '"many books" = мно́го ___', opts: ['кни́ги', 'книг', 'кни́гу', 'кни́гах'], a: 1, why: 'Feminine gen. plural: zero ending.' },
    { q: '"the centre of the city"?', opts: ['центр го́род', 'центр го́рода', 'центр го́роду', 'го́рода центр'], a: 1, why: 'Genitive follows the noun it modifies.' },
    { q: '"21 houses"?', opts: ['два́дцать оди́н дом', 'два́дцать оди́н до́ма', 'два́дцать оди́н домо́в'], a: 0, why: 'Last digit 1 → nominative singular.' },
  ],
},
{
  title: 'Prepositional', sub: 'Where? About what? · Où ? De quoi ?',
  body: `
<p>Only used <b>after a preposition</b>: в, на (location), о/об (about), при.</p>
<table><tr><td>Most nouns</td><td>-е</td><td>в до́ме, в Москве́, на мо́ре</td></tr>
<tr><td>-ия, -ие, and fem. -ь</td><td>-и</td><td>в Росси́и, в зда́нии, в жи́зни</td></tr>
<tr><td>Plural</td><td>-ах / -ях</td><td>в дома́х, о детя́х</td></tr></table>
<p>Some masculine nouns take stressed <b>-у́</b> after в/на: в лесу́, в саду́, на полу́, в году́, на берегу́, в шкафу́.</p>
<h3>в or на?</h3>
<p><b>в</b> = inside an enclosed space: в ко́мнате, в го́роде, в шко́ле. <b>на</b> = surface, open spaces, events, and a fixed list: на столе́, на у́лице, на рабо́те, на конце́рте, на вокза́ле, на по́чте, на ро́дине, на Кавка́зе.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> le choix в/на ressemble à notre « <i>à</i> la poste / <i>au</i> travail » vs « <i>dans</i> la chambre » : <b>на</b> ≈ « à » (lieu-fonction, événement), <b>в</b> ≈ « dans/en » (contenant). Ça marche souvent : <i>au travail</i> = на рабо́те, <i>au concert</i> = на конце́рте, <i>dans la ville</i> = в го́роде. Et <b>о</b> = « de » au sens de « parler <i>de</i> » : <i>говори́ть о любви́</i> = parler d'amour (≠ génitif !).</div>`,
  quiz: [
    { q: '"in Moscow" = в ___', opts: ['Москва́', 'Москве́', 'Москву́', 'Москвы́'], a: 1, why: 'Prepositional -е.' },
    { q: '"in Russia" = в ___', opts: ['Росси́е', 'Росси́и', 'Росси́ю', 'Росси́я'], a: 1, why: '-ия → -ии.' },
    { q: '"in the forest" = в ___', opts: ['ле́се', 'лесу́', 'ле́са', 'лес'], a: 1, why: 'Special -у́ locative.' },
    { q: '"at work" = ___ рабо́те', opts: ['в', 'на', 'у', 'к'], a: 1, why: 'на рабо́те (like « au travail »).' },
    { q: '"We talk about life" = Мы говори́м о ___', opts: ['жизнь', 'жи́зни', 'жи́зне', 'жи́знью'], a: 1, why: 'Fem. -ь → -и.' },
  ],
},
{
  title: 'Dative', sub: 'To whom? Feelings, age, need · À qui ?',
  body: `
<table><tr><td>m. / n.</td><td>-у / -ю</td><td>бра́ту, дру́гу, мо́рю</td></tr>
<tr><td>f. -а/-я</td><td>-е (-ии)</td><td>ма́ме, Мари́и</td></tr><tr><td>f. -ь</td><td>-и</td><td>до́чери</td></tr>
<tr><td>Plural</td><td>-ам / -ям</td><td>друзья́м, де́тям</td></tr></table>
<p>Pronouns: мне, тебе́, ему́, ей, нам, вам, им.</p>
<h3>Uses</h3>
<p>1. <b>Indirect object</b>: Я дал кни́гу бра́ту. Позвони́ ма́ме!</p>
<p>2. <b>Impersonal states — the person is in the dative</b>: Мне хо́лодно (I'm cold), Мне ску́чно, Мне два́дцать лет (I'm 20), Мне на́до / ну́жно (I need), Мне нельзя́.</p>
<p>3. <b>нра́виться</b> (to like): <b>Мне нра́вится му́зыка</b> — the thing liked is the subject!</p>
<p>4. Prepositions <b>к</b> (towards someone) and <b>по</b> (along, by, on): к врачу́, по у́лице, по телефо́ну.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> le datif, c'est le <b>« à »</b> du COI : <i>donner <b>à</b> mon frère</i>, <i>téléphoner <b>à</b> maman</i>. Et <b>нра́виться</b> se comprend parfaitement avec <b>« plaire à »</b> : <i>Мне нра́вится Москва́</i> = <i>Moscou <b>me</b> plaît</i> — Moscou est le sujet, « me » est au datif. C'est exactement la construction française, alors que l'anglais « I like » brouille les pistes. De même <i>мне хо́лодно</i> ressemble à un vieux tour « il me fait froid » : on <i>subit</i> l'état plutôt qu'on ne l'est.</div>`,
  quiz: [
    { q: '"I like music" = ___ нра́вится му́зыка.', opts: ['Я', 'Мне', 'Меня́', 'Мной'], a: 1, why: 'Dative: « la musique me plaît ».' },
    { q: '"I\'m cold" = ___', opts: ['Я хо́лодно.', 'Мне хо́лодно.', 'Я холо́дный.', 'У меня́ хо́лодно.'], a: 1, why: 'Dative + adverb. (Я холо́дный = I\'m a cold person!)' },
    { q: '"Call mom!" = Позвони́ ___!', opts: ['ма́ма', 'ма́му', 'ма́ме', 'ма́мы'], a: 2, why: 'звони́ть + dative (téléphoner à).' },
    { q: '"He is 30" = ___ три́дцать лет.', opts: ['Он', 'Ему́', 'Его́', 'У него́'], a: 1, why: 'Age uses the dative.' },
    { q: '"I\'m going to the doctor\'s" = Я иду́ ___ врачу́.', opts: ['в', 'на', 'к', 'у'], a: 2, why: 'к + dative toward a person (chez le médecin).' },
  ],
},
{
  title: 'Instrumental', sub: 'With, by, as · Avec, par, en tant que',
  body: `
<table><tr><td>m. / n.</td><td>-ом / -ем</td><td>бра́том, карандашо́м, мо́рем</td></tr>
<tr><td>f. -а/-я</td><td>-ой / -ей</td><td>ма́мой, неде́лей</td></tr><tr><td>f. -ь</td><td>-ью</td><td>но́чью</td></tr>
<tr><td>Plural</td><td>-ами / -ями</td><td>друзья́ми</td></tr></table>
<p>Pronouns: мной, тобо́й, им, ей, на́ми, ва́ми, и́ми.</p>
<h3>Uses</h3>
<p>1. <b>Tool / means</b>: писа́ть ру́чкой (with a pen), е́хать по́ездом.</p>
<p>2. <b>с = with (together)</b>: ко́фе с молоко́м, Я с дру́гом. <b>Мы с тобо́й</b> = you and I.</p>
<p>3. <b>Roles & becoming</b>: Он рабо́тает врачо́м. Он стал врачо́м. Я был студе́нтом.</p>
<p>4. <b>Position</b> with над, под, пе́ред, за, ме́жду: над столо́м, под крова́тью.</p>
<p>5. Time of day and seasons as adverbs: у́тром, ве́чером, но́чью, зимо́й, ле́том.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> l'instrumental couvre trois « petits mots » français : <b>avec</b> (instrument : <i>écrire avec un stylo</i> = ру́чкой, <b>sans préposition !</b>), <b>avec</b> accompagnement (<i>avec un ami</i> = с дру́гом, <b>avec</b> с), et <b>en tant que / comme</b> (<i>travailler comme médecin</i> = рабо́тать врачо́м). Distinguez bien : « avec » outil → pas de с ; « avec » compagnie → с. Et <i>le matin, l'hiver</i> → у́тром, зимо́й : un seul mot, pas d'article.</div>`,
  quiz: [
    { q: '"I write with a pen" = Я пишу́ ___', opts: ['с ру́чкой', 'ру́чкой', 'ру́чку', 'ру́чке'], a: 1, why: 'Tool → instrumental without с.' },
    { q: '"coffee with milk" = ко́фе ___', opts: ['молоко́м', 'с молоко́м', 'молока́', 'с молоко́'], a: 1, why: 'Accompaniment → с + instrumental.' },
    { q: '"He became a doctor" = Он стал ___', opts: ['врач', 'врача́', 'врачо́м', 'врачу́'], a: 2, why: 'стать + instrumental.' },
    { q: '"in winter" = ___', opts: ['в зиме́', 'зимо́й', 'на зи́му', 'зима́'], a: 1, why: 'Season as instrumental adverb.' },
    { q: '"you and I" (lit. we with you) = мы с ___', opts: ['ты', 'тебя́', 'тобо́й', 'тебе́'], a: 2, why: 'с + instrumental: тобо́й.' },
  ],
},
{
  title: 'Verbs: present & past', sub: 'Two conjugations, gendered past · Conjugaison',
  body: `
<h3>Present: 1st conjugation (-е-) — чита́ть</h3>
<table><tr><td>я чита́ю</td><td>мы чита́ем</td></tr><tr><td>ты чита́ешь</td><td>вы чита́ете</td></tr><tr><td>он чита́ет</td><td>они́ чита́ют</td></tr></table>
<h3>2nd conjugation (-и-) — говори́ть</h3>
<table><tr><td>я говорю́</td><td>мы говори́м</td></tr><tr><td>ты говори́шь</td><td>вы говори́те</td></tr><tr><td>он говори́т</td><td>они́ говоря́т</td></tr></table>
<p>Most verbs in <b>-ить</b> are 2nd conjugation; most others are 1st. Watch consonant changes in the я form: люби́ть → люблю́, ви́деть → ви́жу, проси́ть → прошу́.</p>
<h3>Past: by gender, not by person!</h3>
<p>Drop -ть, add <b>-л / -ла / -ло / -ли</b>: он чита́л, она́ чита́ла, оно́ чита́ло, они́ чита́ли. A woman says <b>я чита́ла</b>, a man <b>я чита́л</b>.</p>
<h3>Future</h3>
<p>Imperfective: <b>бу́ду + infinitive</b> (я бу́ду чита́ть). Perfective: conjugate it like a present (я прочита́ю = I will read [it through]). See next lesson.</p>
<h3>Reflexive -ся</h3>
<p>-ся after a consonant, -сь after a vowel: я учу́сь, он у́чится.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> le passé russe s'accorde en genre comme notre participe avec « être » : <i>elle est venu<b>e</b></i> → <i>она́ пришл<b>а́</b></i>. Mais il ne s'accorde pas en personne : <i>я / ты / она́ чита́ла</i>. Les verbes en <b>-ся</b> sont les cousins de nos pronominaux : <i>se laver</i> = мы́ться, <i>s'appeler</i> = называ́ться, <i>se trouver</i> = находи́ться — le « se » est collé à la fin. Il n'y a qu'<b>un</b> passé (pas de passé simple / composé / imparfait) : la nuance passe par l'<b>aspect</b> (leçon suivante).</div>`,
  quiz: [
    { q: 'они́ ___ (чита́ть)', opts: ['чита́ет', 'чита́ют', 'чита́ят', 'чита́ем'], a: 1, why: '1st conj. они́ → -ют.' },
    { q: 'ты ___ (говори́ть)', opts: ['говори́шь', 'говоре́шь', 'говорю́', 'говори́т'], a: 0, why: '2nd conj. ты → -ишь.' },
    { q: 'A woman says "I was reading": Я ___', opts: ['чита́л', 'чита́ла', 'чита́ло', 'чита́ли'], a: 1, why: 'Past agrees with gender: -ла.' },
    { q: 'я ___ (люби́ть)', opts: ['любю́', 'люблю́', 'люби́ю', 'лю́бит'], a: 1, why: 'Consonant change б → бл.' },
    { q: '"I will read (repeatedly / in progress)"?', opts: ['Я бу́ду чита́ть.', 'Я чита́л.', 'Я бу́ду чита́л.', 'Я чита́ть.'], a: 0, why: 'бу́ду + imperfective infinitive.' },
  ],
},
{
  title: 'Aspect: imperfective vs perfective', sub: 'The key to Russian verbs · Imparfait vs passé composé',
  body: `
<p>Almost every verb comes in a <b>pair</b>: imperfective (process, repetition) and perfective (one complete result).</p>
<table><tr><th>Imperfective</th><th>Perfective</th><th></th></tr>
<tr><td>де́лать</td><td>сде́лать</td><td>to do</td></tr><tr><td>чита́ть</td><td>прочита́ть</td><td>to read</td></tr>
<tr><td>писа́ть</td><td>написа́ть</td><td>to write</td></tr><tr><td>говори́ть</td><td>сказа́ть</td><td>to say</td></tr>
<tr><td>брать</td><td>взять</td><td>to take</td></tr><tr><td>покупа́ть</td><td>купи́ть</td><td>to buy</td></tr>
<tr><td>отвеча́ть</td><td>отве́тить</td><td>to answer</td></tr><tr><td>начина́ть</td><td>нача́ть</td><td>to begin</td></tr></table>
<h3>Choose imperfective when…</h3>
<p>• the action is ongoing / in progress: <b>Я чита́л, когда́ он пришёл.</b> • repeated / habitual: <b>Ка́ждый день я чита́ю.</b> • you just name the activity: <b>Ты чита́л э́ту кни́гу?</b> (have you ever read it?) • after нача́ть, ко́нчить, перестать, нельзя́ (forbidden).</p>
<h3>Choose perfective when…</h3>
<p>• one action with a result: <b>Я прочита́л кни́гу</b> (finished it). • a sequence: <b>Он пришёл, сел и сказа́л…</b> • a future single result: <b>За́втра я напишу́ письмо́.</b></p>
<p>⚠️ Perfective verbs have <b>no present tense</b>: their "present" form means future.</p>
<div class="fr-box">🇫🇷 <b>En français :</b> c'est votre grand avantage sur les anglophones ! L'aspect russe ressemble beaucoup à <b>imparfait vs passé composé</b> : <i>je lisais</i> (process, habitude, décor) = <b>чита́л</b> ; <i>j'ai lu</i> (fait accompli, résultat) = <b>прочита́л</b>. « Il lisait quand elle est entrée » = <i>Он чита́л, когда́ она́ вошла́</i> — même logique exactement. Au futur, <i>je lirai</i> se dédouble : <i>я бу́ду чита́ть</i> (je serai en train de lire, je lirai régulièrement) vs <i>я прочита́ю</i> (je l'aurai lu, je vais le lire en entier).</div>`,
  quiz: [
    { q: '"Every day I ___ newspapers"', opts: ['прочита́ю', 'чита́ю', 'прочита́л'], a: 1, why: 'Habit → imperfective.' },
    { q: '"Yesterday I wrote (and finished) the letter" = Вчера́ я ___ письмо́.', opts: ['писа́л', 'написа́л', 'пишу́'], a: 1, why: 'Completed result → perfective (passé composé).' },
    { q: 'What does <b>я куплю́</b> mean?', opts: ['I buy', 'I will buy', 'I bought', 'I was buying'], a: 1, why: 'Perfective "present" form = future.' },
    { q: '"He was reading when she came in": Он ___, когда́ она́ вошла́.', opts: ['чита́л', 'прочита́л'], a: 0, why: 'Background process = imparfait = imperfective.' },
    { q: 'Perfective partner of <b>говори́ть</b> (to say)?', opts: ['поговори́ть', 'сказа́ть', 'рассказа́ть', 'спроси́ть'], a: 1, why: 'говори́ть / сказа́ть is a suppletive pair.' },
    { q: 'After <b>нача́ть</b> (to begin) use…', opts: ['imperfective', 'perfective'], a: 0, why: 'Beginning a process → imperfective infinitive.' },
  ],
},
{
  title: 'Verbs of motion', sub: 'Going on foot or by vehicle · Aller à pied ou en véhicule',
  body: `
<p>Russian has no single "to go". You choose <b>how</b> (on foot or by vehicle) and <b>direction type</b> (one way now vs round trips/habit).</p>
<table><tr><th></th><th>One direction, now</th><th>Multi-directional / habitual</th></tr>
<tr><td>on foot</td><td><b>идти́</b>: иду́, идёшь; шёл/шла</td><td><b>ходи́ть</b>: хожу́, хо́дишь</td></tr>
<tr><td>by vehicle</td><td><b>е́хать</b>: е́ду, е́дешь</td><td><b>е́здить</b>: е́зжу, е́здишь</td></tr>
<tr><td>run</td><td>бежа́ть</td><td>бе́гать</td></tr><tr><td>fly</td><td>лете́ть</td><td>лета́ть</td></tr>
<tr><td>carry (on foot)</td><td>нести́</td><td>носи́ть</td></tr><tr><td>lead</td><td>вести́</td><td>води́ть</td></tr></table>
<p><b>Я иду́ в шко́лу</b> = I'm on my way to school (right now). <b>Я хожу́ в шко́лу</b> = I go to school (regularly). <b>Вчера́ я ходи́л в кино́</b> = I went to the cinema yesterday (and came back — a round trip).</p>
<p>Perfective "set off": <b>пойти́ / пое́хать</b>: Я пойду́ домо́й = I'll head home.</p>
<p>Where to / where at: <b>куда́?</b> + accusative (в шко́лу), <b>где?</b> + prepositional (в шко́ле), <b>отку́да?</b> + genitive (из шко́лы).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> « aller » cache deux choses que le russe sépare. Pensez <b>идти́</b> = <i>être en route</i> (« je suis en train d'aller »), <b>ходи́ть</b> = <i>fréquenter, faire des allers-retours</i> (« je vais au lycée » au sens habituel). Et le moyen compte : en français on « va » à Lyon en train ou à pied, en russe on doit choisir <b>е́хать</b> dès qu'il y a un véhicule. Astuce : <i>je suis allé au cinéma hier</i> = <b>я ходи́л</b> (aller-retour), pas « я шёл » (= j'étais en chemin).</div>`,
  quiz: [
    { q: '"I\'m walking home right now" = Я ___ домо́й.', opts: ['хожу́', 'иду́', 'е́ду', 'е́зжу'], a: 1, why: 'On foot, one direction, now → идти́.' },
    { q: '"I go to Moscow by train every month" = Я ___ в Москву́.', opts: ['иду́', 'е́ду', 'е́зжу', 'хожу́'], a: 2, why: 'Vehicle + habitual → е́здить.' },
    { q: '"Yesterday I went to the cinema (and back)" = Вчера́ я ___ в кино́.', opts: ['шёл', 'ходи́л', 'иду́', 'пойду́'], a: 1, why: 'Round trip in the past → ходи́ть.' },
    { q: '"Where are you going?" = ___ ты идёшь?', opts: ['Где', 'Куда́', 'Отку́да'], a: 1, why: 'Direction → куда́.' },
    { q: 'Birds fly south (now, one direction) — птицы ___ на юг.', opts: ['летя́т', 'лета́ют'], a: 0, why: 'One direction now → лете́ть.' },
  ],
},
{
  title: 'Prefixes', sub: 'При-, у-, вы-, за-… · La logique des préfixes',
  body: `
<p>Prefixes add a direction or a nuance — and usually make the verb <b>perfective</b>. Learn the prefix meaning once and you can decode hundreds of verbs. With motion verbs (идти́ → -йти, е́хать → -езжа́ть/-е́хать):</p>
<table><tr><th>Prefix</th><th>Meaning</th><th>Example</th></tr>
<tr><td>в- (во-)</td><td>in</td><td>войти́ — enter · entrer</td></tr><tr><td>вы-</td><td>out</td><td>вы́йти — go out · sortir</td></tr>
<tr><td>при-</td><td>arrive</td><td>прийти́ — arrive · arriver</td></tr><tr><td>у-</td><td>away, leave</td><td>уйти́ — leave · s'en aller</td></tr>
<tr><td>под- (подо-)</td><td>approach</td><td>подойти́ — come up to · s'approcher</td></tr><tr><td>от- (ото-)</td><td>move away a bit</td><td>отойти́ — step away · s'écarter</td></tr>
<tr><td>пере-</td><td>across; re-</td><td>перейти́ — cross · traverser; переписа́ть — rewrite</td></tr><tr><td>про-</td><td>through, past; for a while</td><td>пройти́ — pass · passer</td></tr>
<tr><td>за-</td><td>drop in; start</td><td>зайти́ — drop by · passer chez; запе́ть — start singing</td></tr><tr><td>до-</td><td>reach</td><td>дойти́ — reach · atteindre</td></tr>
<tr><td>об- (обо-)</td><td>around</td><td>обойти́ — go around · contourner</td></tr><tr><td>с- (со-)</td><td>down; together</td><td>сойти́ — get off · descendre</td></tr>
<tr><td>раз- (рас-)</td><td>apart, dis-</td><td>разойти́сь — disperse · se disperser</td></tr><tr><td>по-</td><td>start; a little</td><td>пойти́ — set off; поговори́ть — chat a bit</td></tr></table>
<p>Beyond motion: <b>писа́ть</b> (write) → написа́ть (finish writing), записа́ть (note down), переписа́ть (rewrite), подписа́ть (sign), вы́писать (write out / prescribe), описа́ть (describe).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> beaucoup de préfixes russes ont un jumeau latin que vous utilisez déjà : <b>пере-</b> ≈ <i>trans-/re-</i> (traverser, réécrire), <b>вы-</b> ≈ <i>ex-</i> (<i>ex</i>traire, sortir), <b>в-</b> ≈ <i>in-/en-</i> (<i>en</i>trer), <b>при-</b> ≈ <i>ad-</i> (<i>ad</i>venir, arriver), <b>раз-</b> ≈ <i>dis-/dé-</i> (<i>dis</i>perser), <b>с-</b> ≈ <i>con-/com-</i> (<i>co</i>mposer : <i>со</i>ста́вить), <b>под-</b> ≈ <i>sub-/sous-</i> (<b>подписа́ть</b> = <i>sous</i>crire, signer <i>dessous</i>), <b>о(б)-</b> ≈ <i>circum-</i>, <b>про-</b> ≈ <i>pro-/par-</i> (<i>par</i>courir). Le français a perdu la transparence (« sortir » ne se voit plus comme « ex-aller »), le russe l'a gardée : <i>вы́-йти</i> = « ex-aller ».</div>`,
  quiz: [
    { q: '<b>вы́йти</b> means…', opts: ['to enter', 'to go out', 'to arrive', 'to cross'], a: 1, why: 'вы- = out (ex-).' },
    { q: '<b>прийти́</b> means…', opts: ['to leave', 'to arrive', 'to pass', 'to approach'], a: 1, why: 'при- = arrival (ad-).' },
    { q: '"to cross the street" = ___ у́лицу', opts: ['перейти́', 'пройти́', 'уйти́', 'войти́'], a: 0, why: 'пере- = across (trans-).' },
    { q: '<b>подписа́ть</b> (под- + писа́ть) most likely means…', opts: ['to rewrite', 'to sign', 'to describe', 'to copy'], a: 1, why: 'Write under → sign (sous-crire).' },
    { q: '<b>уйти́</b> means…', opts: ['to go away', 'to come in', 'to reach', 'to drop by'], a: 0, why: 'у- = away.' },
    { q: 'Adding a prefix to an imperfective verb usually makes it…', opts: ['perfective', 'reflexive', 'plural', 'imperative'], a: 0, why: 'писа́ть → написа́ть.' },
  ],
},
{
  title: 'Suffixes', sub: 'Building words · Construire des mots',
  body: `
<h3>People</h3>
<table><tr><td>-тель</td><td>doer (-er, -eur)</td><td>учи́тель (teacher), писа́тель (writer), води́тель (driver)</td></tr>
<tr><td>-ник / -ница</td><td>person linked to</td><td>рабо́тник, учени́к (pupil), помо́щник</td></tr>
<tr><td>-ец / -ка</td><td>m. / f. person</td><td>не́мец / не́мка, америка́нец / америка́нка</td></tr></table>
<h3>Abstract nouns</h3>
<table><tr><td>-ость</td><td>-ness / -ité</td><td>ра́дость (joie), сме́лость, возмо́жность (possibilité)</td></tr>
<tr><td>-ство</td><td>-hood, -ship / -té, -ité</td><td>де́тство (enfance), о́бщество (société), госуда́рство (État)</td></tr>
<tr><td>-ние / -ение</td><td>-tion / -ment (from verbs)</td><td>реше́ние (décision), движе́ние (mouvement), жела́ние</td></tr></table>
<h3>Adjectives</h3>
<table><tr><td>-ский</td><td>relating to (-ic, -ique)</td><td>ру́сский, моско́вский, де́тский</td></tr>
<tr><td>-н-</td><td>made of / relating to</td><td>желе́зный (en fer), ночно́й (nocturne)</td></tr>
<tr><td>-ов- / -ев-</td><td>made of</td><td>берёзовый (en bouleau)</td></tr></table>
<h3>Diminutives (affection!)</h3>
<p><b>-ик, -чик, -ок, -очка, -ечка, -ушка</b>: дом → до́мик, кот → коте́нок (kitten), ма́ма → ма́мочка, вода́ → води́чка, ба́ба → ба́бушка. Russians use them constantly for warmth, not only for size: <i>Ча́ечку?</i> (a nice little tea?).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> <b>-ость</b> = <b>-ité / -esse</b> (<i>tendr<b>esse</b></i> = не́жность, <i>possibil<b>ité</b></i> = возмо́жность) et, comme en français, ces mots sont féminins. <b>-ние</b> = <b>-tion / -ment</b> (<i>décision, mouvement</i>). <b>-тель</b> = <b>-eur</b> (<i>écriv-ain, enseign-ant</i>). Les diminutifs russes sont bien plus vivants que nos « -ette » (<i>maisonnette, fillette</i>) : ils ressemblent plutôt au « mon petit… » affectueux. <i>Ба́бушка</i> n'est plus « petite bonne femme » mais <i>grand-mère</i> — le diminutif a pris un sens propre, comme <i>noisette</i> s'est détaché de <i>noix</i>.</div>`,
  quiz: [
    { q: '<b>учи́тель</b> (from учи́ть, to teach) is…', opts: ['a teacher', 'a lesson', 'a school', 'learning'], a: 0, why: '-тель = doer.' },
    { q: 'Gender of nouns in <b>-ость</b>?', opts: ['masculine', 'feminine', 'neuter'], a: 1, why: 'Always feminine (like -ité).' },
    { q: '<b>реше́ние</b> (from реши́ть, to decide) means…', opts: ['decider', 'decision', 'decisive', 'decided'], a: 1, why: '-ние = -tion.' },
    { q: 'A small, cute house?', opts: ['до́мик', 'дома́', 'дома́шний', 'домово́й'], a: 0, why: 'Diminutive -ик.' },
    { q: '<b>де́тство</b> (from де́ти, children) means…', opts: ['childish', 'childhood', 'child', 'nursery'], a: 1, why: '-ство = -hood / abstract state.' },
  ],
},
{
  title: 'Negation, questions & word order', sub: 'Не, ни, ли… · Négation, questions, ordre des mots',
  body: `
<h3>Negation</h3>
<p><b>не</b> goes right before the word it negates: <b>Я не зна́ю.</b> / <b>Не я э́то сде́лал</b> (It wasn't me who did it).</p>
<p><b>Double negation is required</b>: ни-words + не: <b>Я ничего́ не зна́ю</b> (I know nothing), <b>Никто́ не пришёл</b>, <b>Я никогда́ не был в Москве́</b>, <b>Он нигде́ не рабо́тает</b>.</p>
<p>Absence: <b>нет</b> + genitive — Нет вре́мени.</p>
<h3>Questions</h3>
<p>Yes/no questions keep the word order — only the <b>intonation</b> rises on the key word: <i>Ты зна́ешь?</i> Question words: кто, что, где, куда́, когда́, почему́, заче́м (what for), как, ско́лько, чей.</p>
<p><b>ли</b> = "whether" (and formal questions): <b>Я не зна́ю, придёт ли он.</b></p>
<h3>Word order</h3>
<p>Cases free the order: new or important information goes <b>at the end</b>. <i>Ма́ша купи́ла маши́ну</i> (what did Masha buy? — a car) vs <i>Маши́ну купи́ла Ма́ша</i> (who bought the car? — Masha).</p>
<div class="fr-box">🇫🇷 <b>En français :</b> la double négation russe, vous l'avez déjà ! <i>Je <b>ne</b> sais <b>rien</b></i> = <i>Я <b>ни</b>чего́ <b>не</b> зна́ю</i> ; <i><b>Personne n'</b>est venu</i> = <i><b>Никто́ не</b> пришёл</i> ; <i>je <b>ne</b> suis <b>jamais</b> allé</i> = <i>я <b>никогда́ не</b> был</i>. Là où l'anglais interdit « I don't know nothing », le français et le russe exigent les deux. Pour l'ordre des mots : le russe met en fin de phrase ce que le français met en relief avec « c'est… qui » : <i>Маши́ну купи́ла Ма́ша</i> = <i><b>C'est Macha qui</b> a acheté la voiture</i>. Et <b>ли</b> = « si » interrogatif : <i>je ne sais pas <b>s'</b>il viendra</i>.</div>`,
  quiz: [
    { q: '"I know nothing" = Я ___ не зна́ю.', opts: ['что', 'ничего́', 'ничто́', 'нет'], a: 1, why: 'ни-word + не (ne… rien).' },
    { q: '"Nobody came" = ___', opts: ['Никто́ пришёл.', 'Никто́ не пришёл.', 'Не кто пришёл.', 'Кто не пришёл.'], a: 1, why: 'Double negation is mandatory.' },
    { q: '"I don\'t know whether he will come" = Я не зна́ю, придёт ___ он.', opts: ['е́сли', 'ли', 'что', 'бы'], a: 1, why: 'ли = « si » (whether). е́сли = « si » (condition).' },
    { q: '<b>Маши́ну купи́ла Ма́ша</b> stresses…', opts: ['what was bought', 'who bought it', 'when', 'nothing'], a: 1, why: 'New info at the end: « C\'est Macha qui… ».' },
    { q: '"I have never been to Moscow"?', opts: ['Я никогда́ был в Москве́.', 'Я никогда́ не был в Москве́.', 'Я не когда́ был в Москве́.'], a: 1, why: 'никогда́ + не.' },
  ],
},
];
