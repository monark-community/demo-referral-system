/** Replace {placeholders} in a dictionary string. Client-safe (no dictionaries imported). */
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

/** Pick "one" or "other" by count. */
export function plural(count: number, forms: { one: string; other: string }, vars: Record<string, string | number> = {}): string {
  return t(count === 1 ? forms.one : forms.other, { count, ...vars })
}
