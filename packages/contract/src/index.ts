/** `@salis/contract` — the one place a shape is defined.
 *
 *  A schema here is simultaneously the API type, the server's request guard and
 *  the client's form validator. Import it from both sides; do not re-declare a
 *  shape that already lives here, because the second declaration is the one
 *  that will drift. */
export * from './primitives'
export * from './envelope'
export * from './rbac'
export * from './entities'
export * as rules from './rules'
