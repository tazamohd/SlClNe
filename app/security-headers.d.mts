/** Types for `security-headers.mjs`.
 *
 *  The header table is a plain `.mjs` module so that Node scripts, the Vite
 *  config and the generator can all import it without a build step. This
 *  declaration is what lets `vite.config.ts` do so under `tsc --noEmit`.
 */
export declare const SECURITY_HEADERS: Record<string, string>
export declare const HEADER_NAMES: string[]
