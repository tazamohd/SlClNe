/** The stack of things Android's back button should close before it navigates.
 *
 *  Back on Android is not "go to the previous URL" — it is "undo the last thing
 *  that appeared". With a modal open, back closes the modal; with the nav
 *  drawer open, back closes the drawer; only with nothing on top does it become
 *  a navigation, and only on a root screen does it leave the app.
 *
 *  Every dismissible layer registers a handler while it is open and drops it
 *  when it closes, so the top of this stack is always the most recently opened
 *  one. That is the same ordering the Escape key already gets for free from
 *  each layer's own `keydown`; this exists because a hardware button has no
 *  keyboard event to piggyback on.
 *
 *  Deliberately a plain module rather than a context: `Modal` renders through a
 *  portal, `AppShell`'s drawer does not, and the search palette is mounted from
 *  the header — a provider they all sit under would have to wrap the router
 *  above every one of them, and layers opened from outside React (there are
 *  none today, but a native plugin callback is exactly that) could not reach it.
 */

type BackHandler = () => void

const stack: BackHandler[] = []

/** Register `handler` as the topmost dismissible layer. Call the returned
 *  function when the layer closes — including when it closes by some route
 *  other than back, which is the common case. Removal is by identity, not by
 *  popping, so layers that close out of order still unregister correctly. */
export function pushBackHandler(handler: BackHandler): () => void {
  stack.push(handler)
  return () => {
    const at = stack.lastIndexOf(handler)
    if (at !== -1) stack.splice(at, 1)
  }
}

/** Close the topmost layer, if there is one.
 *
 *  Returns whether it handled the press, which is what tells the caller not to
 *  navigate. The handler is removed from the stack by its own cleanup when the
 *  layer unmounts, not here — a handler that decides to stay open (an unsaved
 *  form asking for confirmation) stays on top, where it belongs. */
export function handleBack(): boolean {
  const top = stack[stack.length - 1]
  if (!top) return false
  top()
  return true
}

/** How many layers are open. Exists for tests — nothing in the app should
 *  branch on it, because "is anything open" is not a question a screen can
 *  answer correctly about layers it does not own. */
export function openLayerCount(): number {
  return stack.length
}

/** Empties the stack. Only the tests need this; a leaked handler between two
 *  test cases would otherwise make the next one's first back press a no-op. */
export function resetBackStackForTests(): void {
  stack.length = 0
}
