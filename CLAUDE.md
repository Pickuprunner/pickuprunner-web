# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PickupRunner — the public marketing site plus an internal admin console for a local grocery/pharmacy
delivery service. React 19 SPA built with Vite, deployed to Cloudflare Workers via `vinext`.
The backend is a separate service; this repo only talks to it over HTTP.

## Commands

```bash
npm run dev              # Vite dev server on :3000 (strictPort, host exposed)
npm run build            # vite build -> dist/
npm run preview          # serve the production build

npm run lint:types       # tsc --noEmit — the type check that actually works
npm run lint:css         # stylelint --fix on src/**/*.css
npm run lint             # both of the above

npm run preview:cf       # build, then serve through wrangler dev (local Workers runtime)
npm run deploy           # vite build && wrangler deploy
```

There are no tests and no test runner.

`npm run lint` runs the type check and stylelint. There is no eslint in this project.

## Architecture

**Routing is code-based, not file-based.** `src/App.tsx` builds the entire TanStack Router route
tree by hand — `createRootRoute` supplies the Navbar/Outlet/Footer chrome, and every page gets an
explicit `createRoute`. `src/pages/` is just a folder of components; adding a file there does
nothing until it is wired into the route tree in `App.tsx`. `src/main.tsx` mounts the app inside a
`QueryClientProvider` and force-enables dark mode with
`document.documentElement.classList.add('dark')`.

**All server access goes through `src/lib/api/`.** Base URL is `VITE_API_URL` (default
`http://localhost:8080`). That module owns:

- a module-level token store (`session`) — not React state, not context;
- `request<T>()`, which unwraps the backend's `{ data, message, error, errors }` envelope and
  returns `body.data`, throwing `Error(errors.join('. ') || error || message)` on non-2xx;
- automatic access-token refresh: passing a `token` argument marks a call as authenticated (the
  token actually sent is read from the store), and a 401 triggers a single-flight
  `POST /auth/refresh` and one retry before `onExpired` fires.

Endpoint groups are exported as small objects — `authApi`, `usersApi`, `adminApi`,
`accreditationsApi`, `driverReviewApi`, `applicationsApi`, `contactApi` — alongside the domain
types (`AdminOrder`, `AdminDriver`, `Accreditation`, order/payment/accreditation status unions).
New endpoints belong here, following the same shape.

**Admin auth lives entirely in `src/pages/AdminPage.tsx`.** It persists the session to
`sessionStorage` under `pickuprunner_admin_session`, rehydrates it into `apiSession` on mount, and
registers `apiSession.onRefreshed` / `onExpired` to keep storage in sync and log out on expiry.

**Every admin screen has its own URL.** `AdminPage` is a layout route (sign-in form, header, tab
links, `<Outlet />`); `App.tsx` nests the sections under it:

| List | Detail |
|---|---|
| `/admin/orders?status=&q=` | `/admin/orders/$orderId` |
| `/admin/customers?q=` | `/admin/customers/$customerId` |
| `/admin/drivers?q=` | `/admin/drivers/$driverId` |
| `/admin/applications?status=` | `/admin/applications/$userId` |
| `/admin/accounts?role=` | `/admin/accounts/$userId` |

`/admin` redirects to `/admin/orders`. List filters live in the query string (validated by
`validateSearch` in `App.tsx`) so Back from a detail page restores them. Screens read the token
from `AdminContext` via `useAdmin()` and register their reload for the header's Refresh button with
`useRegisterReload()`. Files: `components/admin/ui/` (context, shared cards/badges/fields,
`useAdminData`), `components/admin/panels/` (list screens), `components/admin/details/` (detail
screens). Images: profile photos are public URLs (`<Avatar>`); delivery photos and driver documents
live in private buckets, so `<SignedImage>` fetches a short-lived signed link (`deliveryApi.photo`,
`accreditationsApi.document`) and shows it inline — never render the stored path. Components read route params/search with `getRouteApi('<route id>')`, not by importing
route objects from `App.tsx` (that would be a circular import).

**Data fetching is hand-rolled.** `@tanstack/react-query` is installed and the provider is
mounted, but nothing uses it: pages use `useState` plus async submit handlers with local
`loading`/`error` state, and admin screens use `useAdminData`. Match that pattern unless
deliberately introducing a library. `react-hot-toast` is used for the admin's confirmations.

## Styling

Tailwind 3 with a design-token indirection: `src/index.css` defines HSL triples as CSS custom
properties (`--primary`, `--sidebar`, `--chart-1`, radii, shadows, fonts), and
`tailwind.config.cjs` maps them to utilities as `hsl(var(--token))`. Change a color in `index.css`,
not in the Tailwind config.

`darkMode: ["class"]` with the `dark` class applied unconditionally at boot, so the `:root` light
palette is currently unreachable. Marketing pages also hardcode inline `style` colors — brand blue
`#0066FF`, brand yellow `#F5C400` — which bypass the token system entirely.

The classes `pr-glow-blue`, `pr-glow-yellow`, `pr-grid-bg`, and `pr-text-gradient` are used in JSX
but defined nowhere; they are currently no-ops.

## Where things live

```
src/
  App.tsx                    the whole route tree, by hand
  components/
    admin/ui/                context + hooks, formatting, badges, cards, images, eligibility
    admin/panels/            one file per list screen, plus ReviewActions and the filters
    admin/details/           one file per detail screen, plus the shared pieces
    admin/quick-check/       the Approve driver popup and the rule behind it
    forms/ marketing/        the shared text field, the section heading
  lib/api/                   client (fetch, token, refresh), types, auth, public, admin
  lib/brand.ts               support address and brand colours
  pages/<page>/              a page, its sections, and its copy
```

Each folder has an `index.ts`, so screens keep importing `from '../ui'` or `from './pages/order'`
rather than reaching into files.

**The admin is a separate download.** `App.tsx` pulls it in with `lazyRouteComponent`, so a visitor
reading the marketing pages never fetches the admin console. Only `components/admin/panels/filters`
is imported eagerly, because `validateSearch` runs before a screen is drawn. Keep it that way: an
ordinary `import` of an admin screen in `App.tsx` puts the whole console back in the first download.

**Dependencies are the ones actually imported.** The Vite starter's leftovers (`src/main.ts`,
`counter.ts`, `style.css`, `Shell.tsx`, the abandoned sidebar layout) and eleven never-imported
packages (framer-motion, recharts, @react-three/*, @dnd-kit/core, react-hook-form, zod, date-fns,
react-responsive, glob, clsx, tailwind-merge) were removed on 2026-09-14. Build-time tools live in
`devDependencies`.

## Cloudflare deployment

Deployed as a **static-asset Worker**: `wrangler.jsonc` declares no `main`, so Cloudflare serves
`dist/` directly with no worker script. `not_found_handling: "single-page-application"` rewrites
unknown paths to `index.html`, which is what makes the client-side TanStack Router routes
(`/order`, `/drivers`, `/admin`, ...) resolve on a hard refresh — without it every path but `/`
404s.

`npm run deploy` builds and ships in one step. There are no bindings; if you add KV/R2/etc. you
will also need a `main` worker entry to use them.

**Do not add a `public/_redirects` file.** The Pages-style SPA rule `/*  /index.html  200` is
rejected by the Workers assets API as an infinite loop (`code: 100324`) — Workers already strips
`/index` and `.html`, so the rewrite re-matches its own pattern. `not_found_handling` handles the
SPA fallback natively; `_redirects` is redundant here.

**Do not reintroduce `vinext`.** It was tried and removed (2026-09-04): vinext is a
Next.js-compatible framework, it reads `src/pages/` as a Next.js pages directory, and because those
files export named components rather than defaults it builds zero routes and never bundles
`index.html` / `src/main.tsx`. Deploying that output yields an empty site. Serving this SPA through
vinext would require migrating routing to Next.js file conventions.

The `@` alias resolves to `./src` (set in both `vite.config.ts` and `tsconfig.json`), though most
existing imports use relative paths. The Vite config is ESM, so use `import.meta.dirname` there,
never `__dirname`.

TypeScript runs with `strict: false` and `strictNullChecks: true`.
