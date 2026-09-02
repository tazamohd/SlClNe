---
name: moc
description: Build or update a Map of Content (hub note) for a topic, organizing all related vault notes into a structured index. Use for "make a MOC", "index my notes on X", or /moc <topic>.
---

# Map of Content

Follow the vault conventions in `CLAUDE.md`. Argument: the topic; if none is
given, ask.

1. Search the whole vault for notes related to the topic: filename matches,
   tag matches, and full-text mentions (Grep). Read the plausible hits enough
   to judge relevance — a passing mention is not membership.
2. If `mocs/<Topic> MOC.md` already exists, update it in place: keep the
   user's manual structure and annotations, add missing notes, flag (don't
   silently remove) links to notes that no longer exist.
3. Otherwise create it:

   ```markdown
   ---
   created: <today>
   tags: [moc]
   ---
   # <Topic> MOC

   <one-paragraph orientation: what this topic covers in this vault>

   ## <subtheme>
   - [[Note]] — one-line description of what it holds
   ...

   ## Loose ends
   - <related notes that didn't fit a subtheme, or gaps worth writing>
   ```

4. Group by subtheme, not alphabetically — the grouping is the value.
   Every listed note gets a one-line annotation.
5. Optionally (mention it, don't do it unasked): the member notes could get a
   `[[<Topic> MOC]]` link added so the graph connects both ways.
6. Reply with the MOC path, how many notes it indexes, and any gaps you
   noticed in the topic's coverage.
