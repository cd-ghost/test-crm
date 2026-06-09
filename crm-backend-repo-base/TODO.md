# TODO - RTAV CRM sync failure fixes

- [x] Update `public/index.html` modal Save buttons to call `event` wrappers that immediately invoke `e.preventDefault()` and stop propagation.

- [x] Ensure every save/edit/delete method calls the correct `App.refreshData(...)` immediately after successful API operations.

- [x] Audit all `api/*.ts` files for Neon SDK legacy calls (e.g., `sql("...", [..])`) and convert to tagged template `sql`.

- [ ] Fix `/api/leads`, `/api/contacts`, `/api/companies`, `/api/deals`, `/api/activities` to be robust against missing columns in production by adding `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` and mapping payload fields.

- [ ] Ensure all API handlers return clean JSON errors via `res.status().json()` and never throw unhandled exceptions.

- [ ] Run TypeScript build/tests (if available) to confirm compilation.


