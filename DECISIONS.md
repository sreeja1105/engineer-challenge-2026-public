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
