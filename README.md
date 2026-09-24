# React Tenant Boilerplate

A neutral React 18/TypeScript administration shell for the companion Django API. The default build includes authentication, session-only tenant selection, organizations, branches, members, roles, permissions, profile management, responsive navigation, and accessible data views.

## Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- The Django backend running with PostgreSQL and Redis; see `../boilerplate-core/README.md`

## Fresh setup

```bash
cp .env.example .env
pnpm install
pnpm dev
```

The default `.env.example` points to `http://localhost:8000/api/v1/`. Django must allow the Vite origin (normally `http://localhost:5173`) in its CORS and CSRF settings. Sign in with an email/password account that has an active organization membership, then choose an organization. The selection is deliberately not persisted across browser restoration.

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Versioned Django API root, including trailing slash | `http://localhost:8000/api/v1/` |
| `VITE_APP_NAME` | Neutral shell/product label | `Tenant Console` |

Do not place secrets in Vite variables: every `VITE_` value is compiled into the browser bundle.

## Commands

```bash
pnpm dev          # local development server
pnpm typecheck    # strict TypeScript project check
pnpm lint         # lint active boilerplate source
pnpm test         # Vitest unit tests
pnpm test:watch   # interactive test runner
pnpm build        # type-check and create production assets
pnpm preview      # serve the production build locally
```

## Architecture

```text
src/
  app/       providers, route boundaries, shell, module registry
  shared/    API transport/contracts, utilities, responsive UI primitives
  features/  auth, organizations, branches, members, roles, permissions, profile
  modules/   optional CRM, info, and KPI module entry points
  test/      shared browser-test setup
```

`AuthProvider` owns the current user and in-memory access token lifecycle. Only the rotating refresh token is kept in local storage. Browser restoration refreshes the token and fetches `/accounts/me/`; logout asks Django to blacklist the refresh token and clears local state even if that request fails.

`TenantProvider` owns the active organization, optional branch, and tenant permission set. It clears all `['tenant', organizationId, ...]` React Query data when changing tenants. Route boundaries enforce public, authenticated, tenant-selected, and permission states. UI guards hide unavailable actions, but Django remains authoritative.

## Permissions

Use backend codenames, never role names:

```tsx
<PermissionGuard require="branches.manage">
  <Button>Add branch</Button>
</PermissionGuard>
```

Add the same codename to route and navigation metadata. Core navigation lives in `src/app/moduleRegistry.ts`. Tenant query keys must always include the organization ID through `src/shared/api/queryKeys.ts`.

## Responsive collections

Use `DataView<T>` for all record collections. Supply semantic desktop columns and a concise mobile renderer from the same data definition:

```tsx
<DataView
  rows={branches}
  columns={columns}
  getRowId={(branch) => branch.id}
  mobileSummary={(branch) => <strong>{branch.name}</strong>}
/>
```

At `md` and above it renders a semantic table; below `md` it renders touch-friendly record cards. Search, sort, pagination, loading, empty, error, and row action states are built in.

## Adding a tenant-aware feature

1. Create `src/features/<feature>/api.ts`, types, components, and a page.
2. Scope every backend request with the active organization ID.
3. Add organization-aware keys to `queryKeys` and invalidate only the matching tenant key.
4. Add a navigation record with a backend permission codename.
5. Nest the route under `TenantBoundary` and a `PermissionBoundary` in `src/app/router.tsx`.
6. Guard create/update/delete controls with the same permission.
7. Render collections with `DataView`, including a mobile summary.
8. Add route, authorization, API failure, and responsive rendering tests.

## Optional modules

CRM, info, and KPI are intentionally disabled in `src/app/moduleRegistry.ts`. Each has a self-contained entry point under `src/modules/` and uses its matching permission namespace (`crm.*`, `info.*`, or `kpis.*`). To enable one:

1. Enable the matching Django app and URL include as documented in `../boilerplate-core/docs/optional-apps.md`.
2. Change that module's `enabled` flag to `true` in `src/app/moduleRegistry.ts`.
3. Restart Vite. Its route and navigation are registered together and remain hidden from users without the module's read permission.
4. Extend the self-contained page/API entry under `src/modules/<module>/` as needed; keep API paths below the matching `/api/v1/<module>/` root and include `organization_id` in tenant-owned requests.
5. Add tests for any module-specific create/update/delete actions.

The old product-specific pages are not part of the TypeScript build or runtime. They can be removed after any desired business UI is copied into a module.

## Production checklist

- Set `VITE_API_BASE_URL` to the public HTTPS API root.
- Configure Django CORS/CSRF origins for the deployed frontend.
- Replace `VITE_APP_NAME`, the page metadata in `index.html`, and the placeholder initial in `Shell.tsx`.
- Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- Serve `dist/` through a static host with SPA fallback to `index.html`.
- Prefer an HttpOnly refresh-cookie backend before handling high-sensitivity data; local storage is used only because the current API returns refresh tokens in JSON.
