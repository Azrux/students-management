// Centralizes feature flags read from env, so gated features (like the
// public marketplace: teacher directory, open messaging, self-service
// student sign-up without an invite) can be flipped on later without
// touching every call site.
//
// Phase 1: teachers invite students directly (MARKETPLACE_ENABLED unset/false).
// Phase 2: flip MARKETPLACE_ENABLED=true to open the public directory + messaging.
export function isMarketplaceEnabled(): boolean {
  return process.env.MARKETPLACE_ENABLED === "true";
}
