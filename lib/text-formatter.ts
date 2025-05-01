/**
 * Text formatting utilities for the application
 */

/**
 * Special marker used to identify styled text for the renderer
 */
const STYLE_MARKER = {
  BOLD_START: '{{BOLD_START}}',
  BOLD_END: '{{BOLD_END}}',
};

/**
 * Parse markdown formatting and replace with our custom markers for styling
 */
export const parseMarkdownFormatting = (text: string): string => {
  if (!text) return '';

  // First process heading symbols (# ## ### etc.)
  let processedText = text
    .replace(/^####\s+(.*?)$/gm, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`)
    .replace(/^###\s+(.*?)$/gm, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`)
    .replace(/^##\s+(.*?)$/gm, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`)
    .replace(/^#\s+(.*?)$/gm, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`);
    
  // Process bold/emphasis formatting
  processedText = processedText
    .replace(/\*\*(.*?)\*\*/g, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`)
    .replace(/\*(.*?)\*/g, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`)
    .replace(/__(.*?)__/g, `${STYLE_MARKER.BOLD_START}$1${STYLE_MARKER.BOLD_END}`);
  
  // Process form fields - keep labels and values on the same line
  processedText = processedText
    // Fix form labels followed by newlines
    .replace(/([А-Яа-яA-Za-z]+\s*:)(\s*\n+)(\s*)/gm, '$1 ')
    // Fix numbered items with colons followed by newlines
    .replace(/(\d+\.\s*[А-Яа-яA-Za-z]+\s*:)(\s*\n+)(\s*)/gm, '$1 ');
  
  // Make category headers bold
  processedText = processedText.replace(/(\n|^)([А-Яа-я]+)(\s*:)/gm, 
    `$1${STYLE_MARKER.BOLD_START}$2${STYLE_MARKER.BOLD_END}$3`);
    
  // Make numbered list markers bold
  processedText = processedText.replace(/(\n|^)(\d+\.)/gm, 
    `$1${STYLE_MARKER.BOLD_START}$2${STYLE_MARKER.BOLD_END}`);

  return processedText;
};

/**
 * Removes all markdown formatting from text
 * Use this when you want to completely strip formatting
 */
export const removeMarkdownFormatting = (text: string): string => {
  if (!text) return '';

  // Replace markdown patterns
  return text
    // Remove heading markers
    .replace(/^###\s+/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/^#\s+/gm, '')
    // Bold text (remove double asterisks)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Italic text (remove single asterisks)
    .replace(/\*(.*?)\*/g, '$1')
    // Remove other markdown patterns
    .replace(/__(.*?)__/g, '$1')
    .replace(/~~(.*?)~~/g, '$1');
};

/**
 * Formats text for display in UI components with styling
 */
export const formatTextForDisplay = (text: string): string => {
  // Use the parser that preserves styling information
  return parseMarkdownFormatting(text);
};

export default {
  parseMarkdownFormatting,
  removeMarkdownFormatting,
  formatTextForDisplay,
  STYLE_MARKER,
}; 