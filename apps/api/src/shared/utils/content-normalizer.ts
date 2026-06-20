/**
 * Converts plain-text facts like "Transaction Limit = $10K" into structured JSON.
 */
export function normalizeContent(content: unknown): Record<string, unknown> {
  if (typeof content === 'string') {
    const trimmed = content.trim();
    const match = trimmed.match(/^(.+?)\s*=\s*(.+)$/);
    if (match) {
      const key = toCamelCase(match[1].trim());
      return { [key]: match[2].trim() };
    }
    return { fact: trimmed };
  }

  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    return content as Record<string, unknown>;
  }

  throw new Error('Content must be a JSON object or plain-text key=value string');
}

function toCamelCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^./, (char) => char.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

export function getFactValue(content: Record<string, unknown>, key: string): unknown {
  if (key in content) {
    return content[key];
  }
  const camelKey = toCamelCase(key);
  return content[camelKey];
}
