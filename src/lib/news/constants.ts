/** Stories older than this are dropped. */
export const STORY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Default cache TTL before background/cron refresh (6 hours). */
export const STORY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const STORY_FETCH_TIMEOUT_MS = 10_000;

export const STORY_USER_AGENT =
  "RippleIntel/1.0 (+https://ripple-ruby.vercel.app; supply-chain-risk)";
