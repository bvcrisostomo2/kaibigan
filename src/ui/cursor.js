// A list cursor that wraps at both ends (menus, choice lists, Journal tabs).
export function wrapIndex(i, n) {
  return n > 0 ? ((i % n) + n) % n : 0;
}
