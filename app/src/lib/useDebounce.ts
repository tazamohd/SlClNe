import { useEffect, useState } from 'react'

/** A value that trails its source by `ms`, so a search box can filter on the
 *  settled term rather than on every keystroke. */
export function useDebounce<T>(value: T, ms = 250): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return settled
}
