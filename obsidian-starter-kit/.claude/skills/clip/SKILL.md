---
name: clip
description: Turn a URL into a summarized reference note with source frontmatter and links to related vault notes. Use for "clip this", "save this article", or /clip <url>.
---

# Web clipper

Follow the vault conventions in `CLAUDE.md`. Argument: one or more URLs; if
none is given, ask.

1. Fetch the page. If it can't be fetched (paywall, blocked), say so and
   offer to build the note from pasted text instead.
2. Create `reference/<descriptive title>.md`. Article titles routinely
   contain characters CLAUDE.md's filename rule forbids (a colon in
   "Title: Subtitle" is the most common) — strip or replace them in the
   filename only; keep the real title as the note's H1 and frontmatter.
   If `reference/<title>.md` already exists, don't overwrite it — check
   whether it's the same source (update instead) or a genuine name
   collision (disambiguate the filename).

   ```markdown
   ---
   created: <today>
   tags: [type/reference, clip]
   source: <url>
   author: <if identifiable>
   published: <if identifiable>
   ---
   # <Title>

   ## Summary
   <3-6 sentences: what the piece argues or explains, in plain terms>

   ## Key points
   <bulleted, each one self-contained — a reader shouldn't need the source>

   ## Notable quotes
   <0-3 short verbatim quotes worth keeping, in > blockquotes>

   ## Related
   <wikilinks to existing vault notes this connects to, with a phrase on why>
   ```

3. Summarize in the user's interest, not the article's structure — lead with
   what matters for this vault's topics. Search the vault for related notes
   before writing the Related section; only link notes that exist.
4. Keep quotes short (fair-use length); never paste the full article body.
5. Reply with the note path and the one-line gist.
