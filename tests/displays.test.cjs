const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadSource } = require('./load-source.cjs');
const { AppProvider } = loadSource('src/app/state.tsx');
const { defaultState } = loadSource('src/lib/storage.ts');
const { fillCounts, toKey } = loadSource('src/lib/prayers.ts');
const today = toKey(new Date());
const plan = (patch = {}) => ({ ...defaultState(), calculated: true, counts: fillCounts(100), ...patch });

function render(component, name, state, props = {}) {
  global.localStorage = { getItem: () => JSON.stringify(state) };
  try {
    const Component = loadSource(`src/app/${component}.tsx`)[name];
    return renderToStaticMarkup(React.createElement(AppProvider, null, React.createElement(Component, props)));
  } finally { delete global.localStorage; }
}

const text = (html) => html.replace(/<[^>]*>/g, '');

test('tracker and navigation consistently credit only matching daily targets', () => {
  const s = plan({ log: { [today]: { fajr: 9 } } });
  const tracker = render('components/TrackerCard', 'TrackerCard', s, { variant: 'live' });
  assert.match(text(tracker), /أنجزت من هدف اليوم: 3 من 9/);
  assert.match(text(tracker), /6 إضافية/);
  assert.match(text(tracker), /33٪/);
  assert.doesNotMatch(tracker, /أتممت هدف اليوم/);
  assert.match(text(render('sections/Nav', 'Nav', s)), /3 \/ 9 اليوم/);
  assert.match(text(render('components/TodayStrip', 'TodayStrip', s)), /3 من 9/);
  assert.match(render('components/MobileNav', 'MobileNav', s), /aria-label="3 من 9 اليوم"/);
});

test('incomplete forecast remains a live editable plan with no finish date', () => {
  const s = plan({ targets: { ...fillCounts(1), fajr: 0 } });
  const html = render('sections/PlanBuilder', 'PlanBuilder', s);
  assert.match(text(html), /أهدافك اليومية/);
  assert.match(text(html), /لم يُحدَّد هدف يومي/);
  assert.match(text(html), /حدّد هدفاً يومياً لكل صلاة متبقية لحساب المدة/);
  assert.match(text(html), /المدة غير محددة/);
  assert.doesNotMatch(text(html), /التاريخ المتوقع للانتهاء|أرقام توضيحية/);
  const strip = text(render('components/PlanStrip', 'PlanStrip', s));
  assert.match(strip, /المدة غير محددة/);
  assert.doesNotMatch(strip, /الانتهاء المتوقع/);
});

test('zero daily requirements do not show a completion celebration', () => {
  const s = plan({ targets: fillCounts(0) });
  const html = render('components/TrackerCard', 'TrackerCard', s, { variant: 'live' });
  assert.match(text(html), /لا توجد أهداف لليوم/);
  assert.doesNotMatch(html, /أتممت هدف اليوم/);
  assert.match(html, /إضافة صلاة الفجر خارج الهدف/);
});

test('completed rows retain correction controls and the final day shows 2/2', () => {
  const s = plan({ counts: { ...fillCounts(0), fajr: 2 }, targets: fillCounts(5), log: { [today]: { fajr: 2 } } });
  const html = render('components/TrackerCard', 'TrackerCard', s, { variant: 'live' });
  assert.match(text(html), /أنجزت من هدف اليوم: 2 من 2/);
  assert.match(text(html), /أتممت هدف اليوم/);
  assert.match(text(html), /مكتملة/);
  assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 2);
});

test('weekly activity is unchanged by edits to current targets', () => {
  const s = plan({ log: { [today]: { fajr: 2 } } });
  assert.equal(render('components/WeekGlance', 'WeekGlance', s),
    render('components/WeekGlance', 'WeekGlance', { ...s, targets: fillCounts(50) }));
});

test('print and preview show only outstanding scheduled work', () => {
  const s = plan({ counts: { ...fillCounts(0), fajr: 2 }, targets: fillCounts(5), log: { [today]: { fajr: 1 } } });
  for (const printPeriod of ['week', 'month', 'quarter']) {
    const html = render('components/PrintSheet', 'PrintSheet', { ...s, printPeriod });
    assert.equal((html.match(/class="box"/g) ?? []).length, 1);
    assert.match(text(html), /الأعمال المتبقية من وقت الطباعة/);
  }
  const preview = render('sections/PrintablePlanner', 'PrintablePlanner', s);
  assert.equal((preview.match(/w-3\.5 h-3\.5 border/g) ?? []).length, 1);
});
