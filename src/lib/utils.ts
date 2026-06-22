/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

/**
 * Ensure slug is unique by appending number if needed
 */
export async function ensureUniqueSlug(
  slug: string,
  checkExists: (slug: string) => Promise<boolean>,
  originalSlug?: string
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (await checkExists(uniqueSlug)) {
    // If this is the original slug (during update), allow it
    if (originalSlug && uniqueSlug === originalSlug) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Convert BigInt to string for JSON serialization
 */
export function bigIntToString(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(bigIntToString);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = bigIntToString(obj[key]);
    }
    return converted;
  }

  return obj;
}

/**
 * Format a Date object into a readable string (e.g., "Jan 15, 2026")
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Estimate reading time for a given text content (in minutes)
 * Assumes average reading speed of 200 words per minute.
 */
export function readingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/g).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}
