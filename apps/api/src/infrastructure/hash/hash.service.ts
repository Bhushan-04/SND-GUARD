import { createHash } from 'crypto';

export class HashService {
  canonicalize(content: unknown): string {
    if (content === null || typeof content !== 'object' || Array.isArray(content)) {
      return JSON.stringify(content);
    }
    const sorted = Object.keys(content as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = (content as Record<string, unknown>)[key];
        return acc;
      }, {});
    return JSON.stringify(sorted);
  }

  hashContent(content: unknown): string {
    const canonical = this.canonicalize(content);
    return createHash('sha256').update(canonical).digest('hex');
  }
}
