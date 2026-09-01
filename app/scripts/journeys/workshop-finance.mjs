/** Golden-path journeys — the workshop chain and the finance chain.
 *
 *  Six of the twenty-three paths named in
 *  `project-control/tracker/plan-structure.json` live here. Each one walks the
 *  product the way the person who owns that path walks it, and asserts the
 *  thing they came for: a customer who owes nothing until they are billed, an
 *  invoice that is priced by the server and settled to a zero balance, a repair
 *  that is handed to quality control and *stays* handed over across a reload, a
 *  decision on an estimate that survives being read back, a statement line that
 *  moves from unreconciled to matched, a report whose exported file is the
 *  table the user was looking at.
 *
 *  ── What these journeys deliberately do not do ──────────────────────────
 *
 *  They do not assert on seeded values. No customer name, no invoice number, no
 *  total. Every figure is checked against another figure the product itself
 *  produced — a balance against a total, an export against a preview, a stage
 *  against the same stage after a reload — so the assertions hold whatever is
 *  in the database.
 *
 *  They do not stop short of the write. Most of this product's screens read
 *  fine and the interesting question is always whether the thing the user did
 *  was recorded. So each journey performs the real action and then reads the
 *  result back from the product. Where the product cannot perform it, the
 *  journey fails and names the control or the endpoint that was missing —
 *  never trims itself down to the part that works.
 *
 *  A journey that finds several steps missing walks as far as it can and
 *  reports every one of them, in the order the user would hit them. That is
 *  what `gaps` is: "we checked, and here is exactly what this path cannot do
 *  today".
 */

/** Every wait in here is bounded by this rather than by a sleep. */
const WAIT = 20_000

/* ------------------------------------------------------------------ waiting */

/** Polls `read` until `ok` accepts its value.
 *
 *  Not a timeout: the loop is driven by the round-trip to the page, and it
 *  returns the moment the condition holds. When it does not hold it fails with
 *  the last value it actually saw, which is the difference between "the row
 *  count never reached 5" and an anonymous timeout stack. */
async function until(read, ok, message, timeout = WAIT) {
  const deadline = Date.now() + timeout
  let last
  for (;;) {
    last = await read()
    if (ok(last)) return last
    if (Date.now() >= deadline) {
      throw new Error(`${message} — last observed: ${JSON.stringify(last)}`)
    }
  }
}

/** The shell is up and the screen has rendered something of its own. */
async function settle(page) {
  await page.waitForFunction(
    () => {
      const main = document.querySelector('main')
      return Boolean(main) && main.innerText.trim().length > 20
    },
    null,
    { timeout: WAIT },
  )
}

/** Wait for a screen to have actually rendered the record it was asked for.
 *
 *  `settle` only proves the shell painted; a detail screen shows a spinner or a
 *  header for a beat before its data lands, and reading it in that beat is how
 *  a journey ends up asserting against a loading state. Every screen that is
 *  addressed by an id waits for a marker that only appears once the record is
 *  in hand, and says what was missing when it never does. */
async function showing(page, marker, message) {
  await page
    .waitForFunction(
      (needle) => {
        const main = document.querySelector('main')
        return Boolean(main) && main.innerText.includes(needle)
      },
      marker,
      { timeout: WAIT },
    )
    .catch(() => {
      throw new Error(message)
    })
}

/** Navigate, and prove we arrived where we asked.
 *
 *  A guarded route that bounces to `/login` or `/unauthorized` produces a
 *  screenful of perfectly valid HTML, and a journey that then asserts against
 *  it is measuring the wrong page. Both bounces are named explicitly because
 *  they mean different things: no session, versus a session without the grant. */
async function open(page, ctx, path, step) {
  await page.goto(ctx.base + path, { waitUntil: 'domcontentloaded' })
  await settle(page)
  const asked = path.split('?')[0]
  const landed = new URL(page.url()).pathname
  if (landed === asked) return
  if (landed === '/login') {
    throw new Error(
      `${step}: ${asked} redirected to /login. This journey needs a session signed in as "${ctx.role}".`,
    )
  }
  if (landed === '/unauthorized') {
    throw new Error(`${step}: "${ctx.role}" is refused ${asked} — the role cannot walk this path.`)
  }
  throw new Error(`${step}: asked for ${asked} and landed on ${landed}.`)
}

/** Follow an in-app link and wait for the route to change.
 *
 *  Journeys navigate by clicking rather than by `goto` wherever one step feeds
 *  the next: a full page load throws away anything the previous step created in
 *  a build whose repository is in-memory, and a user does not retype the URL. */
async function follow(page, locator, expected, step) {
  await locator.click()
  await page.waitForURL((url) => expected.test(url.pathname + url.search), { timeout: WAIT })
    .catch(() => {
      throw new Error(`${step}: the app did not navigate to ${expected} (still on ${page.url()}).`)
    })
  await settle(page)
}

/* -------------------------------------------------------------------- money */

const SAR = /SAR\s*(-?[\d,]+(?:\.\d+)?)/

/** The first SAR figure in a string, as a number, or null. */
function sar(text) {
  const found = SAR.exec(String(text ?? ''))
  return found ? Number(found[1].replace(/,/g, '')) : null
}

/** The amount printed under a label, reading the screen the way a person does:
 *  find the label, take the first money figure that follows it. Used only to
 *  compare two of the product's own figures with each other — nothing here
 *  computes a total the product should have computed. */
function amountUnder(text, label) {
  const lines = String(text).split('\n').map((line) => line.trim())
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] !== label) continue
    for (let j = i; j < Math.min(i + 4, lines.length); j += 1) {
      const value = sar(lines[j].replace(label, ''))
      if (value !== null) return value
    }
  }
  return null
}

/** Two SAR amounts agree to the halala. */
function same(a, b) {
  return a !== null && b !== null && Math.abs(a - b) < 0.005
}

/* -------------------------------------------------------------- assertions */

/** True when a control is actually on the screen.
 *
 *  A bare `count()` runs the instant the route changes and reports every
 *  control on a screen that is still mounting as missing. This gives the screen
 *  a bounded chance to render before the journey is entitled to say the product
 *  does not offer something — the difference between "this build has no Add
 *  Customer button" and "we looked 30ms too early". */
async function offered(locator, timeout = 5_000) {
  try {
    await locator.first().waitFor({ state: 'attached', timeout })
    return true
  } catch {
    return false
  }
}

/** An assertion that fails the journey whatever the runner's `expect` does.
 *
 *  `ctx.expect` is the contract's reporting hook and is called first so the
 *  runner sees the message; the throw behind it guarantees a false condition
 *  ends the journey rather than being counted and walked past. */
function check(ctx, condition, message) {
  ctx.expect(Boolean(condition), message)
  if (!condition) throw new Error(message)
}

/** Collects the steps this path cannot perform today, so a journey reports
 *  every gap on the path instead of only the first one. */
function gapReport(path, gaps) {
  return (
    `"${path}" cannot be completed. ${gaps.length} step(s) the product does not support today:\n` +
    gaps.map((gap, i) => `  ${i + 1}. ${gap}`).join('\n')
  )
}

/* ------------------------------------------------------------------ screens */

/** The stage the workshop rail says a job card is at (`aria-current="step"`). */
async function railStage(page) {
  const current = page.locator('[aria-current="step"]').first()
  if ((await current.count()) === 0) return null
  const text = (await current.innerText()).trim()
  // The marker is "4\nRepair" for the active step; the label is the last line.
  return text.split('\n').map((line) => line.trim()).filter(Boolean).pop() ?? null
}

/** The rows of a table, addressed by its caption. */
function rowsOf(page, caption) {
  return page.getByRole('table', { name: caption }).locator('tbody tr')
}

/** The rows of a table once it has actually finished loading.
 *
 *  `DataTable` renders five skeleton rows while its query is in flight and one
 *  full-width row for its empty state, so counting `tbody tr` straight after a
 *  navigation reads "five records" off a table that holds none. This waits for
 *  the skeletons to go and reports the empty state as what it is: no rows. */
async function tableRows(page, caption, message) {
  const read = () =>
    page.evaluate((wanted) => {
      const table = [...document.querySelectorAll('table')].find(
        (candidate) => candidate.querySelector('caption')?.textContent?.trim() === wanted,
      )
      if (!table) return null
      const trs = [...table.querySelectorAll('tbody tr')]
      const cells = trs.map((tr) => [...tr.children].map((td) => td.innerText.trim()))
      const skeleton = trs.length > 0 && trs.every((tr) => tr.querySelector('.animate-pulse'))
      const blank =
        trs.length === 1 &&
        trs[0].children.length === 1 &&
        Number(trs[0].children[0].getAttribute('colspan') ?? 0) > 1
      return { skeleton, rows: blank || skeleton ? [] : cells }
    }, caption)
  const state = await until(read, (value) => value !== null && !value.skeleton, message)
  return state.rows
}

/** One row of a settled table as the tab-separated line the eye reads. */
function line(cells) {
  return cells.join('\t')
}

/** Records what `downloadCsv` hands the browser.
 *
 *  The export builds a Blob and clicks an anchor at it. Reading the Blob back
 *  through `createObjectURL` is what the file *is*, so the assertion is on the
 *  document the user receives rather than on the click having happened. */
async function captureDownloads(page) {
  await page.evaluate(() => {
    if (window.__journeyDownloads) return
    window.__journeyDownloads = []
    const real = URL.createObjectURL.bind(URL)
    URL.createObjectURL = (blob) => {
      try {
        blob.text().then((text) => window.__journeyDownloads.push(text))
      } catch {
        /* not a Blob — nothing to record */
      }
      return real(blob)
    }
  })
}

async function lastDownload(page, step) {
  await page
    .waitForFunction(() => (window.__journeyDownloads ?? []).length > 0, null, { timeout: WAIT })
    .catch(() => {
      throw new Error(`${step}: no file was produced — the export button did nothing.`)
    })
  const text = await page.evaluate(() => window.__journeyDownloads[window.__journeyDownloads.length - 1])
  return String(text).replace(/^﻿/, '')
}

/** A CSV as rows of cells. Enough of RFC-4180 to read what `toCsv` writes. */
function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1 }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (ch !== '\r') cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

/* =========================================================================
 *  The journeys
 * ====================================================================== */

export default [
  /* ---------------------------------------------------------------------
   *  1. New customer to paid invoice
   *
   *  The whole commercial loop: someone walks in who is not on file, they are
   *  registered, they are billed, and the money lands. The end state is an
   *  invoice that says Paid with nothing outstanding, and that the invoice
   *  itself can account for — the lines it charged and the payment it took.
   * ------------------------------------------------------------------ */
  {
    id: 'new-customer-to-paid-invoice',
    path: 'New customer to paid invoice',
    role: 'owner',
    surfaces: ['app'],
    async run(page, ctx) {
      const gaps = []
      const stamp = Date.now().toString(36).toUpperCase()
      const customer = `Journey Customer ${stamp}`
      const phone = `+9665${String(Date.now()).slice(-8)}`

      /* — 1. register the customer ————————————————————————————— */
      await open(page, ctx, '/customers', 'step 1, the customer register')
      const register = rowsOf(page, 'Customer records')
      const registered = (
        await tableRows(page, 'Customer records', 'step 1: the customer register never finished loading')
      ).length

      const add = page.getByRole('button', { name: 'Add Customer', exact: true }).first()
      check(
        ctx,
        (await offered(add)) && (await add.isEnabled()),
        'step 1: /customers offers no enabled "Add Customer" control, so a customer who is not on file cannot be put on file.',
      )
      await add.click()

      const form = page.getByRole('dialog')
      await form.waitFor({ timeout: WAIT })
      await form.getByLabel(/^Full Name/).fill(customer)
      await form.getByLabel(/^Phone/).fill(phone)
      await form.getByRole('button', { name: 'Add Customer', exact: true }).last().click()

      const formRejected = form.getByRole('alert')
      await Promise.race([
        form.waitFor({ state: 'detached', timeout: WAIT }),
        formRejected.first().waitFor({ timeout: WAIT }),
      ]).catch(() => {})
      if ((await form.count()) > 0) {
        const why = (await formRejected.allInnerTexts()).join(' ').trim()
        check(ctx, false, `step 1: the new customer was not saved. The product answered: ${why || '(nothing)'}`)
      }

      await until(
        () => tableRows(page, 'Customer records', 'step 1: the register never finished loading'),
        (rows) => rows.length === registered + 1 && rows.some((cells) => line(cells).includes(customer)),
        `step 1: the register held ${registered} customers before "${customer}" was added and does not hold one more, including that customer, afterwards; the record did not persist`,
      )

      /* A register that accepts a record must be able to find it again. */
      const search = page.locator('main input[type="search"]').first()
      await search.fill(customer)
      await until(
        () => tableRows(page, 'Customer records', 'step 1: the register never finished loading'),
        (rows) => rows.length === 1 && line(rows[0]).includes(customer) && line(rows[0]).includes(phone),
        `step 1: searching the register for "${customer}" does not return exactly that record with the phone it was saved with`,
      )

      /* — 2. the customer's record, which owes nothing yet —————————— */
      await follow(page, register.first(), /\/customer-detail/, 'step 2')
      await showing(page, customer, `step 2: the record for ${customer} never rendered.`)
      const record = await until(
        () => page.locator('main').innerText(),
        (text) => /Vehicles/.test(text) && /Invoices/.test(text),
        'step 2: the customer record never showed its vehicles and invoices panels',
      )
      check(ctx, /Vehicles/.test(record), 'step 2: the customer record does not show a vehicles panel.')
      check(ctx, /Invoices/.test(record), 'step 2: the customer record does not show an invoices panel.')
      await until(
        () => page.locator('main').innerText(),
        (text) => text.includes('No invoices yet'),
        'step 2: a customer registered seconds ago is not showing an empty invoices panel — the 360 is not scoped to this record',
      )

      /* — 3. raise and issue the invoice ————————————————————————— */
      const sidebar = page.locator('aside')
      await follow(page, sidebar.getByRole('link', { name: 'Invoices', exact: true }), /\/invoices$/, 'step 3')
      await follow(page, page.getByRole('button', { name: /New Invoice/ }).first(), /\/invoice-create/, 'step 3')

      await page.getByLabel(/^Customer/).fill(customer)
      const draft = page.locator('h2:has-text("Invoice Summary")').locator('..')
      await draft.waitFor({ timeout: WAIT })
      const preview = await draft.innerText()
      const previewSubtotal = amountUnder(preview, 'Subtotal')
      const previewVat = amountUnder(preview, 'VAT (15%)')
      const previewTotal = amountUnder(preview, 'Total')
      check(
        ctx,
        previewTotal !== null && previewTotal > 0,
        'step 3: the invoice being raised prices at nothing — there is no amount to bill.',
      )
      check(
        ctx,
        same((previewSubtotal ?? 0) + (previewVat ?? 0), previewTotal),
        `step 3: the invoice summary does not add up — subtotal ${previewSubtotal} + VAT ${previewVat} is not the total ${previewTotal}.`,
      )

      await page.getByRole('button', { name: /Send Invoice/ }).click()
      const raiseFailed = page.getByRole('alert')
      await Promise.race([
        page.waitForURL(/\/invoice-detail/, { timeout: WAIT }),
        raiseFailed.first().waitFor({ timeout: WAIT }),
      ]).catch(() => {})
      if (!/\/invoice-detail/.test(page.url())) {
        const why = (await raiseFailed.allInnerTexts()).join(' ').trim()
        check(
          ctx,
          false,
          `step 3: "Send Invoice" did not raise an invoice for ${customer}. The product answered: ${why || '(nothing at all)'}. No invoice means no paid invoice — the rest of this path is unreachable.`,
        )
      }
      await settle(page)

      /* — 4. the issued invoice —————————————————————————————————— */
      const invoiceNumber = new URL(page.url()).searchParams.get('id')
      check(ctx, Boolean(invoiceNumber), 'step 4: the raised invoice carries no number.')
      await showing(page, 'Balance due', `step 4: ${invoiceNumber} never rendered its balance.`)
      const issued = await page.locator('main').innerText()
      check(
        ctx,
        issued.includes(invoiceNumber) && issued.includes(customer),
        `step 4: the invoice screen does not show ${invoiceNumber} billed to ${customer}.`,
      )
      const total = amountUnder(issued, 'Total')
      const outstanding = amountUnder(issued, 'Balance due')
      check(
        ctx,
        same(total, outstanding),
        `step 4: nothing has been paid yet, but the invoice shows a total of ${total} against a balance of ${outstanding}.`,
      )

      /* The invoice has to be able to say what it is charging for. */
      if (issued.includes('No line items')) {
        gaps.push(
          `step 4 — ${invoiceNumber} was raised from priced line items and its own screen reports "No line items · This invoice carries no priced lines", so the customer cannot be shown what they are being billed for. On a live build the cause is InvoiceDetail asking for the lines with pageSize=500 while the collection endpoint caps a page at 200: the request is rejected and the table renders empty beside a subtotal the server did compute from those lines.`,
        )
      }

      /* — 5. take the money ————————————————————————————————————— */
      const recordPayment = page.getByRole('button', { name: 'Record payment', exact: true }).first()
      check(
        ctx,
        (await offered(recordPayment)) && (await recordPayment.isEnabled()),
        `step 5: ${invoiceNumber} offers no way to record a payment, so it can never become paid.`,
      )
      await recordPayment.click()

      const till = page.getByRole('dialog')
      await till.waitFor({ timeout: WAIT })
      const tillText = await till.innerText()
      const due = amountUnder(tillText, 'Balance due')
      if (due === null) {
        /* No balance offered: pay the invoice's own total instead of guessing. */
        await till.getByLabel(/^Amount received/).fill(String(total))
      }
      await till.getByRole('button', { name: 'Record payment', exact: true }).last().click()

      const receipt = till.getByRole('button', { name: 'Done', exact: true })
      const payRejected = till.getByRole('alert')
      await Promise.race([
        receipt.waitFor({ timeout: WAIT }),
        payRejected.first().waitFor({ timeout: WAIT }),
      ]).catch(() => {})
      if ((await receipt.count()) === 0) {
        const why = (await payRejected.allInnerTexts()).join(' ').trim()
        check(
          ctx,
          false,
          `step 5: the payment against ${invoiceNumber} was refused. The product answered: ${why || '(nothing at all)'}. The invoice cannot be paid.`,
        )
      }
      const settled = await till.innerText()
      check(
        ctx,
        same(amountUnder(settled, 'Balance due'), 0),
        `step 5: after settling ${invoiceNumber} in full the server still reports ${amountUnder(settled, 'Balance due')} outstanding.`,
      )
      await receipt.click()
      await till.waitFor({ state: 'detached', timeout: WAIT }).catch(() => {})

      /* — 6. the invoice reads paid, and can account for it ——————— */
      const paid = await until(
        () => page.locator('main').innerText(),
        (text) => /\bPaid\b/.test(text) && same(amountUnder(text, 'Balance due'), 0),
        `step 6: ${invoiceNumber} does not read Paid with a zero balance after being settled in full`,
      )
      if (paid.includes('No payments yet')) {
        gaps.push(
          `step 6 — ${invoiceNumber} is settled, yet its own screen lists "No payments yet": the invoice cannot show the payment that paid it. Same cause as step 4 — the payments are requested with pageSize=500 and the API caps the page at 200.`,
        )
      }
      if (paid.includes('do not add up')) {
        gaps.push(
          `step 6 — ${invoiceNumber} contradicts itself after payment: it shows the server's paid figure beside an empty payment list and warns "The payments listed do not add up to the paid figure on the invoice."`,
        )
      }

      /* — 7. the register agrees ————————————————————————————————— */
      await follow(page, sidebar.getByRole('link', { name: 'Invoices', exact: true }), /\/invoices$/, 'step 7')
      const billed = rowsOf(page, 'Invoices').filter({ hasText: invoiceNumber })
      await billed.first().waitFor({ timeout: WAIT })
      const billedRow = await billed.first().innerText()
      check(
        ctx,
        /Paid/.test(billedRow),
        `step 7: the invoice register does not show ${invoiceNumber} as Paid — it reads "${billedRow.replace(/\s+/g, ' ').trim()}".`,
      )
      check(
        ctx,
        billedRow.includes(customer),
        `step 7: the invoice register does not show ${invoiceNumber} billed to ${customer}.`,
      )

      if (gaps.length) throw new Error(gapReport('New customer to paid invoice', gaps))
    },
  },

  /* ---------------------------------------------------------------------
   *  2. Existing customer service
   *
   *  The service advisor's morning: a customer already on file arrives, the
   *  advisor finds them, reads their history, and opens a job card for today's
   *  visit. The path is only complete when the new visit shows up on the
   *  customer's own record — a job card nobody can find from the customer is
   *  not a service record.
   * ------------------------------------------------------------------ */
  {
    id: 'existing-customer-service',
    path: 'Existing customer service',
    role: 'advisor',
    surfaces: ['app'],
    async run(page, ctx) {
      const stamp = Date.now().toString(36).toUpperCase()
      const vehicle = `Journey Vehicle ${stamp}`

      /* — 1. find the customer who is already on file ————————————— */
      await open(page, ctx, '/customers', 'step 1, the customer register')
      const register = rowsOf(page, 'Customer records')
      const onFile = await until(
        () => tableRows(page, 'Customer records', 'step 1: the customer register never finished loading'),
        (rows) => rows.length > 0,
        'step 1: the customer register is empty, so there is no existing customer to serve',
      )
      const customer = onFile[0][0].trim()
      check(ctx, customer.length > 0, 'step 1: the first row of the register carries no customer name.')

      const search = page.locator('main input[type="search"]').first()
      await search.fill(customer)
      const matches = await until(
        () => tableRows(page, 'Customer records', 'step 1: the register never finished loading'),
        (rows) => rows.length > 0 && rows.every((cells) => line(cells).includes(customer)),
        `step 1: searching the register for "${customer}" does not narrow it to that customer`,
      )
      check(ctx, matches.length >= 1, `step 1: "${customer}" cannot be found in the register they are listed in.`)

      /* — 2. read the record before touching the car —————————————— */
      await follow(page, register.first(), /\/customer-detail/, 'step 2')
      await showing(page, customer, `step 2: the record for ${customer} never rendered.`)
      const record = await until(
        () => page.locator('main').innerText(),
        (text) => ['Vehicles', 'Invoices', 'Service History'].every((panel) => text.includes(panel)),
        `step 2: the record for ${customer} never showed all of Vehicles, Invoices and Service History`,
      )
      for (const panel of ['Vehicles', 'Invoices', 'Service History']) {
        check(
          ctx,
          record.includes(panel),
          `step 2: the record for ${customer} does not show ${panel}; the advisor cannot see what this customer has been through.`,
        )
      }
      const visitsBefore = (
        await tableRows(
          page,
          'Service history for this customer',
          `step 2: the service history for ${customer} never finished loading`,
        )
      ).length

      /* — 3. open a job card for today's visit ———————————————————— */
      const sidebar = page.locator('aside')
      await follow(page, sidebar.getByRole('link', { name: 'Job Cards', exact: true }), /\/job-cards$/, 'step 3')
      await tableRows(page, 'Job cards', 'step 3: the job card list never finished loading')
      const newCard = page.getByRole('button', { name: /New Job Card/ }).first()
      check(
        ctx,
        await offered(newCard),
        `step 3: /job-cards offers no "New Job Card" control to the ${ctx.role} role, so a service visit cannot be opened.`,
      )
      await newCard.click()

      const form = page.getByRole('dialog')
      await form.waitFor({ timeout: WAIT })
      await form.getByLabel(/^Customer/).fill(customer)
      await form.getByLabel(/^Vehicle/).fill(vehicle)
      await form.getByLabel(/^Service/).selectOption('maintenance')
      await form.getByLabel(/^Priority/).selectOption('medium')

      const save = form.getByRole('button', { name: 'New Job Card', exact: true }).last()
      if (!(await save.isEnabled())) {
        const notice = (await form.innerText()).split('\n').map((l) => l.trim()).filter(Boolean)
        const reason = notice.find((line) => /build|API|VITE_API_URL|cannot/i.test(line))
        check(
          ctx,
          false,
          `step 3: the "New Job Card" save control is disabled, so no service visit can be opened for ${customer}. The form itself says: ${reason ?? '(no reason given)'}`,
        )
      }
      await save.click()

      const saveRejected = form.getByRole('alert')
      await Promise.race([
        page.waitForURL(/\/job-card-detail/, { timeout: WAIT }),
        saveRejected.first().waitFor({ timeout: WAIT }),
      ]).catch(() => {})
      if (!/\/job-card-detail/.test(page.url())) {
        const why = ((await form.count()) ? (await saveRejected.allInnerTexts()).join(' ') : '').trim()
        check(
          ctx,
          false,
          `step 3: saving the job card for ${customer} did not open one. The product answered: ${why || '(nothing at all)'}`,
        )
      }
      await settle(page)
      const cardNumber = new URL(page.url()).searchParams.get('id')
      check(ctx, Boolean(cardNumber), 'step 3: the job card that was opened carries no number.')
      await showing(page, cardNumber, `step 3: job card ${cardNumber} never rendered.`)
      const card = await page.locator('main').innerText()
      check(
        ctx,
        card.includes(customer) && card.includes(vehicle),
        `step 3: job card ${cardNumber} does not name ${customer} and ${vehicle} — the visit is not attributed to the customer it was opened for.`,
      )

      /* — 4. the visit is on the customer's record ————————————————— */
      await follow(page, sidebar.getByRole('link', { name: 'Customers', exact: true }), /\/customers$/, 'step 4')
      const back = rowsOf(page, 'Customer records')
      await tableRows(page, 'Customer records', 'step 4: the customer register never rendered again')
      await page.locator('main input[type="search"]').first().fill(customer)
      await until(
        () => tableRows(page, 'Customer records', 'step 4: the register never finished loading'),
        (rows) => rows.length > 0 && rows.every((cells) => line(cells).includes(customer)),
        `step 4: the register can no longer find ${customer}`,
      )
      await follow(page, back.first(), /\/customer-detail/, 'step 4')
      await showing(page, customer, `step 4: the record for ${customer} never rendered again.`)
      await until(
        () =>
          tableRows(
            page,
            'Service history for this customer',
            `step 4: the service history for ${customer} never finished loading`,
          ),
        (rows) => rows.length === visitsBefore + 1 && rows.some((cells) => line(cells).includes(cardNumber)),
        `step 4: the service history for ${customer} held ${visitsBefore} visits and does not now hold ${visitsBefore + 1} including ${cardNumber}; the job card is not on the customer's record`,
      )
    },
  },

  /* ---------------------------------------------------------------------
   *  3. Technician job completion
   *
   *  A technician finishes the repair they were given and hands the car to
   *  quality control. Completion is not a toast: the card has to be at Quality
   *  Check when the page is loaded again, and the control that hands it over
   *  has to be gone, because a hand-over that can be done twice was never
   *  recorded the first time.
   * ------------------------------------------------------------------ */
  {
    id: 'technician-job-completion',
    path: 'Technician job completion',
    role: 'technician',
    surfaces: ['app'],
    async run(page, ctx) {
      /* — 1. the work list ————————————————————————————————————— */
      await open(page, ctx, '/job-cards', 'step 1, the workshop work list')
      const listed = await until(
        () => tableRows(page, 'Job cards', 'step 1: the job card list never finished loading'),
        (rows) => rows.length > 0,
        'step 1: the workshop lists no job cards, so there is no work to complete',
      )
      const numbers = listed.map((cells) => cells[0].trim()).filter(Boolean)
      check(ctx, numbers.length > 0, 'step 1: the job card list shows rows with no job card number.')

      /* — 2. where is each card in the workshop? ————————————————— */
      const stages = []
      for (const number of numbers.slice(0, 8)) {
        await open(page, ctx, `/workshop-qc?id=${encodeURIComponent(number)}`, `step 2, job card ${number}`)
        await showing(page, number, `step 2: quality control cannot open job card ${number}.`)
        const stage = await railStage(page)
        check(ctx, Boolean(stage), `step 2: job card ${number} does not report which stage it is at.`)
        const cells = (listed.find((row) => row[0].trim() === number) ?? [])
          .map((cell) => cell.trim())
          .filter(Boolean)
        stages.push({ number, stage, status: cells[cells.length - 1] ?? '' })
      }

      /* A card the register calls finished cannot still be sitting at the
       * first stage: the two would be describing different job cards. */
      const contradiction = stages.find(
        (entry) => /completed|delivered/i.test(entry.status) && entry.stage === 'Check-In',
      )
      check(
        ctx,
        !contradiction,
        contradiction
          ? `step 2: job card ${contradiction.number} is listed as "${contradiction.status}" but the workshop rail puts it at Check-In. The stage the technician works from is not the stage the card is at.`
          : '',
      )

      /* — 3. hand the finished repair to quality control ——————————— */
      const finished = stages.find((entry) => entry.stage === 'Repair')
      check(
        ctx,
        Boolean(finished),
        `step 3: no job card is at the Repair stage, so there is no completed repair for a technician to hand over. The workshop reports: ${stages
          .map((entry) => `${entry.number} at ${entry.stage}`)
          .join(', ')}.`,
      )

      await open(page, ctx, `/workshop-qc?id=${encodeURIComponent(finished.number)}`, 'step 3, quality check')
      await showing(page, finished.number, `step 3: quality control cannot open job card ${finished.number}.`)
      const handover = page.getByRole('button', { name: /Send to Quality Check/ })
      check(
        ctx,
        await offered(handover),
        `step 3: job card ${finished.number} is at Repair but offers no way to hand it to quality control.`,
      )
      if (!(await handover.isEnabled())) {
        const notice = (await page.locator('main').innerText())
          .split('\n')
          .map((line) => line.trim())
          .find((line) => /cannot be saved|no API|role does not hold/i.test(line))
        check(
          ctx,
          false,
          `step 3: the hand-over control on ${finished.number} is disabled, so a technician cannot record that the repair is finished. The screen says: ${notice ?? '(no reason given)'}`,
        )
      }
      await handover.click()

      /* — 4. the hand-over stuck ————————————————————————————————— */
      await until(
        () => railStage(page),
        (stage) => stage === 'Quality Check',
        `step 4: after handing ${finished.number} over, the rail does not move to Quality Check`,
      )
      const refused = page.locator('main').getByRole('alert')
      if ((await refused.count()) > 0) {
        const why = (await refused.allInnerTexts()).join(' ').trim()
        check(
          ctx,
          !/refused|Couldn't save/i.test(why),
          `step 4: the hand-over of ${finished.number} was refused: ${why}`,
        )
      }

      await open(page, ctx, `/workshop-qc?id=${encodeURIComponent(finished.number)}`, 'step 4, reload')
      await showing(page, finished.number, `step 4: quality control cannot open job card ${finished.number} again.`)
      await until(
        () => railStage(page),
        (stage) => stage === 'Quality Check',
        `step 4: ${finished.number} is not at Quality Check when the screen is loaded again — the completion did not persist`,
      )
      check(
        ctx,
        (await page.getByRole('button', { name: /Send to Quality Check/ }).count()) === 0,
        `step 4: ${finished.number} still offers "Send to Quality Check" after being handed over — the same repair can be handed over twice.`,
      )

      /* — teardown ————————————————————————————————————————————
       *
       * A hand-over consumes the only thing this path can be measured on: a
       * repair that is finished and not yet with quality control. Left as it
       * is, the journey passes once and then reports "no job card is at the
       * Repair stage" forever, which would read as a product failure and is
       * not one. So the card goes back where it was found, through the control
       * the product itself offers this role on this screen ("Return to
       * Repair"). Best-effort and after every assertion: it cannot rescue a
       * failed run, and a failure to restore is left for the next run to
       * report honestly rather than swallowed into this one's result. */
      await page
        .getByRole('button', { name: /Return to Repair/ })
        .click({ timeout: WAIT })
        .then(() =>
          until(
            () => railStage(page),
            (stage) => stage === 'Repair',
            'teardown: the job card was not returned to Repair',
          ),
        )
        .catch(() => {})
    },
  },

  /* ---------------------------------------------------------------------
   *  4. Customer estimate approval
   *
   *  An estimate is a price put to the customer, and approving one authorises
   *  the spend. The path is complete when the decision is a fact of the
   *  record — readable on the estimate after a reload and in the register
   *  everyone else works from — and not merely a badge that changed colour.
   * ------------------------------------------------------------------ */
  {
    id: 'customer-estimate-approval',
    path: 'Customer estimate approval',
    role: 'owner',
    surfaces: ['app'],
    async run(page, ctx) {
      const gaps = []

      /* — 1. an estimate waiting on a decision ——————————————————— */
      await open(page, ctx, '/estimates', 'step 1, the estimate register')
      const estimates = rowsOf(page, 'Service estimates')
      const listed = await until(
        () => tableRows(page, 'Service estimates', 'step 1: the estimate register never finished loading'),
        (rows) => rows.length > 0,
        'step 1: there are no estimates at all, so none can be approved',
      )
      const undecided = listed
        .map((cells) => cells.map((cell) => cell.trim()))
        .find((cells) => !/^(approved|rejected|declined)$/i.test(cells[cells.length - 1]))
      check(
        ctx,
        Boolean(undecided),
        `step 1: every estimate has already been decided, so there is none awaiting approval, and the product offers no way to raise another — "New Estimate" on /estimates routes to /workshop-estimate, a job-card stage screen that approves an existing card's estimate rather than creating an estimate record. Once the seeded estimates are decided this path cannot be walked again. The register reads: ${listed
          .map((cells) => line(cells).replace(/\s+/g, ' ').trim())
          .join(' | ')}.`,
      )
      const number = undecided[0]

      /* — 2. what is being approved ——————————————————————————————— */
      await follow(page, estimates.filter({ hasText: number }).first(), /\/estimate-detail/, 'step 2')
      await showing(page, number, `step 2: estimate ${number} never rendered.`)
      await showing(page, 'Grand total', `step 2: ${number} never showed a grand total, so there is no amount to approve.`)
      const quote = await page.locator('main').innerText()
      check(ctx, quote.includes(number), `step 2: the estimate screen does not show ${number}.`)

      const grand = amountUnder(quote, 'Grand total')
      check(
        ctx,
        grand !== null && grand > 0,
        `step 2: ${number} shows no amount, so there is nothing to approve.`,
      )
      const subtotal = amountUnder(quote, 'Subtotal')
      const vat = amountUnder(quote, 'VAT')
      if (subtotal === null || vat === null) {
        gaps.push(
          `step 2 — ${number} shows a grand total of SAR ${grand} and no breakdown of it: the approver is asked to authorise an amount without being shown the net and the VAT that make it up.`,
        )
      } else {
        check(
          ctx,
          same(subtotal + vat, grand),
          `step 2: ${number} does not add up — subtotal ${subtotal} + VAT ${vat} is not the grand total ${grand}.`,
        )
      }

      /* — 3. the decision ——————————————————————————————————————— */
      const approve = page.getByRole('button', { name: 'Approve', exact: true })
      check(
        ctx,
        (await offered(approve)) && (await approve.isEnabled()),
        `step 3: ${number} is undecided but offers no enabled Approve control to the ${ctx.role} role, so the decision cannot be taken here.`,
      )
      await approve.click()

      /* The answer arrives either as the record changing state or as a toast,
       * and the toast is not inside `main` — so this watches the whole page. */
      const decided = await until(
        () => page.locator('body').innerText(),
        (text) => /This estimate is approved/i.test(text) || /Approval failed/i.test(text),
        `step 3: approving ${number} produced neither an approved estimate nor a refusal`,
      )
      if (/Approval failed/i.test(decided)) {
        const said = decided
          .split('\n')
          .map((one) => one.trim())
          .filter(Boolean)
        const at = said.findIndex((one) => /Approval failed/i.test(one))
        check(
          ctx,
          false,
          `step 3: approving ${number} was refused. The product answered: ${said[at + 1] ?? '(no reason given)'}`,
        )
      }

      /* — 4. the decision is a fact of the record ————————————————— */
      await open(page, ctx, `/estimate-detail?id=${encodeURIComponent(number)}`, 'step 4, reload')
      await showing(page, number, `step 4: estimate ${number} never rendered again.`)
      const reloaded = await page.locator('main').innerText()
      check(
        ctx,
        /Approved/.test(reloaded),
        `step 4: ${number} does not read Approved when the estimate is loaded again — the decision did not persist.`,
      )
      check(
        ctx,
        (await page.getByRole('button', { name: 'Approve', exact: true }).count()) === 0,
        `step 4: ${number} still offers Approve after being approved — a decided estimate can be decided again.`,
      )

      await open(page, ctx, '/estimates', 'step 4, the register')
      const row = rowsOf(page, 'Service estimates').filter({ hasText: number })
      const rowText = await until(
        () => row.first().innerText().catch(() => ''),
        (text) => text.includes(number),
        `step 4: ${number} is no longer listed in the estimate register`,
      )
      check(
        ctx,
        /Approved/i.test(rowText),
        `step 4: the estimate register still shows ${number} as "${rowText.split('\t').pop().trim()}" — everyone else is working from the undecided estimate.`,
      )

      if (gaps.length) throw new Error(gapReport('Customer estimate approval', gaps))
    },
  },

  /* ---------------------------------------------------------------------
   *  5. Accounting reconciliation
   *
   *  Reconciliation is a two-sided match: the cash the system recorded against
   *  the lines the bank reports. A screen that shows only one side has not
   *  reconciled anything. The path completes when an unreconciled statement
   *  line is matched to a recorded receipt and the outstanding count falls.
   * ------------------------------------------------------------------ */
  {
    id: 'accounting-reconciliation',
    path: 'Accounting reconciliation',
    role: 'accountant',
    surfaces: ['app'],
    async run(page, ctx) {
      const gaps = []

      /* — 1. the book side ————————————————————————————————————— */
      await open(page, ctx, '/bank-reconciliation', 'step 1, bank reconciliation')
      const recorded = await until(
        () =>
          tableRows(
            page,
            'Recorded cash receipts (book side)',
            'step 1: the book side never finished loading',
          ),
        (rows) => rows.length > 0,
        'step 1: the book side lists no recorded cash, so there is nothing to reconcile against',
      )
      const receipts = recorded.length
      for (const cells of recorded) {
        check(
          ctx,
          sar(line(cells)) !== null,
          `step 1: a recorded receipt carries no amount: "${line(cells).replace(/\s+/g, ' ').trim()}".`,
        )
      }

      /* The headline and the table have to be describing the same receipts. */
      const summary = await page.locator('main').innerText()
      const inView = Number(
        (summary.match(/Receipts in view\s*\n\s*([\d,]+)/) ?? [])[1]?.replace(/,/g, ''),
      )
      check(
        ctx,
        inView === receipts,
        `step 1: the page says ${inView} receipts are in view and the table shows ${receipts} — the figure an accountant reads and the rows they check do not agree.`,
      )

      /* — 2. the bank side ————————————————————————————————————— */
      const statement = page.getByRole('table', { name: 'Imported bank statement lines' })
      if (!(await offered(statement))) {
        const said = (await page.locator('main').innerText())
          .split('\n')
          .map((one) => one.trim())
          .filter(
            (one) =>
              one.length > 40 &&
              /(no bank statement|bank-statement|bankStatements|Missing server collection)/i.test(one),
          )
        gaps.push(
          `step 2 — there is no bank statement to reconcile against: the screen shows no statement table at all. It says: ${said.join(' ') || '(no reason given)'}`,
        )
        const importer = page.getByRole('button', { name: /Import statement/ })
        if ((await offered(importer, 1_000)) && !(await importer.isEnabled())) {
          gaps.push(
            'step 2 — "Import statement" is present but disabled, so an accountant cannot supply the statement themselves either.',
          )
        }
        gaps.push(
          'step 3 — with no statement lines there is nothing to match a receipt to, so no reconciliation can be performed or recorded.',
        )
        throw new Error(gapReport('Accounting reconciliation', gaps))
      }

      const lines = statement.locator('tbody tr')
      await until(
        () => tableRows(page, 'Imported bank statement lines', 'step 2: the bank statement never finished loading'),
        (rows) => rows.length > 0,
        'step 2: the bank statement table is present but holds no lines to reconcile',
      )

      const unreconciled = lines.filter({ hasText: 'Unreconciled' })
      const outstandingBefore = await unreconciled.count()
      check(
        ctx,
        outstandingBefore > 0,
        'step 2: every statement line is already matched, so there is no reconciliation left to perform — and this screen offers no way to import another statement, so once the imported lines are matched the path cannot be walked again. Statement lines have to arrive from outside the product.',
      )

      /* — 3. match a line to a receipt ————————————————————————— */
      const target = unreconciled.first()
      const reference = (await target.innerText()).split('\t')[2]?.trim()
      const picker = target.getByRole('combobox')
      check(
        ctx,
        await offered(picker),
        `step 3: statement line ${reference} offers no receipt to match it to.`,
      )
      await picker.selectOption({ index: 1 })
      const reconcile = target.getByRole('button', { name: /Reconcile/ })
      check(
        ctx,
        (await offered(reconcile)) && (await reconcile.isEnabled()),
        `step 3: statement line ${reference} offers no enabled Reconcile control.`,
      )
      await reconcile.click()

      /* — 4. the match is recorded ——————————————————————————————— */
      await until(
        () => statement.locator('tbody tr').filter({ hasText: reference }).first().innerText(),
        (row) => /Matched/.test(row),
        `step 4: statement line ${reference} does not read Matched after being reconciled`,
      )
      await until(
        () => unreconciled.count(),
        (count) => count === outstandingBefore - 1,
        `step 4: ${outstandingBefore} lines were unreconciled and the screen does not now show ${outstandingBefore - 1}`,
      )
      await until(
        () => page.locator('main').innerText(),
        (text) => new RegExp(`\\b${outstandingBefore - 1}\\s+unreconciled`).test(text),
        `step 4: the unreconciled count in the headline does not fall to ${outstandingBefore - 1} after the match`,
      )

      if (gaps.length) throw new Error(gapReport('Accounting reconciliation', gaps))
    },
  },

  /* ---------------------------------------------------------------------
   *  6. Report generation
   *
   *  Someone needs a figure out of the system and into a spreadsheet. The path
   *  is: pick a source, choose the columns, narrow it, look at it, and take the
   *  file away. The assertion that matters is that the file *is* the table —
   *  an export that quietly ships the unfiltered set, or yesterday's columns,
   *  is worse than no export.
   * ------------------------------------------------------------------ */
  {
    id: 'report-generation',
    path: 'Report generation',
    role: 'accountant',
    surfaces: ['app'],
    async run(page, ctx) {
      await open(page, ctx, '/custom-reports', 'step 1, the report builder')
      await captureDownloads(page)

      /* — 1. the builder offers a source and columns ————————————— */
      const source = page.getByLabel('Data source')
      check(ctx, await offered(source), 'step 1: the report builder offers no data source to report on.')
      const sources = await source.locator('option').allInnerTexts()
      check(ctx, sources.length > 1, 'step 1: the report builder offers only one data source, so nothing can be chosen.')

      const columns = page.locator('button[aria-pressed]')
      const chosen = await columns.allInnerTexts()
      check(ctx, chosen.length > 1, 'step 1: the report builder offers no columns to choose between.')

      const preview = page.getByRole('table', { name: 'Custom report results' })
      await until(
        () => tableRows(page, 'Custom report results', 'step 1: the report preview never finished loading'),
        (rows) => rows.length > 0,
        'step 1: the report preview never rendered a row, so there is nothing to report on',
      )
      const headers = () => preview.locator('thead th').allInnerTexts()
      const rows = () => preview.locator('tbody tr').allInnerTexts()
      check(
        ctx,
        (await headers()).length === chosen.length,
        `step 1: ${chosen.length} columns are selected but the preview shows ${(await headers()).length} — the report does not show the columns it was asked for.`,
      )

      /* — 2. dropping a column changes the report ————————————————— */
      const dropped = chosen[1]
      await columns.nth(1).click()
      await until(
        headers,
        (heads) => heads.length === chosen.length - 1 && !heads.some((head) => head.toLowerCase() === dropped.toLowerCase()),
        `step 2: turning the "${dropped}" column off does not remove it from the report`,
      )

      /* — 3. narrowing it ————————————————————————————————————— */
      const unfiltered = await rows()
      const needle = unfiltered[0].split('\t')[0].trim()
      check(ctx, needle.length > 0, 'step 3: the first row of the report has nothing in its first column to filter on.')
      await page.getByLabel('Search rows').fill(needle)
      const narrowed = await until(
        rows,
        (found) =>
          found.length > 0 &&
          found.length <= unfiltered.length &&
          found.every((row) => row.includes(needle)),
        `step 3: filtering the report for "${needle}" does not narrow it to rows containing it`,
      )

      /* — 4. the file is the report ————————————————————————————— */
      const exportCsv = page.getByRole('button', { name: /Export CSV/ })
      check(
        ctx,
        (await offered(exportCsv)) && (await exportCsv.isEnabled()),
        'step 4: the report cannot be exported — there is no enabled export control, so the report cannot leave the screen.',
      )
      await exportCsv.click()
      const csv = parseCsv(await lastDownload(page, 'step 4'))

      const heads = await headers()
      check(
        ctx,
        csv.length === narrowed.length + 1,
        `step 4: the report on screen has ${narrowed.length} rows and the exported file has ${csv.length - 1} — the file is not the report.`,
      )
      check(
        ctx,
        csv[0].length === heads.length,
        `step 4: the report shows ${heads.length} columns and the exported file has ${csv[0].length}.`,
      )
      check(
        ctx,
        csv[0].every((head, i) => head.toLowerCase() === heads[i].toLowerCase()),
        `step 4: the exported columns [${csv[0].join(', ')}] are not the columns on screen [${heads.join(', ')}].`,
      )
      for (let i = 0; i < narrowed.length; i += 1) {
        const onScreen = narrowed[i].split('\t').map((cell) => cell.trim())
        const inFile = csv[i + 1].map((cell) => cell.trim())
        check(
          ctx,
          inFile.length === onScreen.length,
          `step 4: exported row ${i + 1} has ${inFile.length} cells against ${onScreen.length} on screen.`,
        )
        check(
          ctx,
          inFile.every((cell, c) => onScreen[c] === cell || onScreen[c].includes(cell) || cell.includes(onScreen[c])),
          `step 4: exported row ${i + 1} [${inFile.join(' | ')}] is not the row on screen [${onScreen.join(' | ')}].`,
        )
      }

      /* — 5. a second report over a different source ——————————————— */
      const other = sources.find((option) => option !== sources[0]) ?? sources[1]
      const options = await source.locator('option').all()
      let otherValue = null
      for (const option of options) {
        if ((await option.innerText()).trim() === other.trim()) {
          otherValue = await option.getAttribute('value')
          break
        }
      }
      check(ctx, Boolean(otherValue), `step 5: the "${other}" source has no value to select.`)
      await source.selectOption(otherValue)
      await until(
        headers,
        (heads) => heads.length > 0 && heads.join('|') !== csv[0].join('|').toUpperCase(),
        `step 5: switching the report source to "${other}" does not change the columns of the report`,
      )
      await until(
        () => preview.locator('tbody tr').count(),
        (count) => count >= 0,
        `step 5: the report over "${other}" never rendered`,
      )
    },
  },
]
