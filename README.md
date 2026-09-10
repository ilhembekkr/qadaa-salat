# خطة القضاء — Qada Prayer Planner

A private, account-free Arabic (RTL) web app for estimating missed prayers, building a realistic daily make-up plan, tracking progress, and printing an A4 planner.

Everything is stored in the browser (`localStorage`). Nothing is sent to a server. Users can export and restore their plan as a JSON file.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve dist/
```

## Structure

```
src/
  lib/prayers.ts      prayer constants, Arabic formatting, date helpers
  lib/calc.ts         missed-days estimate with excluded periods
  lib/storage.ts      state shape, validation, localStorage, backup/restore
  app/state.tsx       AppProvider: derived values + actions
  app/components/     Logo, SectionHeader, Stepper, CheckBoxes, PrintSheet
  app/sections/       one file per landing-page section
  styles/             theme tokens, print stylesheet, self-hosted font
docs/brief.md         original product brief
```

## Notes

- "تحميل الخطة PDF" opens the browser print dialog; the print stylesheet hides the page and renders the planner table (`PrintSheet`) on A4.
- The plan's estimated duration is driven by the slowest prayer: remaining ÷ daily target.
