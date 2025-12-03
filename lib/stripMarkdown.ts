/**
 * Strips markdown formatting from text for use in previews/cards
 * Removes images, links (keeps text), headers, bold, italic, etc.
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Remove images: ![alt](url) or ![alt]
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]/g, '')
    // Remove links but keep text: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove headers: # ## ### etc
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove code blocks: ```code``` or `code`
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes: > text
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules: --- or ***
    .replace(/^[-*]{3,}\s*$/gm, '')
    // Remove list markers: - or * or 1.
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up multiple spaces and newlines
    .replace(/\n{2,}/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default stripMarkdown;
