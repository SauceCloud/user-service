import { ValidationCode } from '../constants/validation-codes.enum'

export function vmsg(code: ValidationCode): string {
  return JSON.stringify({ code })
}

export function tryParseCode(message?: unknown): string | null {
  if (typeof message !== 'string') return null
  try {
    const parsed = JSON.parse(message)
    if (parsed && typeof parsed.code === 'string') return parsed.code
    return null
  } catch {
    return null
  }
}
