# Product Note

*If Pulse were a real client product and I had two weeks, here is what I would build and what I
would cut. This is a product call, not an engineering one.*

## What Pulse is for

Pulse helps a small support team stay on top of incoming customer feedback: see it, route it,
resolve it, and understand it. The job to be done is **"nothing important slips through the
cracks, and the team knows what to act on first."** Everything should serve that.

## What I would build (in priority order)

1. **Make the queue trustworthy and actionable.** Today an agent sees a flat list. I would add
   reliable filtering and sorting by priority, due date, and assignee, plus a clear "this is yours
   / this is overdue" view. The data already exists; the value is in surfacing it well. This is the
   core of the product and where I would spend most of the two weeks.

2. **Close the loop with the customer.** Right now you can resolve an item internally, but nothing
   goes back to the customer. The most valuable next feature is replying from inside Pulse (even a
   simple templated response), so feedback becomes a real conversation, not a private to-do list.

3. **Make the AI summary genuinely useful.** The summarize button is a nice hook but thin. I would
   point it at the *whole thread and customer history*, not a single message, and have it suggest a
   category and a draft reply. That turns AI from a gimmick into time saved per ticket — which is
   the actual pitch.

4. **Lightweight reporting for managers.** The metrics strip is a start. A manager wants "how fast
   are we resolving things, where are we behind, which customers are unhappy." A small trends view
   would make Pulse something a team lead opens daily.

## What I would cut or defer

- **CSV export** as a headline feature. It is a useful escape hatch, but if reporting lives in the
  product (point 4), most users will not need raw exports. Keep it, do not invest in it.
- **Health score** and other customer-profile fields that are shown but not acted on. Either wire
  them into prioritization (a low health score should raise urgency) or hide them. Decorative data
  erodes trust.
- **Per-pixel UI polish** beyond the clean baseline. Clean and clear beats branded and clever for
  an internal tool; I would not spend the two weeks on visual design.

## The one bet

If I could only ship one thing, it would be **replying to the customer from inside Pulse**. An
inbox you cannot respond from is just a list. Everything else (better routing, AI drafts, reporting)
compounds once feedback becomes a two-way conversation.
