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
