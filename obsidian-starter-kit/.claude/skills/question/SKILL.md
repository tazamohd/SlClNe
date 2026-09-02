---
name: question
description: Answer a question strictly from the vault's own notes, citing every claim with wikilinks. Use for "what did I say about X", "according to my notes...", or /question <question>.
---

# Ask the vault

Follow the vault conventions in `CLAUDE.md`. Argument: the question; if none
is given, ask.

1. Search the vault thoroughly for relevant notes: filename, tags, and
   full-text (try synonyms and related terms, not just the literal words).
   Read the promising hits in full — including daily notes, which often hold
   the actual decisions.
2. Answer **only from what the notes say**. This is the whole point of the
   skill: general knowledge may be used to interpret the notes, never to
   fill gaps in them. If the vault doesn't cover something, say exactly
   that: "your notes don't address X".
3. Cite as you go — every claim gets the note it came from as a wikilink,
   with the date when the source is a daily note. Where notes contradict
   each other (an early take vs. a later conclusion), present both with
   dates rather than silently picking one.
4. Format: a direct answer first (2-5 sentences), then "Sources" listing
   each cited note with a phrase on what it contributed, then optionally
   "Gaps" — what the user might want to capture since the vault is thin on it.
5. This skill never edits any note. If the answer seems worth keeping,
   offer to save it as a reference note as a follow-up.
