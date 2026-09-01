# Golden-path journeys

A golden path is an end-to-end user journey through the product. There are 23 of
them, named in `project-control/tracker/plan-structure.json`.

Until now their status was `ov.gp` in the command deck — **a checkbox in one
person's browser localStorage**. `0/23` was not a measurement, it was an empty
checkbox list, and it could never move for any reason connected to the product.
That is the same defect as a flag that fires on all 424 entries: a number that
describes the tool rather than the thing.

These modules replace it. A journey is code that walks the product and asserts
what the user should see; the runner executes them and writes the result, and
the registry and deck read that result.

## The contract

Each module default-exports an array of journey objects:

```js
export default [
  {
    id: 'new-customer-to-paid-invoice',   // stable slug, kebab-case
    path: 'New customer to paid invoice', // must match plan-structure.json verbatim
    /** Run the journey. Throw to fail it; return normally to pass.
     *  @param {import('playwright').Page} page  a fresh page, already signed in as `role`
     *  @param {object} ctx  { base, role, expect(cond, message) }
     */
    async run(page, ctx) {
      await page.goto(ctx.base + '/customers')
      await ctx.expect(await page.getByRole('heading').count() > 0, 'customers heading')
    },
    role: 'owner',        // which principal to sign in as
    surfaces: ['app'],    // where it runs; informational
  },
]
```

Rules, so a green run means something:

- **Assert content, never just a 200.** "The route rendered" is the floor the
  smoke suite already covers. A journey must assert the thing the user came for.
- **A journey that cannot complete must fail, not be skipped.** If the product
  cannot yet do the step, the journey fails and the path reads NOT PASSING. That
  is the honest state and it is the whole point of measuring.
- **Never assert on fixture-specific values** (a particular customer name, a
  particular total). Assert on structure and on invariants the product must
  hold whatever the data is.
- **No `page.waitForTimeout` as a synchronisation primitive.** Wait for the
  condition you actually need.

## Status vocabulary

The runner classifies each of the 23 named paths:

| status | meaning |
|---|---|
| `PASSING` | a journey exists for this path and it passed on this run |
| `FAILING` | a journey exists and it failed — the product cannot do this today |
| `UNWRITTEN` | no journey has been written for this path yet |

`UNWRITTEN` is deliberately distinct from `FAILING`. "Nobody has checked" and
"we checked and it does not work" are different facts, and collapsing them is
how the old checkbox managed to say nothing at all.
