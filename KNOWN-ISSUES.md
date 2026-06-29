# Known Issues

Things I found but deliberately did not fix in the time box, with how I'd approach them next.
Listing them is intentional: knowing what is still wrong matters as much as the fixes I shipped.

## Security / correctness still open

1. **CSV formula injection.** `GET /export.csv` escapes quotes but does not neutralize cells that
   start with `=`, `+`, `-`, or `@`. A feedback message like `=HYPERLINK(...)` (one is in the seed
   data) becomes a live formula when the CSV is opened in Excel/Sheets. Fix: prefix any such cell
   with a single quote (`'`) or wrap it so spreadsheet apps treat it as text. ~30 minutes.

2. **Internal notes are not actually private.** `is_private` is stored and displayed, but
   `GET /feedback/:id/notes` returns every note to any authenticated user. A private note is meant
   to be restricted (e.g. to the author or to managers), but the API does not enforce that. Fix:
   filter private notes by role/author in the query. Needs a product decision on who can see them.

3. **No input validation.** The API trusts the request body. `priority` can be any string,
   `due_at` any string, `assignee_id` any number (even one that does not exist). Injection is
   closed, but invalid data can still be written. Fix: validate with a schema (e.g. zod) and reject
   bad input with 400.

4. **Token stored in `localStorage`.** This is readable by any script on the page, so it pairs
   badly with any future XSS. A more robust design stores the session in an httpOnly cookie. This
   is a larger change (CSRF handling, cookie config) so I left it for a deliberate auth pass.

5. **Token still accepted in the URL query for CSV export.** I now *verify* that token, but passing
   it in the URL means it can leak via browser history, proxies, and server logs. Better: stream
   the download via fetch with an Authorization header, or use a short-lived one-time download
   token.

6. **`JWT_SECRET` default is a placeholder.** The app refuses to start with no secret, but
   `change-me-in-production` in `.env.example` would pass that check. For production I would require
   a strong secret and document rotation.

## Reliability / quality

7. **Inbox auto-refresh has a stale-closure bug.** The 45-second `setInterval` in `Inbox.tsx` has
   an empty dependency array but reads `page`, `filter`, `search`, and `items`, so it always polls
   the first page with the initial filters and can overwrite the user's current view. Fix: move the
   polling into the same effect that loads data, or use a ref. I left this because it is a UX
   refinement, not a correctness or security risk.

8. **`serializeFeedback` does N+1 queries and assumes the customer exists.** It runs a separate
   query per row for customer and assignee, and would throw if a customer row were missing. Fix:
   join in a single query and handle the missing-customer case.

9. **No automated tests.** I verified everything manually (documented in DECISIONS.md). With more
   time I would add API tests for auth (forged token rejected), pagination boundaries, and the
   injection cases so these cannot regress.

10. **Generic error handling.** Several handlers return a generic 500. Fine for now, but I would
    add consistent error shapes and proper 400/404 responses, and avoid logging request bodies.

11. **CORS is fully open** (`app.use(cors())`). For production I would restrict it to the known web
    origin.

## With another full day, in order

1. Enforce private-note access control (#2) and add input validation (#3) — these are correctness
   and trust issues a client would hit quickly.
2. Fix CSV formula injection (#1).
3. Add a small automated test suite around auth, pagination, and injection (#9).
4. Move sessions to httpOnly cookies (#4, #5).
5. Clean up the N+1 query and the polling bug (#7, #8).
