# Mobile UX/UI review — خطة القضاء (390 px, Arabic RTL)

Reviewed: production build of `src/` rendered at 390 px (headless Chrome, iframe), plus source reading for the post-calculation ("live") state and the interactive components. Screenshots referenced below live in the session scratchpad (`review-full.png`, `p0.png`–`p3.png`, `slice-*.png`); "y≈" values are pixel offsets from the top of the 390 px page.

## Summary

1. The visual system is right: cream ground, muted green, charcoal text, sand for overall progress, Cairo headings. It already reads as calm and un-gamified — the brief's tone is met.
2. The problem is structure, not styling. The page is ~9,300 px tall on a phone (≈13 screens between the 64 px sticky nav and the 64 px bottom bar), and a returning user has to scroll past a marketing headline, two CTAs and a paragraph before reaching the tracker, which then exists *twice* (hero card and `#track` section) with two different navigation targets pointing at each.
3. Daily-use flow: from cold open to "log الفجر" is 1 scroll + 1 tap in the best case, but the bottom-bar "اليوم" tab sends the user 3,900 px down to the *second* tracker while the hero tracker sits right above. First-time and returning users get the same page; nothing adapts except the CTA label.
4. Touch: the core control (the 32 px check box) and both stepper sizes (36/40 px) are under the 44 px comfort target; the "إضافة صلاة قضاء" affordance is a 12 px text link; several inputs/selects use 14 px text, which makes iOS Safari zoom on focus.
5. RTL and Arabic type are mostly correct (ArrowLeft as forward, `-start-*`, Latin digits by design) with a handful of physical-direction utilities (`ml-`, `pl-`, `pr-`, `text-right`) and 12 px Arabic helper text that is too small on phones.

## Top 10 recommendations (ranked by impact)

### 1. Give returning users an "app mode" first screen; keep the landing for first-timers

- **Problem.** `state.calculated` only changes a CTA label. A returning user opening the site every day sees the hero h1 «رتّب قضاء صلواتك، خطوة بخطوة», the paragraph, two buttons and the privacy pill (≈430 px) before the tracker card, which starts at y≈450 and ends at y≈850 — just off the fold on an 844 px phone once the 64 px nav is counted.
- **Evidence.** `p0.png` (hero, y 0–920); `src/app/sections/Hero.tsx` lines 20–60 render the marketing column unconditionally.
- **Proposal.** In `Hero.tsx`, branch on `live`:
  - Live (phone): drop the pill, h1, paragraph and CTAs. Render a compact header row (`flex items-baseline justify-between`): `<h1 class="text-2xl font-bold">قضاء اليوم</h1>` + date `text-sm text-muted-foreground`, then the tracker card directly under the nav (`pt-4`). Below it a single-line plan strip (see #3). The tracker's first check box is then ~180 px from the top: thumb-reachable without scrolling.
  - Not live: keep the current hero but tighten (see #7).
  - Desktop (`lg:`) can keep the two-column hero in both states.
- **Effort.** M.
- **Files.** `src/app/sections/Hero.tsx`, `src/app/App.tsx` (see #2 for what else app mode hides).

### 2. One tracker, not two — retire the `#track` duplicate on phones

- **Problem.** The hero card and `DailyTracking` render the same five rows, the same «أنجزت اليوم X من Y», the same overall-progress bar. The bottom bar's «اليوم» tab and the hero CTA «سجّل صلوات اليوم» both target `#track` (y≈3,900), while «الرئيسية» targets `#top` where the *other* tracker lives. Two places to log the same prayer is a trust problem, not just redundancy, and it costs ~1,000 px.
- **Evidence.** `slice` at y≈3,900–4,900 vs `p0.png` y≈450–850; `MobileNav.tsx` `ITEMS`; `Hero.tsx` href logic.
- **Proposal.** Make the hero card the *only* interactive tracker (it already is interactive when live). Turn `DailyTracking` into what the brief actually asked for: the *progress* view — the three tiles «مكتمل / تم قضاؤها / متبقية» plus the overall bar — and move the "إضافة صلاة قضاء" affordance into the tracker rows (#5). Give the hero card `id="track"` (move the id off the section) so every existing `#track` link lands on the real tracker. On `lg:` you may still show the preview card in `DailyTracking` for the marketing story, but as `StaticCheckBoxes` (read-only) so there is exactly one write surface.
- **Effort.** M.
- **Files.** `src/app/sections/DailyTracking.tsx`, `src/app/sections/Hero.tsx`, `src/app/components/MobileNav.tsx`.

### 3. Replace the 5xl plan card on phones with a one-line plan strip + expandable steppers

- **Problem.** The plan section is ~1,000 px on a phone: a 5-row stepper card (each row 80 px) followed by a full-height dark green card with a 48 px «9», «63 صلاة أسبوعياً», duration and date. For a daily user this is reference information; it is edited a few times a year. The dark card also repeats «متبقٍ» numbers already shown in the stepper rows.
- **Evidence.** `slice-2.png` (y≈3,000–3,800).
- **Proposal.**
  - Under the tracker (app mode) show one strip: `bg-secondary/60 rounded-xl px-4 py-3 flex items-center justify-between text-sm` → «٩ صلوات يومياً · الانتهاء المتوقع سبتمبر 2030» with a trailing chevron «تعديل» that scrolls to `#plan`.
  - In `PlanBuilder`, on phone (`lg:` keeps the two-column layout), collapse the summary card into a two-cell row above the steppers: `grid grid-cols-2 gap-3` — cell 1 «يومياً / 9», cell 2 «الانتهاء المتوقع / سبتمبر 2030»; drop «63 أسبوعياً» on phones (`hidden lg:block`); show duration «4 سنوات» as the cell's second line in `text-xs text-primary-foreground/65`. Reduce stepper rows to `py-3` and the prayer name to `text-base`.
- **Effort.** M.
- **Files.** `src/app/sections/PlanBuilder.tsx`, `src/app/sections/Hero.tsx`.

### 4. Bring the daily controls up to 44 px and remove hover-only feedback

- **Problem.** `CheckBoxes` are `w-8 h-8` (32 px) with `gap-2` — 40 px pitch, 32 px target. `hover:scale-110` sticks after a tap on touch screens (the hover state persists until the next touch elsewhere). `Stepper` `sm` is 36 px, `lg` is 40 px. DatePicker month arrows are `w-8 h-8`. These are the controls used every single day.
- **Evidence.** `src/app/components/CheckBoxes.tsx` lines 40–50; `Stepper.tsx`; `DatePicker.tsx` header buttons.
- **Proposal.**
  - Check boxes: visual 32 px is fine, but pad the hit area: `w-11 h-11 -m-1.5 p-1.5` on the button with the 32 px box as an inner span, or simply `w-10 h-10 rounded-xl` boxes with `gap-2.5` (5 boxes + gaps = 240 px, fits next to a 64 px name at 390 px). Replace `hover:scale-110` with `active:scale-95` and wrap hover styles in `@media (hover:hover)` (Tailwind: `[@media(hover:hover)]:hover:…` or a small utility in `theme.css`).
  - Stepper: `sm` → `w-11 h-11` (44), `lg` → `w-12 h-12` (48) on phones; keep the current sizes from `md:` if desktop density matters.
  - DatePicker arrows `w-10 h-10`; day cells already `h-10` on phones (ok); make `min-w-10`.
- **Effort.** S.
- **Files.** `src/app/components/CheckBoxes.tsx`, `src/app/components/Stepper.tsx`, `src/app/components/DatePicker.tsx`.

### 5. Make "extra prayer" a ghost box in the row, not a hidden sub-menu

- **Problem.** «+ إضافة صلاة قضاء» is a `text-xs` link (≈20 px tall) that toggles a second row of five `text-xs` chips. Three taps and two visual jumps to log one prayer beyond target — the thing the brief wanted as "a simple action".
- **Evidence.** `slice-0.png` y≈1,060; `DailyTracking.tsx` `showAdd` block.
- **Proposal.** In `CheckBoxes`, when `done >= total`, render one additional dashed ghost box (`border-2 border-dashed border-border text-muted-foreground` with a 14 px `Plus` icon, `aria-label="إضافة صلاة {name} خارج الهدف"`) whose tap calls `actions.addExtra(id)`. Extra boxes already exist as filled boxes (the component renders `Math.max(target, done)`); mark them with a sand outline (`border-sand`) so "beyond target" reads without a caption. Delete `showAdd` entirely.
- **Effort.** S.
- **Files.** `src/app/components/CheckBoxes.tsx`, `src/app/sections/Hero.tsx`, `src/app/sections/DailyTracking.tsx`.

### 6. Rework the bottom bar for daily use

- **Problem.** Tabs are «الرئيسية / الحساب / الخطة / اليوم». For a returning user «الرئيسية» and «الحساب» are near-useless (the calculator is a once-only task), and «اليوم» — the daily task — is the *last* tab, farthest from the right-thumb rest position in RTL. The `todayLeft` badge is a good idea but it is the only "today" signal on screen.
- **Evidence.** `p3.png` bottom; `MobileNav.tsx`.
- **Proposal.** Make the bar state-aware:
  - Live: «اليوم» (first/right), «الخطة», «طباعة» (`#print`), «المزيد» (`#privacy` — privacy, backup, FAQ). Drop «الرئيسية» and «الحساب»; recalculation stays reachable from the plan section («إعادة الحساب» link already exists in the calculator card footer — add a mirror link in `PlanBuilder`).
  - Not live: «ابدأ» (`#calculator`), «كيف يعمل», «الخصوصية», «الأسئلة».
  - Keep `h-16`, but raise the label to `text-xs` (12 px) and use `font-medium`; 11 px Cairo is under the readable floor.
  - Optional: replace the numeric badge on «اليوم» with a tiny 5-segment progress tick under the icon (5 dots, `w-1 h-1`, filled = done) — quieter than a red-ish count, and matches "not a game".
- **Effort.** S–M.
- **Files.** `src/app/components/MobileNav.tsx`, `src/app/sections/Nav.tsx` (the top-right «ابدأ الآن» should also hide when `live` on `<lg`).

### 7. Cut vertical rhythm by a third on phones

- **Problem.** Every section uses `py-16` (64 px top + 64 px bottom) plus `SectionHeader mb-10`, plus `text-3xl` titles with a pill above and a subtitle below (~230 px of header per section). Ten sections ⇒ ~2,300 px of header/whitespace alone. "Spacious" in the brief was for desktop; on phone it reads as distance from the task.
- **Evidence.** All slices; e.g. calculator header y≈1,650–1,900, print header y≈5,200–5,450.
- **Proposal.** Phone values, desktop untouched: sections `py-10 md:py-24`; `SectionHeader` `mb-6 md:mb-16`; h2 `text-2xl sm:text-3xl md:text-5xl`; subtitle `text-sm sm:text-base md:text-lg`; drop the pill on phones for sections whose title already names the section (`hidden sm:inline-block` in `Pill`) — keep it only where it adds tone («الحساب التقديري»). `HowItWorks` cards `p-4` are already compact; make the whole section `hidden` in app mode on `<lg` (#9).
- **Effort.** S.
- **Files.** `src/app/components/SectionHeader.tsx`, every `src/app/sections/*.tsx` (`py-` values).

### 8. Fix the inputs that make iOS zoom, and the date-of-puberty entry

- **Problem.** iOS Safari zooms the page when a focused `input`/`select` has font-size < 16 px. `#menses-days` is `text-sm`, `PeriodRow` label input is `text-sm`, both DatePicker `<select>`s are `text-sm`. After the zoom the RTL layout is scrolled to an odd horizontal offset. Separately, «تاريخ البلوغ التقريبي» asks for a full calendar date 10–40 years back; the sheet opens on today's month, so the user taps the year dropdown (86 entries) then a month, for a value that is by definition approximate.
- **Evidence.** `Calculator.tsx` lines ~150, ~300; `DatePicker.tsx` selects; `p1.png` y≈480–660.
- **Proposal.**
  - `text-base` on every `input`/`select` at `<sm`, or add `@media (max-width:640px){ input,select{font-size:16px} }` to `theme.css` (`label, button, input` already get `--text-base`, but utilities override).
  - For the first field, offer a coarse mode above the picker: two `inputMode="numeric"` fields «سنة الميلاد» and «سن البلوغ التقريبي» (default 14/15) that derive `startDate` as 1 January of birth-year+age; keep the exact DatePicker as «أو اختر تاريخاً محدداً». Month precision is irrelevant to a ±365-day estimate and the brief explicitly says dates can be approximate.
  - In the bottom sheet, keep month/year selects native (good on iOS) but default the *start* picker's initial view to `max − 15 years` instead of today.
- **Effort.** M.
- **Files.** `src/app/sections/Calculator.tsx`, `src/app/components/DatePicker.tsx`, `src/styles/theme.css`, `src/app/state.tsx` (a `setStartFromAge` action).

### 9. Reconcile landing and app: hide marketing in app mode, keep utilities

- **Problem.** After calculation, the page still shows «كيف يعمل» (three steps the user already completed), the `FinalCta` band «ابدأ حساب صلواتي» (linking back to the calculator, which would *replace* their counts), the nav CTA «ابدأ الآن» (same link), and the hero preview caption. These are wrong for the user in front of them and each adds a screen.
- **Evidence.** `p0.png` y≈920–1,550 (HowItWorks), `p3.png` y≈8,700 (FinalCta), `Nav.tsx` CTA.
- **Proposal.** Introduce a `mode = state.calculated ? "app" : "landing"` in `App.tsx` and order/hide accordingly on phones:
  - App order: Hero-as-tracker → plan strip → Progress (`DailyTracking` tiles) → PlanBuilder (collapsed to strip + «تعديل الأهداف» disclosure) → PrintablePlanner (period chips + button only; preview `hidden lg:block`) → Privacy (backup/restore/delete as a list) → Calculator inside a `<details>` titled «إعادة تقدير الصلوات الفائتة» → About + FAQ → Footer. Remove `HowItWorks` and `FinalCta` in app mode (`lg:` may keep them).
  - Landing order: as today but with #7's compression; the hero card keeps the sample data («معاينة توضيحية»).
  - Replace the `FinalCta` band in app mode with the brief's closing line only: «خطوات صغيرة، واستمرار بإذن الله.» in the footer (already there) — no second CTA.
- **Effort.** L (structural, but mostly conditional rendering — no state changes).
- **Files.** `src/app/App.tsx`, `src/app/sections/Nav.tsx`, `HowItWorks.tsx`, `FinalCta.tsx`, `Calculator.tsx`, `PrintablePlanner.tsx`.

### 10. Handle large daily targets without a wall of boxes

- **Problem.** `MAX_TARGET` is 50; targets of 6+ wrap the check boxes onto two or three lines (5 × 40 px fit per line beside the name), and each row becomes taller than the next, breaking the tracker's rhythm. Someone catching up quickly is the exact user who taps the most.
- **Evidence.** `CheckBoxes.tsx` `flex-wrap`; `storage.ts` `MAX_TARGET = 50`.
- **Proposal.** In `CheckBoxes`, when `total > 6`, switch to a counter row: `[−] 3 / 10 [+]` using `Stepper size="lg"` with `tabular-nums`, and a thin 5-segment progress line under it; below 7 keep boxes (a box per prayer is the strongest "this one is done" signal). Same component API, so `Hero`/`DailyTracking` need no change.
- **Effort.** S.
- **Files.** `src/app/components/CheckBoxes.tsx`.

## Quick wins (≤ 1 hour each)

- Logical direction utilities: `HowItWorks.tsx` `ml-1.5` → `me-1.5`; `Faq.tsx` `pl-4` → `pe-4`, `text-right` → `text-start`; `About.tsx` `list-disc pr-5` → `ps-5`; `DailyTracking.tsx` `ml-1` → `me-1`. All harmless today but will flip if an LTR locale is ever added, and `text-right` is a smell in an RTL codebase.
- Percent sign: `pct()` returns `"56٪"` (Latin digits + Arabic percent). Confirm bidi order on device; if it renders as «٪56» in any browser, wrap in `<bdi>` or use `<span dir="ltr">56%</span>`. The safer Arabic-with-Latin-digits convention is `56%` inside a `dir="ltr"` span.
- Print preview dates: «الخميس 9/10» is ambiguous (month/day vs day/month). Use `formatShortDate` with `{ day: "numeric", month: "short" }` → «10 سبت» or keep numeric but `day/month` with an explicit `dir="ltr"` span.
- Helper-text floor: search for `text-xs` in `Calculator.tsx`, `Hero.tsx`, `DailyTracking.tsx`, `PlanBuilder.tsx` and raise anything the user must *read* (helper copy, «معاينة توضيحية», «التقدم الإجمالي») to `text-[13px]` or `text-sm`. Keep `text-xs` only for badges and pills.
- Heading line-height: `leading-tight` (1.25) on Cairo bold at 30–36 px can clip shadda/kasra between lines (e.g. «رتّب»). Use `leading-snug` (1.375) for Arabic headings; body stays `leading-loose`.
- `scroll-behavior: smooth` in `theme.css` makes a bottom-bar tap animate across 4,000+ px. Set it only from `lg:` (`@media (min-width:64rem){ html{scroll-behavior:smooth} }`) and respect `prefers-reduced-motion`.
- Nav CTA on `<lg`: `hidden` when `state.calculated` (needs `useApp()` in `Nav.tsx`), or swap for a quiet «5 / 9 اليوم» chip linking to `#track`.
- Privacy actions on phone: the 3-column `text-xs` buttons («نسخ احتياطي لخطتي» wraps to two lines at ~110 px) → stack as full-width rows `flex items-center gap-3 h-12 px-4` with the icon at the start; keep the 3 benefit cards but as one horizontal row of icon+label chips (`flex gap-2 overflow-x-auto`) or drop the icons' 44 px tiles on phones.
- Bottom bar label size `text-[11px]` → `text-xs`; add `aria-current` styling with a 2 px top indicator (`before:` bar in primary) so the active tab reads at a glance without color alone.
- Footer `pb-28` guard: also add `scroll-padding-bottom: 5rem` on `html` for `<lg` so the last anchor targets (FAQ/CTA) don't land under the bar.

## Bigger ideas (structural)

- **Two entry states, one component tree.** The `mode` flag (#9) is the backbone: hero → tracker, marketing sections gated, bottom bar remapped. Do this before any styling pass; most of the vertical-height complaints disappear as a side effect.
- **Sticky "today" summary while scrolling.** In app mode, when the tracker card scrolls out of view (`IntersectionObserver`, already used in `MobileNav`), show a 40 px sticky strip under the top nav: «قضاء اليوم · 5 من 9» with a 5-segment line and a tap to return. Cheaper alternative: fold it into the bottom bar's «اليوم» tab as the progress ticks proposed in #6.
- **Calculator as a one-time flow.** On phones the calculator could be a 3-step sheet (dates → exclusions → results) instead of a 1,400 px form + results card; step 2 only appears if the user taps «لديّ فترات مستثناة». After completion the section collapses to its result row «تقدير: 6,214 صلاة · تعديل».
- **Quieter debt.** The plan card's big number is the *daily* number (good, on-brief). The totals that could feel heavy are «الإجمالي 6,214» in the calculator footer (`text-2xl text-primary`) and the «متبقية» tile. Demote both to `text-base font-semibold text-foreground` and lead the progress tiles with «تم قضاؤها» first (in RTL, the rightmost tile) so the eye lands on what has been done, then «مكتمل», then «متبقية».
- **Week glance in the tracker.** A single row of 7 small day dots under the tracker («هذا الأسبوع»), filled proportionally to `log` — factual, not a streak, and it uses data already stored. Do not add counters, flames or "days in a row".
- **Printable planner on phone.** Most phones cannot print A4 directly; relabel the button «حفظ الخطة PDF» and keep the note about the share sheet. Hide the table preview below `lg` (it is `aria-hidden` and 400 px tall) in favour of a one-line description of what the PDF contains.

## Keep as is

- Palette and tokens in `theme.css` — cream `#faf7f1`, green `#2f5d4a`, charcoal `#26312b`, sand `#c9a57a` — and the decision to use sand for *overall* progress and green for *today*: it quietly separates the long horizon from the daily task.
- Latin digits with Arabic text (`ar-u-nu-latn-ca-gregory`) and the Arabic count agreement helpers (`arPrayers`, `arDays`, `durationFromDays`) — copy quality is high and matches the brief's tone.
- DatePicker as a bottom sheet on phones with native `<select>` for month/year, Saturday week start, disabled out-of-range days, «اليوم / مسح» footer.
- The tracker card itself: dark green header with the date, one row per prayer, boxes filled right-to-left, «أنجزت اليوم X من Y» in words — this is the product; everything above proposes moving and enlarging it, not redesigning it.
- Progressive disclosure of «الحيض والنفاس» inside «فترات مستثناة» — respectful, optional, and out of the way for users it does not apply to.
- `ArrowLeft` for "forward" and `ChevronRight` for "previous month" — RTL icon direction is correct throughout; `-start-*` on the badge is also right.
- Self-hosted Cairo (no third-party font requests), the local-only storage story, and the backup/restore JSON flow.
