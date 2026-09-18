/** Local-disk storage for inspection-media evidence.
 *
 *  No object-storage adapter exists anywhere in this codebase yet — no S3, no
 *  MinIO, no `StorageAdapter` interface a route could target. Rather than
 *  fabricate a "connected" cloud bucket the way `AccountingIntegration.tsx`
 *  once claimed a sync that never ran, uploaded bytes are written to a real
 *  directory on disk and streamed back from it. This is a genuine, working
 *  implementation, not a stub: a file saved here is a file a technician's
 *  browser actually retrieves. It is also honestly scoped — a single-disk
 *  store does not survive losing that disk, which is why `MEDIA_STORAGE_DIR`
 *  is a setting rather than a hardcoded path: a deployment points it at a
 *  mounted, backed-up volume, and swapping in an object-storage adapter later
 *  means replacing this module, not the routes that call it.
 *
 *  Every file lives under `<dir>/<orgId>/<ulid>.<ext>` — the org segment is
 *  belt-and-braces against a path ever being guessable across tenants, on top
 *  of the `storageKey` itself never being returned to a client (routes serve
 *  bytes through `GET /inspection-media/:id/file`, gated the same way the
 *  row is).
 */
import { createReadStream } from 'node:fs'
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import type { ReadStream } from 'node:fs'
import { ulid } from 'ulid'
import { INSPECTION_MEDIA_MAX_BYTES, INSPECTION_MEDIA_MIME_TYPES, type InspectionMediaKind } from '@salis/contract'
import { badRequest } from '../http/errors'

const EXTENSION_FOR_MIME: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

/** Which DVHC media kind a mime type belongs to, or throws — the allowlist in
 *  `INSPECTION_MEDIA_MIME_TYPES` is the whole set this store accepts. */
export function mediaKindForMimeType(mimeType: string): InspectionMediaKind {
  for (const [kind, types] of Object.entries(INSPECTION_MEDIA_MIME_TYPES) as [InspectionMediaKind, readonly string[]][]) {
    if (types.includes(mimeType)) return kind
  }
  throw badRequest(
    `"${mimeType}" is not an accepted photo or video type.`,
    'file',
  )
}

export function maxBytesFor(kind: InspectionMediaKind): number {
  return INSPECTION_MEDIA_MAX_BYTES[kind]
}

export interface MediaStore {
  /** Writes `bytes` and returns the key a row should keep — never a path a
   *  client sees. */
  save(args: { orgId: string; mimeType: string; bytes: Buffer }): Promise<{ storageKey: string; sizeBytes: number }>
  /** A stream of the file's bytes, for `reply.send(stream)`. */
  read(storageKey: string): Promise<ReadStream>
  /** Best-effort; a row is the fact, the file is what it points to. Never
   *  called in a way whose failure blocks a response. */
  remove(storageKey: string): Promise<void>
}

/** Resolves a configured `MEDIA_STORAGE_DIR` (relative or absolute) against
 *  the server package root, the same way `env.ts` resolves `.env`. */
function resolveDir(configuredDir: string): string {
  const here = new URL('.', import.meta.url).pathname
  const packageRoot = resolve(here, '..', '..')
  return isAbsolute(configuredDir) ? configuredDir : resolve(packageRoot, configuredDir)
}

export function createLocalMediaStore(configuredDir: string): MediaStore {
  const root = resolveDir(configuredDir)

  return {
    async save({ orgId, mimeType, bytes }) {
      const extension = EXTENSION_FOR_MIME[mimeType]
      if (!extension) throw badRequest(`"${mimeType}" is not an accepted photo or video type.`, 'file')
      const dir = join(root, orgId)
      await mkdir(dir, { recursive: true })
      const filename = `${ulid()}.${extension}`
      await writeFile(join(dir, filename), bytes, { mode: 0o600 })
      return { storageKey: `${orgId}/${filename}`, sizeBytes: bytes.byteLength }
    },

    async read(storageKey) {
      const path = safePath(root, storageKey)
      await stat(path)
      return createReadStream(path)
    },

    async remove(storageKey) {
      try {
        await unlink(safePath(root, storageKey))
      } catch {
        /* Already gone, or never written — the row being deleted is the fact
         * that matters; a missing file underneath it is not an error here. */
      }
    },
  }
}

/** Refuses a `storageKey` that tries to escape `root` — defence in depth
 *  alongside the fact that `storageKey` is server-generated and never taken
 *  from a request. */
function safePath(root: string, storageKey: string): string {
  const resolved = resolve(root, storageKey)
  if (resolved !== root && !resolved.startsWith(`${root}/`)) {
    throw badRequest('Invalid storage key.', 'storageKey')
  }
  return resolved
}
