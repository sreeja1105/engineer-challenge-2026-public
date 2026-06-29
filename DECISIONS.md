# Decisions

A running log of what I changed in Pulse, what I found, and why.

## 1. Replaced the joke "design" with a clean, neutral UI

**What I found:** The app shipped with a deliberately unprofessional look — a Comic Sans font, an
animated rainbow striped background, blinking status badges, tilted cards, emoji cursors, and a
scrolling marquee reading "WELCOME 2 PULSE… sign our guestbook!!!". It is unreadable and no client
would accept it.

**What I changed:**
- Rewrote `web/src/styles.css` as a calm, standard SaaS layout (white surfaces, system font,
  simple blue/gray accents). I kept every CSS class name the same, so this is a pure visual change
  with no effect on behaviour.
- Removed the marquee banner and the emoji around the title in `web/src/App.tsx`.
- Replaced the joke subtitle on the login screen in `web/src/components/Login.tsx`.

**Why first:** It is low-risk, fast, and it is a real product call — the demo now looks like
something we could put in front of a paying client. It also makes the rest of the work easy to
review visually.

## 2. Fixed the authentication, which let anyone in

This was the most serious problem in the app: a full authentication bypass plus plain-text
password storage. Three linked issues:

**A. Tokens were never verified.** `auth.ts` used `jwt.decode()`, which only reads a token and
never checks its signature. Any forged token was accepted as valid — a complete auth bypass.
I switched to `jwt.verify()` and moved the signing secret into `JWT_SECRET` (the code now refuses
to start if the secret is missing, instead of falling back to a hardcoded value). I also fixed the
same `jwt.decode` flaw in the CSV export handler.

**B. Passwords were stored in plain text.** The seed saved raw passwords and login compared raw
strings. I now hash passwords with bcrypt in `seed.ts` and verify them with `bcrypt.compareSync`
at login. The database now stores `$2b$...` hashes, never the real password.

**C. The API leaked passwords.** `GET /users` did `SELECT *`, sending the password column to the
browser. I changed it to select only `id, email, name, role`.

**How I verified it (manual API tests):**
- Login with the correct password returns a token; the response no longer contains a password.
- Login with a wrong password returns 401.
- A token forged with the wrong secret is rejected with 401 (this would have been accepted before).
- A real token from login is accepted with 200.
- Confirmed the stored passwords are bcrypt hashes.

**Note on AI:** the `jwt.decode`-instead-of-`jwt.verify` bug is exactly the kind of thing an AI
agent produces — it looks correct and runs fine on the happy path, but silently disables security.
It is only caught by reading the code, not by running the demo.

## 3. Closed the SQL-injection holes

**What I found:** Many queries were built by gluing user input straight into the SQL string, so a
user could change the query itself. The worst was `POST /feedback/:id/assignment`, which inserted
`priority`, `due_at`, and the URL `id` directly into an `UPDATE`. The list search, metrics date
range, CSV export filters, and the notes lookup had the same flaw.

**What I changed:** Rewrote every one of these to use parameterized queries (`?` placeholders with
values passed separately), which `better-sqlite3` already supports. User input is now always
treated as data, never as SQL. I also removed a line that logged the user's auth token on error.

**How I verified it:**
- A normal search still returns the right rows.
- `q=' OR '1'='1` now returns 0 rows (treated as literal text) instead of dumping everything.
- A `'; DROP TABLE feedback; --` search returns HTTP 200 and the `feedback` table still has all
  80 rows — the attack does nothing.
- The assignment update still saves owner, priority, and due date correctly.

**Left for later (noted in KNOWN-ISSUES):** input *validation* (e.g. rejecting an unknown
`priority` value) is a separate concern from injection and is not done yet.

## 4. Fixed pagination (it was silently hiding data)

**What I found:** Two quiet bugs in `GET /feedback`:
1. The offset was `page * PAGE_SIZE`, but pages are 1-based — so page 1 skipped the first 10 rows.
   The 10 newest feedback items were never visible to anyone.
2. The total count was always `SELECT COUNT(*) FROM feedback` (all 80 rows), ignoring the active
   filter/search. So filtering to "Resolved" or searching still showed "Page 1 of 8" with empty
   pages.

**What I changed:** Used `offset = (page - 1) * PAGE_SIZE`, guarded `page` against missing/negative
values, and made the count query use the same `WHERE` filters as the list query.

**How I verified it:** Page 1 now returns items 1–10 (previously 11–20); page 2 returns 11–20 with
no overlap; filtering to "Resolved" reports a total of 24 (3 pages); searching "Lucas" reports 5
items total. The pager now matches reality.

**Why this matters:** This is the kind of bug a demo never reveals — it looks like it works. You
only catch it by checking the data against what you expect.
