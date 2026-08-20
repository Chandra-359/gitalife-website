/**
 * spam.ts — heuristics for the registration spam wave (client-safe).
 *
 * The bots hitting the public forms sign up with single-token
 * random-case names ("ILVXxVnaThHUxWONGsn"), often paired with
 * dot-riddled gmail addresses ("s.t.e.v.enhe.ns.ell18.2.4@gmail.com").
 * Real names — including long single-token Indian names — have at most
 * a couple of case changes, so requiring MANY case flips keeps false
 * positives out ("Balasubramaniam" has one flip; the bots have 5+).
 *
 * Used by the admin purge endpoint (server) and the admin consoles
 * (client) so the preview list always matches what gets deleted.
 * Deletion is always behind an admin confirm — the heuristic proposes,
 * a human disposes.
 */

/** Single alphabetic token, 12+ chars, with 5+ upper/lower flips. */
export function isSpamName(name: string): boolean {
  const t = name.trim();
  if (!/^[A-Za-z]{12,}$/.test(t)) return false;
  let flips = 0;
  for (let i = 1; i < t.length; i++) {
    const prevUpper = t[i - 1] >= "A" && t[i - 1] <= "Z";
    const curUpper = t[i] >= "A" && t[i] <= "Z";
    if (prevUpper !== curUpper) flips++;
  }
  return flips >= 5;
}

/** Gmail-dot-trick style address: 4+ dots before the @. */
export function isSpamEmail(email: string): boolean {
  const local = email.split("@")[0] ?? "";
  return (local.match(/\./g) ?? []).length >= 4;
}

export function isSpamRegistration(name: string, email: string): boolean {
  return isSpamName(name) || isSpamEmail(email);
}
