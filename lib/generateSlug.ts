/**
 * Generates a URL-friendly slug from a string
 * Example: "LayerZero Airdrop 2024!" -> "layerzero-airdrop-2024"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace special characters with their equivalents
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Remove any character that isn't alphanumeric, space, or hyphen
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug by appending a short ID suffix
 * This ensures uniqueness even if titles are the same
 */
export function generateUniqueSlug(text: string, id?: string): string {
  const baseSlug = generateSlug(text);
  
  // If we have an ID, append last 6 characters for uniqueness
  if (id) {
    const shortId = id.toString().slice(-6);
    return `${baseSlug}-${shortId}`;
  }
  
  return baseSlug;
}

export default generateSlug;
