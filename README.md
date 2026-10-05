# خطة القضاء — Qada Prayer Planner

<p dir="rtl">أداة مجانية ومفتوحة المصدر لتنظيم قضاء الصلوات الفائتة: قدّر صلواتك، وضع خطة تناسب وقتك، وسجّل تقدّمك. بدون حساب، وبياناتك محفوظة في متصفحك.</p>

A free, open-source Arabic web app for estimating missed prayers, setting manageable daily goals, and tracking progress. Built for a calm, private experience with a right-to-left interface on mobile and desktop.

[Try the app](https://qadda-salat.ilhembekkr.workers.dev) · [Report a bug or suggest a feature](https://github.com/ilhembekkr/qadaa-salat/issues) · [Contribute](#contributing)

## Features

- **Flexible estimates:** calculate from approximate dates, exclude specific periods, optionally account for menstrual and postpartum periods, and adjust each prayer's total manually.
- **Personal daily goals:** set a different target for each of the five prayers and change it without losing recorded progress.
- **Two ways to record:** log prayers individually or use **«تسجيل قضاء أيام كاملة»** to record complete days together. Four days adds four of each prayer. Bulk recording includes undo and is limited by the smallest remaining prayer balance.
- **Progress at a glance:** see today's activity, the remaining count for each prayer, overall progress, and an estimated completion date.
- **A gentle reminder:** an inline invitation to istighfar and du‘a appears after each recording. It can be dismissed and returns with the next recording.
- **Printable plans:** generate an A4 schedule for a week, a month, or three months. **«حفظ الخطة PDF»** opens the browser's print dialog to print or save as PDF.
- **Local backups:** export a JSON file and restore it on another browser or device.

## Using the app

1. Estimate your missed prayers, then adjust the numbers to suit your situation.
2. Choose a daily target for each prayer.
3. Record what you have completed, one prayer at a time or in complete days. You can record more or less than your daily target.
4. Export a backup periodically, especially before clearing browser data or moving to another device.

The app is an organizational and estimation tool, not a fatwa service. Its editable estimates and goals let users follow the guidance appropriate to their circumstances.

## Privacy and storage

Prayer estimates, dates, goals, and progress are stored in the current browser using `localStorage`. The app has no accounts, application backend, or analytics integration, and does not upload this information. Fonts are bundled with the app.

- Data belongs to a particular browser and site address; it does not automatically sync between devices or different deployments.
- Clearing site data removes the saved plan. If browser storage is blocked or a write fails, the app displays a storage notice.
- JSON export and restore provide a manual way to back up or transfer a plan. Backup files contain personal data; keep them private.

The hosting service still receives the normal requests needed to serve the website and its static files.

## Local development

You need **Node.js 22 or later**, npm, and Git. No API keys, database, or Cloudflare account are needed to run the app locally.

```bash
git clone https://github.com/ilhembekkr/qadaa-salat.git
cd qadaa-salat
npm ci
npm run dev
```

Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run typecheck` | Check TypeScript without generating files. |
| `npm test` | Run the tests with Node's built-in test runner. |
| `npm run build` | Check TypeScript and build the app into `dist/`. |
| `npm run preview` | Serve an existing production build locally. |
| `npm run deploy` | Build and deploy to the configured Cloudflare Worker. |

To check your changes before opening a pull request:

```bash
npm test
npm run build
```

For interface changes, also check the app at phone and desktop widths, keyboard navigation, Arabic text, and RTL layout. Use sample prayer data for screenshots and testing.

## How progress is calculated

Each prayer keeps its own estimated total, recorded count, remaining balance, and daily goal. Extra recordings for one prayer do not complete another prayer's target.

The forecast divides each remaining prayer count by its daily target, rounds up to whole days, and uses the longest duration as the overall estimate. It assumes the daily targets are met. If an unfinished prayer has a target of zero, the overall completion date is left undefined.

Changing a goal does not rewrite past recordings. The printable schedule starts from the outstanding work, subtracts prayers already recorded today, and stops allocating a prayer once its estimated balance is complete.

## Project structure

```text
src/
  app/
    components/       Tracker, full-day recording, reminders, and shared UI
    sections/         Calculator, goals, printing, privacy, and landing sections
    App.tsx           Page layout for new and returning users
    state.tsx         React context, actions, persistence, and tab synchronization
  lib/
    calc.ts           Date-based estimates and excluded periods
    prayers.ts        Prayer types, Arabic formatting, and local-date helpers
    progress.ts       Balances, forecasts, bulk recording, and print schedules
    istighfar.ts      Inline reminder behavior
    storage.ts        Saved-state validation, backup, and restore
  styles/             Theme, RTL interface styles, bundled fonts, and print layout
public/               App icons and static images
tests/                Progress, display, reminder, and storage tests
docs/                 Design notes, project brief, and promotional material
wrangler.jsonc        Cloudflare deployment configuration
```

The app uses **React, TypeScript, Vite, Tailwind CSS, Lucide icons, and the Cairo font**. Tests load the TypeScript sources through a small helper without a separate test framework.

## Deployment

The production build is a static site. You can serve `dist/` with a static hosting service; configure an `index.html` fallback if your host requires one for client-side routes.

### Cloudflare Workers

This repository includes a Cloudflare Workers static-assets configuration in [wrangler.jsonc](wrangler.jsonc).

For your own deployment, set `name` in that file to your Worker name, then authenticate with your Cloudflare account and deploy:

```bash
npx wrangler login
npm run deploy
```

Wrangler uploads `dist/` and prints the deployed URL. Keep credentials and local `.dev.vars` files out of commits.

## Contributing

Bug reports, feature ideas, Arabic wording improvements, accessibility fixes, and code contributions are welcome. You can participate in Arabic or English.

- **Bugs:** [open an issue](https://github.com/ilhembekkr/qadaa-salat/issues) with reproduction steps, expected and actual behavior, and your browser/device. Use sample data instead of sharing your personal backup.
- **Ideas:** explain the situation you want to improve. For substantial changes, open an issue first so the approach can be discussed.
- **Pull requests:** fork the repository, create a branch from `main`, and keep the change focused. Describe the result, include relevant test results, and add screenshots for visual changes.

Please preserve the app's core principles: local storage, no required account, clear Modern Standard Arabic, accessible RTL interactions, and a calm experience. Keep religious reminders brief and avoid turning progress into competition. Add or update regression tests when changing calculations, persistence, or tracking behavior.

## Credits

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for the icon, font, and original design-template credits.

## License

Original project code is released under the [MIT License](LICENSE). Third-party dependencies and assets retain their own license terms; see [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
