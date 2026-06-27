export const AUTH_SESSION_COOKIE_NAME = "pr_session"
export const AUTH_SESSION_TTL_DAYS = 30
export const WEBAUTHN_CHALLENGE_TTL_MINUTES = 5

// Minimum gap between `last_seen_at` writes for an active session, to avoid a
// database write on every authenticated request.
export const SESSION_LAST_SEEN_THROTTLE_MINUTES = 60
