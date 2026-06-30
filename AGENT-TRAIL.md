# Agent Trail

How I actually used an AI agent (Claude Code) on this challenge. This is an AI-native role, so this
is my real workflow, not a hand-coded performance. The rules I gave the agent are in CLAUDE.md.

## How I drove it

I worked in a tight loop, one issue at a time:

1. **Read first.** I had the agent read the whole codebase and list what looked wrong, then I
   decided the priority order myself (security → correctness → polish). I did not let it start
   fixing things before I understood the shape of the problem.
2. **One fix per step.** For each issue I asked for a focused change, an explanation in plain
   language, and a way to prove it worked.
3. **I reviewed every change** before committing, and asked the agent to verify each fix (run the
   endpoint, attempt the attack, type-check) rather than trusting that it "looked right".
4. **One commit per fix**, with a clear message, so the history reads as a story.

## Representative prompts I used

- "Read this repo like you'll own it and list what's wrong, worst first. Don't fix anything yet."
- "Explain why `jwt.decode` here is a security problem, then fix the auth properly and prove a
  forged token is now rejected."
- "Replace the styling with a clean, neutral, professional look but keep all class names so nothing
  breaks."
- "Find every place SQL is built from user input and convert it to parameterized queries. Then run
  an injection attempt and show it fails."
- "The pager shows the wrong page count when filtering — find out why and fix the offset and the
  count."
- "Are there any places untrusted text is rendered as HTML? Remove that."
- "Type-check the server and web before we commit."

## The most important catch

The auth middleware in the existing code used `jwt.decode()` instead of `jwt.verify()`. Decode only
reads a token, it never checks the signature, so any forged token was accepted. The demo runs fine,
which is why it was never caught.

When I asked the agent to fix it, its first proposal was to wrap the existing `jwt.decode` call in a
try/catch to handle malformed tokens. That makes the code look safer but leaves the auth bypass
intact. I overruled and asked for `jwt.verify` with a guarded `JWT_SECRET` from the environment,
then verified by forging a token with the wrong secret and confirming the API returns 401.

This is the clearest example of the point of the role: review what the agent produces, do not paste
it blind.

## Where the agent helped vs. where I overruled it

- **Helped:** moving fast on mechanical, repetitive changes (parameterizing many queries, rewriting
  the entire stylesheet, drafting the writeups).
- **I directed/overruled:** the *priority order* (what to fix and what to skip in the time box), and
  insisting on verification for each change. A type-check at the end caught a possibly-undefined
  secret that runtime testing had missed — a reminder that "it ran" is not "it's correct".
- **I overruled on scope:** when the agent proposed refactoring serializeFeedback to fix the N+1
  queries (a real perf issue with a clean JOIN-based rewrite), I declined and moved it to
  KNOWN-ISSUES. N+1 on 80 seed rows is a perf concern, not a correctness one, and the three hours
  were better spent on auth and SQL injection. The agent was right that the fix was possible, I was
  right that it was not the priority.

## Full transcript

The complete chat transcript / prompt history is available on request and accompanies this
submission.
