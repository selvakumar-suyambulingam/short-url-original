/**
 * Generates a short identifier string.
 *
 * This function creates a random string of alphanumeric characters.
 * It's primarily used for generating short IDs for URL shortening services.
 *
 * @param {number} [length=6] - The length of the generated string.
 * @returns {string} The generated short identifier.
 */
export function generateShortId(length: number = 6): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
