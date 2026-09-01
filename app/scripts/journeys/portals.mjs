/** Golden-path journeys for the customer-facing and portal surfaces.
 *
 *  Six of the twenty-three paths in `project-control/tracker/plan-structure.json`
 *  live here: the two customer journeys (mobile booking, customer portal), the
 *  technician portal, the call centre console, the self-service kiosk and the
 *  CRM lead conversion.
 *
 *  Each `run` walks the surface the way its real user does and asserts the
 *  thing that user came for — a booking that exists afterwards, a job that
 *  moved a stage, a lead that became an opportunity. None of them settles for
 *  "the route rendered": that is the floor `scripts/smoke.mjs` already holds.
 *
 *  **Roles are the journey's real audience, never a more privileged stand-in.**
 *  `Customer portal` signs in as `customer` because that is who the portal is
 *  for. Signing it in as an advisor would make it green and would describe a
 *  screen nobody in the product uses. Where the real principal is refused, the
 *  journey fails and quotes the server's own refusal.
 *
 *  ### The two builds this runs against
 *
 *  The app has two backends (`app/src/data/repository.ts`): the design fixtures
 *  when `VITE_API_URL` is unset, and the REST API when it is set. Reads succeed
 *  in both; **writes exist only against the API**, and the fixture build says so
 *  in the UI rather than faking a success. Authorization exists only against
 *  the API too — the mock repository serves every row to every role.
 *
 *  So a write step fails on a fixture build with the product's own honest
 *  notice, and an authorization step fails on the API build with the server's
 *  own 403 text. Both are real failures of the journey and both are reported in
 *  the product's words, which is why no journey here branches on which build it
 *  is looking at.
 */

/* ------------------------------------------------------------------ helpers */

/** Assertion. Uses the runner's `expect` when present so failures carry its
 *  formatting; falls back to a throw, which is the contract's own definition of
 *  a failed journey. */
async function must(ctx, condition, message) {
  if (ctx && typeof ctx.expect === 'function') {
    await ctx.expect(Boolean(condition), message)
    if (!condition) throw new Error(message)
    return
  }
  if (!condition) throw new Error(message)
}

/** Navigate and wait for the app to have painted something. */
async function open(page, ctx, route) {
  await page.goto(ctx.base + route, { waitUntil: 'domcontentloaded' })
  await page
    .waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 20_000 })
    .catch(() => {})
  await must(
    ctx,
    !/\/(login|session-expired|unauthorized|error404)$/.test(new URL(page.url()).pathname),
    `${route}: the app redirected a signed-in ${ctx.role} to ${new URL(page.url()).pathname} instead of rendering the screen`,
  )
}

/** Wait for every data-backed panel on the page to stop loading.
 *
 *  Not a sleep: it waits for the condition the assertions need — no panel still
 *  showing its loading state. A read that ends in a 403 clears the same way,
 *  after react-query has finished retrying, and then reports through
 *  `refusals()` below. */
async function settled(page, timeout = 30_000) {
  await page
    .waitForFunction(() => !/Loading[\s.…]/i.test(document.body.innerText), null, { timeout })
    .catch(() => {})
}

/** The role refusals the screens are currently rendering.
 *
 *  A collection read the signed-in role has no grant for comes back 403 and the
 *  screen shows `ErrorState` (`role="alert"`) carrying the server's message
 *  verbatim — "The customer role may not view invoices." Collecting them lets a
 *  journey name exactly which collection refused which role. */
async function refusals(page) {
  const texts = await page.locator('[role="alert"]').allInnerTexts()
  return texts
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter((t) => /may not (view|create|edit|delete|export|approve)/i.test(t))
    .map((t) => (t.match(/The \w+ role may not [^.]*\./i) ?? [t])[0])
}

async function assertNoRefusal(page, ctx, where) {
  const found = await refusals(page)
  await must(
    ctx,
    found.length === 0,
    `${where}: the API refused the reads this screen is built on for the ${ctx.role} role — ${found.join(' ')} ` +
      `The screen is drawn for this audience but the audience holds no grant on the collections it reads.`,
  )
}

/** The product's own "this build cannot write" sentence, if it is on screen.
 *  Quoting it makes a disabled write control self-explaining. */
async function noWriteNotice(page) {
  const body = await page.locator('body').innerText()
  const match = body.match(/[^.\n]*(no API configured|Set VITE_API_URL|fixture repository|fixture build)[^.]*\./i)
  return match ? match[0].replace(/\s+/g, ' ').trim() : null
}

/** Wait for something the journey needs to be on the page.
 *
 *  A bare `count()` reads whatever has mounted so far, which races every
 *  data-backed panel; this waits for the condition instead, and fails with the
 *  journey's own message rather than a Playwright timeout. */
async function present(locator, ctx, message, timeout = 20_000) {
  try {
    await locator.first().waitFor({ state: 'attached', timeout })
  } catch {
    await must(ctx, false, message)
  }
}

/** Assert a control exists and is usable, explaining a disabled one in the
 *  product's words rather than as a bare "not clickable". */
async function assertEnabled(locator, page, ctx, label) {
  await present(locator, ctx, `${label}: the control is not on the page at all`)
  const disabled = await locator.first().isDisabled()
  const notice = disabled ? await noWriteNotice(page) : null
  await must(
    ctx,
    !disabled,
    `${label}: the control is disabled, so the journey cannot complete` +
      (notice
        ? ` — the screen explains: "${notice}"`
        : ' — and the screen offers no reason for refusing it'),
  )
}

/** Wait for `fn` to become true, polling the live DOM.
 *
 *  `message` may be a function, so a failure message that wants to quote what
 *  the screen ended up saying is built after the wait rather than before it. */
async function until(page, fn, arg, message, ctx, timeout = 20_000) {
  try {
    await page.waitForFunction(fn, arg, { timeout })
  } catch {
    await must(ctx, false, typeof message === 'function' ? await message() : message)
  }
}

/** Whatever the page is currently complaining about, for a failure message. */
async function complaints(page) {
  const texts = await page.locator('[role="alert"]').allInnerTexts()
  const cleaned = texts.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean)
  return cleaned.length ? cleaned.join(' | ') : '(nothing)'
}

/* ----------------------------------------------------------------- journeys */

export default [
  {
    id: 'mobile-customer-booking',
    path: 'Mobile customer booking',
    role: 'customer',
    surfaces: ['portal', 'customer-app'],
    /** A customer, on a phone, books a service and the booking exists.
     *
     *  Driven at 390px like the mobile checks in `scripts/smoke.mjs`, because
     *  the portal is a mobile-first surface: below 700px `PortalShell` renders
     *  the phone frame with the bottom tab bar the design draws, and the
     *  booking form is the one screen in the product that actually posts an
     *  appointment.
     *
     *  The customer app (`/customer-app/*`) is deliberately not the booking
     *  surface here: its "Book" action leads to `/customer-app/appointments`,
     *  whose own "Book Service" button navigates to that same route. There is
     *  no booking form on that surface to walk. */
    async run(page, ctx) {
      await page.setViewportSize({ width: 390, height: 844 })

      // The customer starts at their portal home and taps through, rather than
      // being teleported to a deep link they would have no way to reach.
      await open(page, ctx, '/customer-portal')
      const bookTab = page.getByRole('link', { name: 'Book', exact: true })
      await present(
        bookTab,
        ctx,
        'customer portal at 390px: nothing labelled "Book" on the portal, so a phone customer has no route to the booking form',
      )
      await bookTab.first().click()
      await until(
        page,
        () => location.pathname === '/customer-portal/booking',
        null,
        'customer portal: tapping "Book" did not land on /customer-portal/booking',
        ctx,
      )

      await present(
        page.getByRole('heading', { name: 'Book Appointment' }),
        ctx,
        'booking: the "Book Appointment" screen did not render',
      )

      // A phone surface that scrolls sideways is not a phone surface.
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      await must(ctx, !sideways, 'booking at 390px: the page scrolls horizontally on a phone viewport')

      await settled(page)
      await assertNoRefusal(page, ctx, 'booking')

      // Step 1 — the customer's own vehicles.
      const vehicles = page.getByRole('radiogroup', { name: 'Select Vehicle' }).getByRole('radio')
      await present(
        vehicles,
        ctx,
        'booking step 1: the vehicle picker offered nothing to choose, so the customer cannot say which car this is for',
      )
      await vehicles.first().click()

      // Step 2 — the services the workshop sells.
      const services = page.getByRole('radiogroup', { name: 'Select Service' }).getByRole('radio')
      await present(services, ctx, 'booking step 2: the service picker offered nothing to choose')
      await services.first().click()
      const service = (await services.first().innerText()).trim()

      // Step 3 — a day and a free slot. A slot already taken is disabled, and
      // picking one of those would be booking over somebody else.
      const days = page.getByRole('radiogroup', { name: 'Date & Time' }).getByRole('radio')
      await present(days, ctx, 'booking step 3: no bookable days were offered')
      await days.first().click()

      const slots = page.getByRole('radiogroup', { name: 'Select Time' }).getByRole('radio')
      const free = []
      for (const slot of await slots.all()) {
        if (!(await slot.isDisabled())) free.push(slot)
      }
      await must(
        ctx,
        free.length > 0,
        'booking step 3: every time slot on the first bookable day is taken, so nothing can be booked',
      )
      await free[0].click()
      const time = (await free[0].innerText()).trim()

      // Step 4 — confirm, and take the server's answer as the answer.
      const confirm = page.getByRole('button', { name: /Confirm Booking/i })
      await assertEnabled(confirm, page, ctx, 'booking step 4: "Confirm Booking"')
      await confirm.click()

      await until(
        page,
        () => /Booking confirmed/i.test(document.body.innerText),
        null,
        async () =>
          'booking step 4: the confirmation never arrived — no "Booking confirmed" panel after submitting. ' +
          `The form said: ${await complaints(page)}`,
        ctx,
      )

      const receipt = await page.getByRole('status').first().innerText()
      await must(
        ctx,
        receipt.includes(service),
        `booking confirmation: the receipt does not name the service the customer chose ("${service}")`,
      )
      await must(
        ctx,
        receipt.includes(time),
        `booking confirmation: the receipt does not name the time the customer chose ("${time}")`,
      )

      // The booking has to be a fact, not a screen. It must be there when the
      // customer looks at their own appointments afterwards.
      await open(page, ctx, '/customer-portal')
      await settled(page)
      await assertNoRefusal(page, ctx, 'customer portal after booking')
      await until(
        page,
        (needle) => document.body.innerText.includes(needle),
        time,
        `after booking: the new appointment (${time}) is not in the customer's "Upcoming Appointments" — the booking did not survive the round trip`,
        ctx,
      )
    },
  },

  {
    id: 'customer-portal',
    path: 'Customer portal',
    role: 'customer',
    surfaces: ['portal'],
    /** A customer signs in to the portal and finds their service, their
     *  vehicles, their appointments and their invoices.
     *
     *  Signed in as `customer` on purpose. The registry grants the portal
     *  screen to `customer: vx`, but the screen reads `vehicles`,
     *  `appointments`, `invoices`, `jobs` and `estimates` — staff collections
     *  the customer role holds no grant on at all. Running this as an advisor
     *  would pass and would prove nothing about the portal's own audience. */
    async run(page, ctx) {
      /* The portal's premise is own-scope: "a customer principal reads their
       * records and nothing else, because the server's RLS says so"
       * (CustomerPortal.tsx). That is only true of rows that came back from a
       * request made as this customer, so the journey watches for them. */
      const reads = []
      page.on('response', (response) => {
        const path = new URL(response.url()).pathname
        if (/\/(vehicles|appointments|invoices|jobs|estimates)$/.test(path)) {
          reads.push(`${path} → ${response.status()}`)
        }
      })

      await open(page, ctx, '/customer-portal')

      const greeting = page.locator('h1').first()
      await present(
        greeting,
        ctx,
        'customer portal: no greeting heading rendered — the portal did not identify the signed-in customer',
      )
      // The three data sections are what the journey is about; wait for the
      // screen to have laid them out before reading anything off it.
      await present(
        page.getByRole('heading', { name: 'Recent Invoices' }),
        ctx,
        'customer portal: the portal body never rendered its sections',
      )
      await settled(page)

      await must(
        ctx,
        reads.length > 0,
        'customer portal: the portal filled its panels without asking anyone for this customer\'s records — ' +
          'no request was made for vehicles, appointments, invoices, jobs or estimates. The rows came from the ' +
          'design fixtures bundled into the build, which are the whole workshop\'s and are identical for every ' +
          'signed-in principal, so nothing on this screen is scoped to the customer looking at it.',
      )
      await assertNoRefusal(page, ctx, 'customer portal')

      // The four things the portal promises. Each must resolve to content, not
      // to a spinner and not to an error.
      const body = await page.locator('body').innerText()
      for (const section of ['My Vehicles', 'Upcoming Appointments', 'Recent Invoices']) {
        await must(ctx, body.includes(section), `customer portal: the "${section}" section is missing`)
      }

      // Active service: either the customer's job with its stage rail showing
      // where the car actually is, or the honest "no active service" state that
      // offers the booking route. A spinner, an error or a blank is none of
      // those, and this is the panel the customer opened the portal for.
      const railStep = await page
        .locator('[aria-label="Active Service"] ol[aria-label="Stage"] [aria-current="step"]')
        .count()
      await must(
        ctx,
        railStep > 0 || /No active service/i.test(body),
        'customer portal: the active-service panel shows neither where the car is on the workshop stage rail nor the "No active service" state',
      )

      // Invoices are the reason a customer opens a portal at all: each one has
      // to carry an amount. Structural, not fixture-specific — no particular
      // total is asserted, only that a listed invoice shows money.
      const invoicesIndex = body.indexOf('Recent Invoices')
      const invoicesTail = body.slice(invoicesIndex)
      await must(
        ctx,
        /No invoices|SAR|ر\.س/.test(invoicesTail),
        'customer portal: the invoices section lists rows with no amount on them, and no empty state either',
      )

      // The portal's own navigation must reach the one action it offers.
      const bookTab = page.getByRole('link', { name: 'Book', exact: true })
      await present(bookTab, ctx, 'customer portal: the "Book" destination is missing from the portal nav')
      await bookTab.first().click()
      await until(
        page,
        () => location.pathname === '/customer-portal/booking',
        null,
        'customer portal: the "Book" tab did not reach the booking screen',
        ctx,
      )
    },
  },

  {
    id: 'technician-portal',
    path: 'Technician portal',
    role: 'technician',
    surfaces: ['portal'],
    /** A technician opens their portal, finds the job in their hands and moves
     *  it forward.
     *
     *  The portal's whole point is the one write it offers: `repair → qc`
     *  through `POST /jobs/:id/transition`. Reading the board and stopping
     *  there would be a route check wearing a journey's name. */
    async run(page, ctx) {
      await open(page, ctx, '/technician-portal')
      await settled(page)
      await assertNoRefusal(page, ctx, 'technician portal')

      // The hero counters are derived from the job rows; still showing the
      // loading ellipsis means the board never arrived.
      const hero = page.locator('section[aria-label="Technician Portal"]')
      await present(hero, ctx, 'technician portal: the portal hero did not render')
      const heroText = await hero.first().innerText()
      await must(
        ctx,
        !heroText.includes('…'),
        'technician portal: the assigned/in-progress/completed counters never resolved',
      )
      for (const label of ['Assigned', 'In Progress', 'Completed']) {
        await must(ctx, heroText.includes(label), `technician portal: the "${label}" counter is missing from the hero`)
      }

      // A technician with no work has nothing to walk. That is a seeding
      // problem, and it says so rather than passing quietly.
      const body = await page.locator('body').innerText()
      await must(
        ctx,
        !/No jobs assigned to you/i.test(body),
        'technician portal: no jobs are assigned to this technician, so the portal has no journey to walk — reseed the API (server/: npm run db:reset) before rerunning',
      )

      const openJob = page.getByRole('link', { name: /Open Job/i })
      await present(
        openJob,
        ctx,
        'technician portal: the board lists no current job to open — a technician cannot reach a job card from their own portal',
      )
      await openJob.first().click()

      await until(
        page,
        () => location.pathname === '/technician-portal/job-detail',
        null,
        'technician portal: "Open Job" did not reach the job detail screen',
        ctx,
      )
      await present(
        page.getByRole('heading', { name: 'Tasks' }),
        ctx,
        'technician job detail: the job card never rendered its task rail',
      )
      await settled(page)
      await assertNoRefusal(page, ctx, 'technician job detail')

      const detail = await page.locator('body').innerText()
      await must(
        ctx,
        /\bTasks\b/.test(detail) && /\d+\/\d+/.test(detail),
        'technician job detail: the stage rail did not render a "done / total" position for the job',
      )

      // The stage action. A job that is not at Repair cannot be completed — say
      // so precisely instead of reporting a missing button.
      const complete = page.getByRole('button', { name: /Mark Repair Complete/i })
      if ((await complete.count()) === 0) {
        const at = await page.locator('li[aria-current="step"]').first().innerText().catch(() => '')
        const why = (await page.locator('body').innerText()).match(/This job [^.]*\./)
        await must(
          ctx,
          false,
          'technician job detail: the job the portal handed this technician is not at the Repair stage — it is at ' +
            `"${at.replace(/\s+/g, ' ').replace(/ Current$/, '').trim() || 'an unknown stage'}", so the portal's one write (repair → qc) has nothing to act on. ` +
            (why ? `The screen says: "${why[0]}"` : ''),
        )
      }
      await assertEnabled(complete, page, ctx, 'technician job detail: "Mark Repair Complete"')
      await complete.click()

      // The move is the server's to make; the screen must show the job where
      // the server put it. At `qc` the next control is the QC sign-off.
      await until(
        page,
        () => /Pass Quality Check/i.test(document.body.innerText),
        null,
        'technician job detail: the job did not move to Quality Control after "Mark Repair Complete" — the stage transition did not take',
        ctx,
        25_000,
      )

      // And the control the technician must NOT have: a technician may not pass
      // the quality check on their own repair. It stays visible and refused.
      const pass = page.getByRole('button', { name: /Pass Quality Check/i })
      await must(
        ctx,
        await pass.first().isDisabled(),
        'technician job detail: the technician who did the repair is offered "Pass Quality Check" as an enabled control — segregation of duties is not being applied on this screen',
      )
      await must(
        ctx,
        /Segregation of duties/i.test(await page.locator('body').innerText()),
        'technician job detail: the QC control is refused without telling the technician why',
      )
    },
  },

  {
    id: 'call-center',
    path: 'Call center',
    role: 'callcenter',
    surfaces: ['call-center'],
    /** An agent takes the next caller off the queue, works the call against
     *  that caller's record, dispositions it and the call is logged.
     *
     *  Answering is the first act of the journey, so it is the first thing
     *  asserted: a console whose queue cannot be answered has no journey behind
     *  it, however complete the layout looks. */
    async run(page, ctx) {
      await open(page, ctx, '/call-center')
      await settled(page)
      await assertNoRefusal(page, ctx, 'call centre console')

      await present(
        page.getByRole('heading', { name: 'Agent Console' }),
        ctx,
        'call centre: the agent console did not render',
      )

      const queue = page.getByRole('button', { name: /^Answer call from / })
      await present(
        queue,
        ctx,
        'call centre: the live queue offers nobody to answer, so an agent cannot take a call',
      )
      const label = (await queue.first().getAttribute('aria-label')) ?? ''
      const caller = label.replace(/^Answer call from\s*/i, '').trim()
      await must(ctx, caller.length > 0, 'call centre: the queued call names no caller')

      await assertEnabled(queue, page, ctx, `call centre: "Answer" for ${caller}`)

      const before = await page.locator('body').innerText()
      await queue.first().click()
      await until(
        page,
        (snapshot) => document.body.innerText !== snapshot,
        before,
        `call centre: answering the queued call from ${caller} changed nothing on the console — "Answer" is inert, so the agent cannot take the call and the journey stops here`,
        ctx,
        10_000,
      )

      // The console must now be about the caller who was answered, not about
      // somebody else.
      const active = await page.locator('body').innerText()
      await must(
        ctx,
        active.includes(caller),
        `call centre: after answering ${caller} the active-call panel is not about that caller`,
      )

      // Disposition and wrap-up.
      const disposition = page.getByRole('button', { name: 'Status Enquiry' })
      await present(disposition, ctx, 'call centre: the disposition options are missing')
      await disposition.first().click()
      const notes = page.getByRole('textbox', { name: /Call notes/i })
      await present(notes, ctx, 'call centre: there is nowhere to write the call notes')
      await notes.fill('Journey: customer asked for a repair status update.')

      const wrap = page.getByRole('button', { name: /Save & Wrap Up/i })
      await assertEnabled(wrap, page, ctx, 'call centre: "Save & Wrap Up"')
      await wrap.click()

      // A wrapped-up call is only wrapped up if it is on the log afterwards.
      await open(page, ctx, '/call-center/logs')
      await settled(page)
      await until(
        page,
        (needle) => document.body.innerText.includes(needle),
        caller,
        `call centre: the call with ${caller} was wrapped up but does not appear in the call log — the disposition was not recorded anywhere`,
        ctx,
      )
    },
  },

  {
    id: 'kiosk',
    path: 'Kiosk',
    role: 'frontdesk',
    surfaces: ['kiosk'],
    /** A walk-in checks themselves in at the branch kiosk.
     *
     *  The kiosk device is signed in as the branch (`frontdesk` holds
     *  `kiosk: vcex`); the person using it is the walk-in customer.
     *
     *  Identification is the first step and it is a real one: the kiosk asks
     *  for a phone number or a plate precisely so it can put *that person's*
     *  vehicles in front of them. The journey identifies with a plate the
     *  workshop does not know, because that is the case with an unambiguous
     *  right answer — a kiosk must not answer an unknown identifier with
     *  somebody else's cars. No fixture value is asserted, only the relation
     *  between what was typed and what was offered. */
    async run(page, ctx) {
      await open(page, ctx, '/kiosk-check-in')
      await present(
        page.getByRole('heading', { name: /Self Check-In/i }),
        ctx,
        'kiosk: the self check-in screen did not render',
      )
      await present(
        page.getByRole('heading', { name: /Identify Yourself/i }),
        ctx,
        'kiosk: the check-in does not start by identifying the walk-in',
      )

      // A plate no vehicle in the workshop carries.
      const unknownPlate = `ZZZ ${String(Date.now()).slice(-4)}`
      await page.getByLabel(/License Plate/i).fill(unknownPlate)

      const find = page.getByRole('button', { name: /Find My Vehicle/i })
      await assertEnabled(find, page, ctx, 'kiosk step 1: "Find My Vehicle"')
      await find.click()

      await until(
        page,
        () => /Select Your Vehicle/i.test(document.body.innerText),
        null,
        'kiosk step 1: identifying by plate did not advance to the vehicle step',
        ctx,
      )

      // What the kiosk offers has to follow from what was typed.
      const offered = await page
        .getByRole('heading', { name: /Select Your Vehicle/i })
        .locator('xpath=ancestor::*[1]/following-sibling::*[1]')
        .locator('button')
        .allInnerTexts()
      const strangers = offered
        .map((t) => t.replace(/\s+/g, ' ').trim())
        .filter((t) => t && !t.includes(unknownPlate))
      await must(
        ctx,
        strangers.length === 0,
        `kiosk step 2: identifying as "${unknownPlate}" — a plate the workshop does not hold — still offered ${strangers.length} vehicle(s) belonging to someone else (${strangers.join(' | ')}). ` +
          'The identify step performs no lookup: the vehicle list is a hardcoded pair in KioskCheckIn.tsx, shown to every walk-in whatever they type. There is no customer-or-vehicle lookup behind the kiosk to complete this journey with.',
      )

      // Beyond the gap above: pick the vehicle, pick a service, check in, and
      // the walk-in must land on the workshop's board.
      await page.getByRole('button').filter({ hasText: unknownPlate }).first().click()
      await until(
        page,
        () => /Select Service/i.test(document.body.innerText),
        null,
        'kiosk step 2: choosing the vehicle did not advance to the service step',
        ctx,
      )

      const services = page.getByRole('button').filter({ hasText: /Oil Change|Full Service|Brake/i })
      await present(services, ctx, 'kiosk step 3: no services were offered')
      await services.first().click()

      const confirm = page.getByRole('button', { name: /Confirm Check-In/i })
      await assertEnabled(confirm, page, ctx, 'kiosk step 3: "Confirm Check-In"')
      await confirm.click()

      await until(
        page,
        () => /Check-In Complete/i.test(document.body.innerText),
        null,
        'kiosk step 4: the check-in never completed',
        ctx,
        25_000,
      )

      await open(page, ctx, '/appointments')
      await settled(page)
      await assertNoRefusal(page, ctx, 'appointments board after kiosk check-in')
      await until(
        page,
        (needle) => document.body.innerText.includes(needle),
        unknownPlate,
        `kiosk: the walk-in checked in but ${unknownPlate} is not on the workshop's appointment board — the check-in reached nobody`,
        ctx,
      )
    },
  },

  {
    id: 'crm-lead-conversion',
    path: 'CRM lead conversion',
    role: 'advisor',
    surfaces: ['app'],
    /** An advisor works the pipeline, opens a lead and converts it into an
     *  opportunity.
     *
     *  Conversion is a single server transaction (`POST /crm/leads/:id/convert`)
     *  that creates the opportunity and moves the lead to `converted`. Both
     *  halves are asserted: the opportunity has to exist afterwards and the lead
     *  has to have left the open pipeline. Asserting only the toast would pass
     *  on a screen that told a comfortable lie. */
    async run(page, ctx) {
      await open(page, ctx, '/lead-pipeline')
      await settled(page)
      await assertNoRefusal(page, ctx, 'lead pipeline')

      await present(
        page.getByRole('heading', { name: 'Lead Pipeline' }),
        ctx,
        'lead pipeline: the pipeline screen did not render',
      )
      const board = await page.locator('body').innerText()
      await must(
        ctx,
        /Open Pipeline/i.test(board) && /(SAR|ر\.س)/.test(board),
        'lead pipeline: the board shows no open-pipeline value, so there is no pipeline to work',
      )

      // Any lead still in the open pipeline will do — the journey must not
      // depend on which one.
      const leadCard = page
        .locator('button')
        .filter({ has: page.locator('span.font-mono') })
        .filter({ hasText: /SAR|ر\.س/ })
      await present(
        leadCard,
        ctx,
        'lead pipeline: no lead cards on the board, so there is no lead to convert',
      )
      const leadName = (await leadCard.first().innerText()).split('\n')[0].trim()
      await leadCard.first().click()

      await until(
        page,
        () => location.pathname === '/lead-detail',
        null,
        'lead pipeline: opening a lead card did not reach the lead detail screen',
        ctx,
      )
      await settled(page)
      await assertNoRefusal(page, ctx, 'lead detail')

      const convert = page.getByRole('button', { name: /Convert to Opportunity/i })
      await present(
        convert,
        ctx,
        `lead detail: "${leadName}" offers no "Convert to Opportunity" action, so the advisor cannot convert the lead`,
      )
      await convert.first().click()

      const dialog = page.getByRole('dialog')
      await until(
        page,
        () => /Convert to Opportunity/i.test(document.body.innerText),
        null,
        'lead detail: the convert dialog did not open',
        ctx,
      )

      const submit = dialog.getByRole('button', { name: /^Convert$/ })
      await assertEnabled(submit, page, ctx, 'convert dialog: "Convert"')
      await submit.click()

      // The server's transaction, seen from the outside: the opportunity list
      // is where the new record now lives.
      await until(
        page,
        () => location.pathname === '/opportunities',
        null,
        async () =>
          'convert: the conversion did not complete — the app stayed on the lead. ' +
          `The dialog said: ${await complaints(page)}`,
        ctx,
        25_000,
      )
      await settled(page)
      await assertNoRefusal(page, ctx, 'opportunities')
      await until(
        page,
        (needle) => document.body.innerText.includes(needle),
        leadName,
        `convert: "${leadName}" was converted but no opportunity for that lead appears on /opportunities`,
        ctx,
      )

      // And the other half of the same transaction: the lead has left the open
      // pipeline.
      await open(page, ctx, '/lead-pipeline')
      await settled(page)
      const after = page
        .locator('button')
        .filter({ has: page.locator('span.font-mono') })
        .filter({ hasText: leadName })
      await must(
        ctx,
        (await after.count()) === 0,
        `convert: "${leadName}" is still sitting in the open pipeline after being converted — the lead's stage did not move`,
      )
    },
  },
]
