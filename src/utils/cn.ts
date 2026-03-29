/**
 * Utilitários gerais da aplicação.
 */

/**
 * Combina classes CSS de forma condicional.
 * Similar ao clsx mas sem dependência externa.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Formata o nome completo do trabalho escolar.
 */
export function formatSchoolWork(subject: string, grade: string): string {
  return `${subject} – ${grade}`
}
