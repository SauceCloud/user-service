export const isEqualIgnoreCase = (a?: string, b?: string): boolean => {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}
