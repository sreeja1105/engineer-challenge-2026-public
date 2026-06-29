# CLAUDE.md — working rules for this repo

These are the rules I gave my AI coding agent while working on the Pulse challenge. They exist to
keep the agent honest and reviewable, because I have to be able to explain and defend every change.

## Mindset

- Treat this code as something I own and will put in front of a paying client.
- Security and correctness come before features and polish.
- Do not gold-plate. Fix the highest-impact issues, verify them, and write down what is left.

## How to work

- Make one focused change at a time, in its own commit, with a clear message.
- After every change, explain in plain language *what* was wrong, *why* it was wrong, and *how* the
  fix addresses it. I need to defend this in an interview.
- **Verify, do not trust.** Every fix must be proven: run the endpoint, test the attack, type-check.
  "The demo still loads" is not verification.
- Prefer the smallest correct change. Do not rewrite working code for style.
- Keep behaviour the same when the task is cosmetic (e.g. CSS) — change look, not logic.

## Specific standards

- Never build SQL by string interpolation. Always use parameterized queries.
- Never store plaintext passwords. Hash with bcrypt.
- Verify JWTs with `jwt.verify`, never `jwt.decode`. Read secrets from the environment.
- Never render untrusted text with `dangerouslySetInnerHTML`. Let React escape it.
- Do not log secrets, tokens, or full request bodies.

## When unsure

- Call out anything that needs a product decision (e.g. who can read private notes) instead of
  guessing.
- If something is risky to fix in the time box, leave it and record it in KNOWN-ISSUES.md.
