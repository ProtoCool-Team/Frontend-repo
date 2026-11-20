// Funcții mici folosite în mai multe componente.

/**
 * Adaugă valoarea în listă dacă lipsește sau o scoate dacă există deja.
 * Folosită la căsuțele de filtrare (status, categorie).
 * @param {Array} list Lista curentă (nu e modificată).
 * @param {*} value Valoarea bifată sau debifată.
 * @return {Array} O listă nouă.
 */
export function toggle(list, value) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
