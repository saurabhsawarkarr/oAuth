/**
 * Secret Redaction Engine
 * Scans strings and objects to scrub high-entropy credentials, tokens, and client secrets.
 */

const SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Google / Generic Client Secrets
  { regex: /(client_secret[_\s:=]+)[\w\-_]{20,}/gi, replacement: '$1[REDACTED_CLIENT_SECRET]' },
  { regex: /GOCSPX-[\w\-_]{28,}/g, replacement: '[REDACTED_GOOGLE_CLIENT_SECRET]' },

  // GitHub Personal Access Tokens & App Secrets
  { regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g, replacement: '[REDACTED_GITHUB_TOKEN]' },

  // Slack Tokens
  { regex: /xox[baprs]-[0-9A-Za-z\-]{24,}/g, replacement: '[REDACTED_SLACK_TOKEN]' },

  // Generic Bearer / JWT Tokens
  { regex: /Bearer\s+eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, replacement: 'Bearer [REDACTED_JWT_TOKEN]' },

  // Stripe Live Keys
  { regex: /sk_live_[A-Za-z0-9]{20,}/g, replacement: '[REDACTED_SECRET]' },

  // Generic API Keys / Secrets assignment
  { regex: /(secret|token|api_key|client_secret)["'\s:=]+[A-Za-z0-9_\-]{20,}/gi, replacement: '$1: "[REDACTED_SECRET]"' },
];

/**
 * Redacts any detected secrets from a string
 */
export function sanitizeText(text: string): string {
  if (!text) return text;
  let sanitized = text;
  for (const { regex, replacement } of SECRET_PATTERNS) {
    sanitized = sanitized.replace(regex, replacement);
  }
  return sanitized;
}

/**
 * Deeply sanitizes any object or array recursively
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }
  return obj;
}
