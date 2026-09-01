/** Golden-path journeys for the supply chain: procurement, inventory and the
 *  supplier portal.
 *
 *  Five of the twenty-three named paths live here — `Parts procurement`,
 *  `Inventory receiving`, `Inventory consumption`, `Supplier order` and
 *  `Supplier portal`. Each one walks the product as the principal who would
 *  really do that work (the procurement agent raises the requisition, the
 *  storekeeper moves the stock, the supplier reads their own portal) and
 *  asserts the thing that principal came for: a requisition that exists and is
 *  submitted, an on-hand quantity that moved by exactly what was received, an
 *  order that came back with a server-assigned number, the supplier's own
 *  orders on their own screen.
 *
 *  Every assertion here is structural or an invariant — a balance that must
 *  equal the previous balance plus the quantity, a VAT line that must be 15% of
 *  the subtotal, a stat card that must agree with the table under it. None of
 *  them names a fixture row, so the same journey is valid against the design
 *  fixtures, against the seeded API, and against a tenant's real data.
 *
 *  Where the product cannot do a step, the journey fails at that step with the
 *  product's own words for why. It is not trimmed back to the part that works:
 *  `Parts procurement` that stops before the requisition is raised is not
 *  parts procurement, and a green tick on it would be a lie.
 *
 *  Where they stood when they were written, so a later failure can be read
 *  against something. On a fixture build — `npm run build` with no
 *  `VITE_API_URL`, which is what the runner drives — all five fail, four of
 *  them on the same fact: the mock repository holds no procurement records and
 *  refuses the writes, and there is no stock ledger behind the movement
 *  dialogs. Pointed at the API instead (`VITE_API_URL` set, `server` running
 *  and seeded), the first four pass end to end — a requisition is raised and
 *  submitted, stock is received and consumed with the ledger balancing, an
 *  order is raised and comes back numbered. `Supplier portal` fails either
 *  way, and the live failure is the interesting one: the portal reads
 *  `items`, `qty`, `dueDate`, `total` and `workshop` off a purchase order and
 *  `GET /procurement/purchase-orders` presents none of them, so the supplier
 *  is shown rows of blanks — and `/supplier-portal/orders` throws on
 *  `order.total.toLocaleString()` outright.
 */

/* ────────────────────────────────────────────────────────────────── timings */

/** A navigation, including the lazy chunk for the screen. */
const NAV_MS = 20_000
/** A state change inside an already-loaded screen. */
const UI_MS = 10_000

/* ────────────────────────────────────────────────────────────────── helpers */

/** Fail the journey, naming the step and what the product could not do.
 *  The message is the whole value of a failing journey, so it carries the
 *  product's own notice text wherever there is one. */
function fail(step, detail) {
  throw new Error(`step "${step}" — ${detail}`)
}

/** What the screen is showing, trimmed to something readable in a failure. */
async function screenText(page, limit = 700) {
  const text = await page.evaluate(() => {
    const main = document.querySelector('main')
    return (main ?? document.body).innerText
  })
  return text.replace(/\n{2,}/g, ' / ').replace(/\s+/g, ' ').trim().slice(0, limit)
}

/** Open a route and prove the right screen arrived — not that it returned 200.
 *  A redirect is reported as what it is: RBAC sent this principal away. */
async function visit(page, ctx, route, heading, step) {
  await page.goto(ctx.base + route, { waitUntil: 'domcontentloaded' })
  await page
    .waitForFunction(
      () => {
        const main = document.querySelector('main')
        const body = document.body.innerText.trim()
        return body.length > 20 && (!main || main.innerText.trim().length > 20)
      },
      null,
      { timeout: NAV_MS },
    )
    .catch(() => {})

  const landed = new URL(page.url()).pathname
  if (landed !== route) {
    fail(
      step,
      landed.includes('/unauthorized')
        ? `${route} redirected to ${landed}: the "${ctx.role}" role holds no RBAC grant for this screen, so this principal cannot start the journey at all`
        : `${route} redirected to ${landed} for the "${ctx.role}" role`,
    )
  }

  try {
    await page
      .getByRole('heading', { name: heading })
      .first()
      .waitFor({ state: 'visible', timeout: UI_MS })
  } catch {
    fail(step, `${route} rendered without its "${heading}" heading. Screen shows: ${await screenText(page)}`)
  }
}

/** Wait for a condition the journey actually needs, and report the screen when
 *  it never arrives. Never a fixed sleep — the point of a journey is that it
 *  waits for the product, not for the clock. */
async function until(page, fn, arg, step, what) {
  try {
    await page.waitForFunction(fn, arg, { timeout: UI_MS })
  } catch {
    fail(step, `${what}. Screen shows: ${await screenText(page)}`)
  }
}

/** The number a stat card / hero tile shows for a label, whichever side of the
 *  label it sits on (the operational cards put the value after, the portal's
 *  `<dd>`/`<dt>` pair puts it before). */
async function figure(page, label) {
  return page.evaluate((wanted) => {
    const nodes = Array.from(document.querySelectorAll('p, dt, dd, span, div, h2, h3'))
    const hit = nodes.find((node) => node.textContent?.trim() === wanted)
    if (!hit) return null
    let box = hit.parentElement
    for (let up = 0; up < 3 && box; up += 1) {
      const rest = box.innerText.split('\n').map((line) => line.trim()).filter((line) => line && line !== wanted)
      for (const line of rest) {
        const match = line.match(/^-?[\d,]+(?:\.\d+)?$/)
        if (match) return Number(match[0].replace(/,/g, ''))
      }
      box = box.parentElement
    }
    return null
  }, label)
}

/** One `Figure` inside a dialog — `<span>label</span><span>value</span>`.
 *  Returns null for the em-dash the product shows for "not recorded", which is
 *  deliberately not zero. */
async function figureIn(scope, label) {
  return scope.evaluate((root, wanted) => {
    const spans = Array.from(root.querySelectorAll('span'))
    const hit = spans.find((span) => span.textContent?.trim() === wanted)
    const value = hit?.nextElementSibling?.textContent?.trim()
    if (!value || value === '—') return null
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }, label)
}

/** A SAR amount printed under a label on its own line (the order totals card). */
async function amountAfter(page, label) {
  return page.evaluate((wanted) => {
    const lines = document.body.innerText.split('\n').map((line) => line.trim())
    const at = lines.findIndex((line) => line === wanted)
    if (at < 0) return null
    for (let k = at + 1; k < Math.min(lines.length, at + 4); k += 1) {
      const match = lines[k].match(/-?[\d,]+\.\d\d/)
      if (match) return Number(match[0].replace(/,/g, ''))
    }
    return null
  }, label)
}

/** The dialog on top of the stack. Movement and line dialogs open over the
 *  ledger dialog, so "the dialog" is always the last one. */
function topDialog(page) {
  return page.getByRole('dialog').last()
}

/** Rows that carry data. An empty or loading `DataTable` still renders a
 *  `<tr>` — one cell spanning the table with the empty state in it — so
 *  counting `tbody tr` would count "nothing here" as one row. */
const DATA_ROW = 'tbody tr:not(:has(td[colspan]))'

/** A run-unique token, so a journey can find the record it just created
 *  without asserting on any value the fixtures happen to carry. */
function token(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

/* ═══════════════════════════════════════════════════════════════ journeys */

export default [
  /* ───────────────────────────────────────────────────── Parts procurement */
  {
    id: 'parts-procurement',
    path: 'Parts procurement',
    role: 'procurement',
    surfaces: ['app'],
    /** A procurement agent sees a part below its reorder point and raises a
     *  requisition for it, then submits that requisition for approval.
     *
     *  The agent cannot also approve it — requisition approval is a
     *  segregation-of-duties pair with submission (`requireDifferentApprover`
     *  in `server/src/routes/procurement.ts`), so the path ends where this
     *  principal's authority ends: a submitted requisition waiting on a second
     *  pair of eyes. */
    async run(page, ctx) {
      /* 1 — the demand. Stock at or below the reorder point is what procurement
       *     acts on, and the alert count must agree with the alert table: a
       *     headline number that disagrees with its own list is the defect this
       *     project exists to catch. */
      await visit(page, ctx, '/inventory', 'Inventory & Parts Management', 'see what needs procuring')
      const alerts = await figure(page, 'Low Stock Alerts')
      await ctx.expect(
        typeof alerts === 'number',
        'the inventory screen must state how many parts are below their reorder point',
      )
      await page.getByRole('tab', { name: 'Alerts' }).click()
      await until(
        page,
        (expected) => document.querySelectorAll('tbody tr:not(:has(td[colspan]))').length === expected,
        alerts,
        'see what needs procuring',
        `the Alerts tab must list the ${alerts} parts the summary counts`,
      )

      /* 2 — the requisitions desk. */
      await visit(page, ctx, '/procurement-portal/requisitions', 'Requisitions', 'open the requisitions desk')
      const raise = page.getByRole('button', { name: 'New Requisition' })
      if (!(await raise.count())) {
        fail(
          'raise a requisition',
          `no "New Requisition" action for the "${ctx.role}" role. Screen shows: ${await screenText(page)}`,
        )
      }

      /* 3 — raise it. A build that cannot carry the write answers this click
       *     with a status dialog instead of the form; that is the honest state
       *     of the product and it fails the journey here. */
      await raise.click()
      await topDialog(page).waitFor({ state: 'visible', timeout: UI_MS })
      const dialog = topDialog(page)
      const title = (await dialog.locator('h2').first().innerText()).trim()
      if (title !== 'New Requisition') {
        fail(
          'raise a requisition',
          `"New Requisition" opened "${title}" instead of the requisition form. ` +
            `The product says: ${(await dialog.innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)} ` +
            `— POST /procurement/requisitions is not reachable from this build, so a requisition cannot be raised through the UI`,
        )
      }

      const requester = `Riyadh Main · Inventory ${token('REQ')}`
      await dialog.getByLabel('Requested by (branch · department)').fill(requester)
      await dialog.getByLabel('Priority').selectOption({ label: 'High' })
      await dialog.getByLabel('Description').first().fill('Brake pads — below reorder point')
      await dialog.getByLabel('Qty').first().fill('12')
      await dialog.getByLabel('Est. Unit SAR').first().fill('310.00')
      await dialog.getByRole('button', { name: 'Create Requisition' }).click()
      await until(
        page,
        () => !document.querySelector('[role="dialog"]'),
        null,
        'raise a requisition',
        'the requisition form stayed open after Create Requisition, so nothing was saved',
      )

      /* 4 — it exists, as a draft, and it is this run's requisition. */
      await page.getByRole('radio', { name: /^Draft/ }).click()
      await page.getByLabel('Search requisitions').fill(requester)
      await until(
        page,
        (needle) =>
          Array.from(document.querySelectorAll('tbody tr:not(:has(td[colspan]))')).filter((row) =>
            row.innerText.includes(needle),
          ).length === 1,
        requester,
        'find the raised requisition',
        `the requisition raised as "${requester}" is not in the Draft list, so the create did not persist`,
      )

      /* 5 — submit it for approval, and prove it moved out of Draft into the
       *     submitted queue. The status is the whole point: a requisition
       *     nobody can approve has not been procured. */
      await page
        .locator(DATA_ROW)
        .filter({ hasText: requester })
        .first()
        .click()
      await topDialog(page).waitFor({ state: 'visible', timeout: UI_MS })
      const detail = topDialog(page)
      const submit = detail.getByRole('button', { name: 'Submit' })
      if (!(await submit.count())) {
        fail(
          'submit the requisition for approval',
          `the requisition detail offers no Submit action. Dialog shows: ${(await detail.innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)}`,
        )
      }
      await submit.click()
      // The confirmation dialog for the transition, then the list refresh.
      await topDialog(page).getByRole('button', { name: 'Submit' }).last().click()
      await until(
        page,
        () => !document.querySelector('[role="dialog"]'),
        null,
        'submit the requisition for approval',
        'the requisition detail stayed open after Submit, so the transition did not land',
      )
      await page.getByRole('radio', { name: /^Pending/ }).click()
      await until(
        page,
        (needle) =>
          Array.from(document.querySelectorAll('tbody tr:not(:has(td[colspan]))')).some((row) => row.innerText.includes(needle)),
        requester,
        'submit the requisition for approval',
        `"${requester}" is not in the Pending queue after Submit, so it is not waiting on an approver`,
      )
    },
  },

  /* ──────────────────────────────────────────────────── Inventory receiving */
  {
    id: 'inventory-receiving',
    path: 'Inventory receiving',
    role: 'parts',
    surfaces: ['app'],
    /** The storekeeper books a delivery against a part and the shelf figure
     *  moves by exactly what was received.
     *
     *  On-hand is never written directly — it is the consequence of the
     *  movement ledger — so the assertion is the ledger invariant: the new
     *  on-hand is the old on-hand plus the received quantity, and the movement
     *  that produced it is on the part's history with that balance. */
    async run(page, ctx) {
      const RECEIVED = 6

      await visit(page, ctx, '/inventory', 'Inventory & Parts Management', 'open the stock list')

      /* Receiving starts where the shortage is: the Alerts tab offers a
       * Receive action per part below its reorder point. With nothing short,
       * any part on the overview can be received against. */
      await page.getByRole('tab', { name: 'Alerts' }).click()
      const receiveAction = page.getByRole('button', { name: 'Receive' })
      if (await receiveAction.count()) {
        await receiveAction.first().click()
      } else {
        await page.getByRole('tab', { name: 'Overview' }).click()
        await until(
          page,
          () => document.querySelectorAll('tbody tr:not(:has(td[colspan]))').length > 0,
          null,
          'open a part to receive against',
          'the inventory list holds no parts, so there is nothing to receive',
        )
        await page.locator(DATA_ROW).first().click()
      }

      await topDialog(page).waitFor({ state: 'visible', timeout: UI_MS })
      const ledger = topDialog(page)
      const before = await figureIn(ledger, 'On Hand')
      await ctx.expect(typeof before === 'number', "the part ledger must show the part's on-hand quantity")

      /* The receive action. A build with no ledger behind it says so here
       * instead of offering a form that could not save. */
      const receive = ledger.getByRole('button', { name: 'Receive Stock' })
      if (!(await receive.count())) {
        fail(
          'record the receipt',
          `the part ledger offers no "Receive Stock" action. The product says: ` +
            `${(await ledger.innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)} ` +
            `— POST /inventory/:id/movement is not reachable from this build, so received stock cannot be booked`,
        )
      }
      await receive.click()
      await until(
        page,
        () => document.querySelectorAll('[role="dialog"]').length > 1,
        null,
        'record the receipt',
        'the Receive Stock dialog did not open',
      )

      const form = topDialog(page)
      await form.getByLabel('Quantity Received').fill(String(RECEIVED))
      /* The dialog projects the result before it is committed; the projection
       * and the ledger must agree, or the user is being shown a number the
       * server will not produce. */
      const projected = await figureIn(form, 'After This Movement')
      await ctx.expect(
        projected === before + RECEIVED,
        `receiving ${RECEIVED} must project ${before + RECEIVED} on hand, the dialog projects ${projected}`,
      )
      await form.getByLabel('Purchase Order / Delivery Note').fill(token('GRN'))
      await form.getByRole('button', { name: 'Receive Stock' }).click()

      /* The invariant: on-hand rose by exactly the quantity received, and the
       * movement that did it is on the history with that balance behind it. */
      await until(
        page,
        (expected) => {
          const dialogs = document.querySelectorAll('[role="dialog"]')
          if (dialogs.length !== 1) return false
          const spans = Array.from(dialogs[0].querySelectorAll('span'))
          const hit = spans.find((span) => span.textContent?.trim() === 'On Hand')
          return Number(hit?.nextElementSibling?.textContent?.trim()) === expected
        },
        before + RECEIVED,
        'record the receipt',
        `on hand did not settle at ${before + RECEIVED} after receiving ${RECEIVED} against ${before}`,
      )
      await until(
        page,
        (expected) =>
          Array.from(document.querySelectorAll('[role="dialog"] tbody tr:not(:has(td[colspan]))')).some(
            (row) => /Receiv/i.test(row.innerText) && row.innerText.includes(String(expected)),
          ),
        before + RECEIVED,
        'record the receipt',
        `no receiving movement showing a balance of ${before + RECEIVED} on the part's history`,
      )
    },
  },

  /* ────────────────────────────────────────────────── Inventory consumption */
  {
    id: 'inventory-consumption',
    path: 'Inventory consumption',
    role: 'parts',
    surfaces: ['app'],
    /** The storekeeper issues stock to a job card, and the shelf falls by what
     *  was issued.
     *
     *  Two things are asserted, because consumption has two halves that both
     *  have to hold: stock may not be taken that is not there (the product
     *  refuses an over-issue rather than letting the server 4xx after the
     *  fact), and a legitimate issue lands as an `out` movement that lowers
     *  on-hand by exactly its quantity. */
    async run(page, ctx) {
      await visit(page, ctx, '/inventory', 'Inventory & Parts Management', 'open the stock list')
      await until(
        page,
        () => document.querySelectorAll('tbody tr:not(:has(td[colspan]))').length > 0,
        null,
        'open a part to issue from',
        'the inventory list holds no parts, so there is nothing to consume',
      )
      await page.locator(DATA_ROW).first().click()
      await topDialog(page).waitFor({ state: 'visible', timeout: UI_MS })

      const ledger = topDialog(page)
      const before = await figureIn(ledger, 'On Hand')
      const available = (await figureIn(ledger, 'Available')) ?? before
      await ctx.expect(typeof before === 'number', "the part ledger must show the part's on-hand quantity")
      await ctx.expect(
        available <= before,
        `available (${available}) may never exceed on hand (${before}) — a reservation holds stock, it does not create it`,
      )

      const consumeAction = ledger.getByRole('button', { name: 'Consume' })
      if (!(await consumeAction.count())) {
        fail(
          'issue stock to a job',
          `the part ledger offers no "Consume" action. The product says: ` +
            `${(await ledger.innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)} ` +
            `— POST /inventory/:id/movement is not reachable from this build, so stock cannot be issued`,
        )
      }
      await consumeAction.click()
      await until(
        page,
        () => document.querySelectorAll('[role="dialog"]').length > 1,
        null,
        'issue stock to a job',
        'the Consume Stock dialog did not open',
      )

      const form = topDialog(page)

      /* Half one: an issue larger than what is on the shelf must be refused on
       * the form. A screen that let it through would be asking the server to
       * take stock negative. */
      await form.getByLabel('Quantity Consumed').fill(String(available + 1))
      await form.getByRole('button', { name: 'Consume' }).click()
      await until(
        page,
        () => document.querySelectorAll('[role="dialog"]').length > 1,
        null,
        'issue stock to a job',
        `consuming ${available + 1} units of ${available} available was accepted — the product let stock go negative`,
      )

      /* Half two: a legitimate issue lands, and on-hand falls by exactly it. */
      const ISSUED = 1
      await form.getByLabel('Quantity Consumed').fill(String(ISSUED))
      await form.getByLabel('Job Card').fill(token('JOB'))
      await form.getByRole('button', { name: 'Consume' }).click()
      await until(
        page,
        (expected) => {
          const dialogs = document.querySelectorAll('[role="dialog"]')
          if (dialogs.length !== 1) return false
          const spans = Array.from(dialogs[0].querySelectorAll('span'))
          const hit = spans.find((span) => span.textContent?.trim() === 'On Hand')
          return Number(hit?.nextElementSibling?.textContent?.trim()) === expected
        },
        before - ISSUED,
        'issue stock to a job',
        `on hand did not settle at ${before - ISSUED} after issuing ${ISSUED} from ${before}`,
      )
      await until(
        page,
        (expected) =>
          Array.from(document.querySelectorAll('[role="dialog"] tbody tr:not(:has(td[colspan]))')).some(
            (row) => /Consum/i.test(row.innerText) && row.innerText.includes(String(expected)),
          ),
        before - ISSUED,
        'issue stock to a job',
        `no consumption movement showing a balance of ${before - ISSUED} on the part's history`,
      )
    },
  },

  /* ────────────────────────────────────────────────────────── Supplier order */
  {
    id: 'supplier-order',
    path: 'Supplier order',
    role: 'procurement',
    surfaces: ['app'],
    /** The procurement agent turns a shortage into an order placed with a
     *  supplier, and the order comes back with a number the server assigned.
     *
     *  The money is asserted as an invariant rather than as a figure: VAT is
     *  15% of the subtotal and the total is their sum, whatever the lines are.
     *  The order number is asserted to exist and to be the server's — the
     *  screen deliberately refuses to invent one. */
    async run(page, ctx) {
      await visit(page, ctx, '/purchase-order', 'Create Purchase Order', 'open the order pad')

      /* 1 — a line. The stock-alert list orders a short part directly; with
       *     nothing short, the catalogue does the same job. */
      const orderShort = page.getByRole('button', { name: 'Order', exact: true })
      if (await orderShort.count()) {
        await orderShort.first().click()
      } else {
        await page.getByRole('button', { name: 'Add Item' }).first().click()
        await topDialog(page).waitFor({ state: 'visible', timeout: UI_MS })
        const line = topDialog(page)
        await line.getByLabel('Description').fill('Brake pads — reorder')
        await line.getByLabel('Order Qty').fill('10')
        await line.getByLabel('Unit Cost').fill('310.00')
        await line.getByRole('button', { name: 'Add Item' }).click()
      }
      await until(
        page,
        () => document.querySelectorAll('tbody tr:not(:has(td[colspan]))').length > 0,
        null,
        'put a part on the order',
        'the order has no line items after ordering a part',
      )

      /* 2 — the money the screen shows must hold together. */
      const subtotal = await amountAfter(page, 'Subtotal')
      const vat = await amountAfter(page, 'VAT (15%)')
      const total = await amountAfter(page, 'Total')
      await ctx.expect(subtotal > 0, 'an order with a line must have a subtotal above zero')
      await ctx.expect(
        Math.abs(vat - Math.round(subtotal * 15) / 100) < 0.02,
        `VAT must be 15% of the ${subtotal} subtotal; the screen shows ${vat}`,
      )
      await ctx.expect(
        Math.abs(total - (subtotal + vat)) < 0.02,
        `the order total must be subtotal + VAT (${subtotal} + ${vat}); the screen shows ${total}`,
      )

      /* 3 — the supplier. An order with nobody to send it to is not an order. */
      const supplier = page.getByLabel('Supplier', { exact: true })
      if (await supplier.isDisabled()) {
        fail(
          'choose the supplier',
          `the supplier picker is disabled. The product says: ${await screenText(page, 400)} ` +
            `— GET /procurement/suppliers is not reachable from this build, so no supplier can be named on the order`,
        )
      }
      const choices = (await supplier.locator('option').count()) - 1
      if (choices < 1) {
        fail(
          'choose the supplier',
          'the supplier picker offers no supplier to order from, so the order cannot be addressed',
        )
      }
      await supplier.selectOption({ index: 1 })

      const due = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)
      await page.getByLabel('Expected Delivery').fill(due)

      /* 4 — raise it. */
      const raise = page.getByRole('button', { name: 'Raise Order' })
      if (await raise.isDisabled()) {
        fail(
          'raise the order',
          `the "Raise Order" action is disabled. The product says: ${await screenText(page, 400)} ` +
            `— POST /procurement/purchase-orders is not reachable from this build, so an order cannot be placed`,
        )
      }
      await raise.click()

      /* 5 — the order exists and carries a server-assigned number. The screen
       *     clears the pad on success, and the raised order shows up in the
       *     approval and receiving list below it. */
      await until(
        page,
        () => /\bPO-[A-Za-z0-9-]+/.test(document.body.innerText),
        null,
        'raise the order',
        'no server-assigned purchase-order number appeared after raising the order',
      )
      await until(
        page,
        () => {
          const text = document.body.innerText
          const at = text.indexOf('Approval & Receiving')
          return at >= 0 && /\bPO-[A-Za-z0-9-]+/.test(text.slice(at))
        },
        null,
        'raise the order',
        'the raised order is not listed under Approval & Receiving, so it is not waiting on an approver',
      )
    },
  },

  /* ────────────────────────────────────────────────────────── Supplier portal */
  {
    id: 'supplier-portal',
    path: 'Supplier portal',
    role: 'supplier',
    surfaces: ['portal'],
    /** A supplier signs in to their own portal and works their order book.
     *
     *  The role is `supplier` and stays `supplier`: the whole question this
     *  path answers is whether the person outside the workshop can see the
     *  orders addressed to them, and signing in as a member of staff to make
     *  the screen light up would answer a different question.
     *
     *  What the supplier came for is their orders. The headline count must
     *  agree with the table under it, the order list must hold at least the
     *  supplier's own orders, and filtering by a status must actually narrow
     *  the table to that status. */
    async run(page, ctx) {
      /* Anything the portal throws is part of the finding — a portal that
       * white-screens on its own data is a different failure from an empty
       * one, and the message says which. */
      const crashes = []
      page.on('pageerror', (error) => crashes.push(error.message))

      await visit(page, ctx, '/supplier-portal', 'Active Orders', 'open the supplier portal')
      await ctx.expect(
        (await page.locator('aside').count()) === 0,
        'the supplier portal must not render the operational sidebar — a supplier is not staff',
      )

      const failedLoad = await page.getByText("Something didn't load", { exact: false }).count()
      if (failedLoad) {
        fail(
          'read the order book',
          `the portal could not load its orders: ${await screenText(page, 400)}` +
            ` — the portal reads the staff \`purchaseOrders\`/\`suppliers\` collections, which are gated on the \`procurement\` module`,
        )
      }

      const active = await figure(page, 'Active Orders')
      await ctx.expect(typeof active === 'number', 'the portal must state how many active orders the supplier has')
      const listed = await page.locator(DATA_ROW).count()
      await ctx.expect(
        listed === Math.min(active, 10),
        `the Active Orders tile says ${active} but the table under it lists ${listed}`,
      )
      if (active === 0) {
        fail(
          'read the order book',
          `the supplier's portal shows no purchase orders at all${
            crashes.length ? ` (page errors: ${crashes.join('; ')})` : ''
          }. The portal reads the \`purchaseOrders\` collection through the repository seam; this build serves it no rows, ` +
            `so a supplier signing in has nothing to work — the path cannot be walked`,
        )
      }

      /* An order number on its own is not an order book. The supplier came to
       * find out what to supply and when, so a listed order has to fill the
       * columns the table promises — a row of blanks is a screen that found
       * rows it cannot read. */
      const hollow = await page.evaluate(() => {
        const table = document.querySelector('table')
        if (!table) return null
        const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.innerText.trim())
        for (const row of Array.from(table.querySelectorAll('tbody tr:not(:has(td[colspan]))'))) {
          const blanks = Array.from(row.querySelectorAll('td'))
            .map((cell, at) => (cell.innerText.trim() ? null : headers[at] ?? `column ${at + 1}`))
            .filter(Boolean)
          if (blanks.length > 1) return { order: row.querySelector('td')?.innerText.trim(), blanks }
        }
        return null
      })
      if (hollow) {
        fail(
          'read the order book',
          `order ${hollow.order} is listed with empty ${hollow.blanks.join(', ')} — ` +
            `the portal reads \`items\`, \`qty\`, \`dueDate\`, \`total\` and \`workshop\` off a purchase order, ` +
            `and the rows it is given carry none of those fields, so the supplier is shown an order they cannot act on`,
        )
      }

      /* The order-management screen: the supplier's own orders, and a status
       * filter that filters. */
      await visit(page, ctx, '/supplier-portal/orders', 'Orders', 'open the supplier order list')
      const all = await page.locator(DATA_ROW).count()
      await ctx.expect(all > 0, "the supplier's order list is empty, so there is no order book to manage")

      await page.getByRole('button', { name: 'Delivered', exact: true }).click()
      await until(
        page,
        () => {
          const rows = Array.from(document.querySelectorAll('tbody tr:not(:has(td[colspan]))'))
          return rows.length > 0 && rows.every((row) => /delivered/i.test(row.innerText))
        },
        null,
        'filter the order book',
        'filtering by Delivered did not narrow the table to delivered orders',
      )
      await ctx.expect(
        crashes.length === 0,
        `the supplier portal raised page errors while rendering the supplier's own orders: ${crashes.join('; ')}`,
      )
    },
  },
]
